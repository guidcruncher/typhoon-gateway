// src/core/upstream/call-upstream.ts
import type { FastifyRequest } from "fastify"

import type { BreakerFactory } from "@/core/breaker/types.js"
import { classifyUpstreamError } from "@/core/errors/classify-upstream-error.js"
import { buildCanonicalKey } from "@/core/key/build-canonical-key.js"
import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

export interface UpstreamCallerDeps {
  collapse: {
    get: (key: string) => Promise<any> | undefined
    set: (key: string, promise: Promise<any>) => void
  }
  breakerFactory?: BreakerFactory
  retry: {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
    retryOn: number[]
  }
  breaker: {
    failureThreshold: number
    successThreshold: number
    openStateDurationMs: number
    halfOpenMaxConcurrent: number
  }
  cache: {
    enabled: boolean
    ttlMs: number
    keyStrategy: "canonical" | "full-url" | "headers"
    varyHeaders: string[]
  }
  canary?: {
    enabled: boolean
    weight: number // 0–100
    target: string
    version?: string
  }
  httpClient: {
    request: (opts: {
      method: string
      url: string
      headers: any
      body: any
      timeout: number
    }) => Promise<any>
  }
}

export async function callUpstream(
  req: FastifyRequest,
  service: ServiceConfig,
  route: RouteConfig,
  upstreamUrl: string,
  deps: UpstreamCallerDeps,
) {
  const {
    collapse,
    breakerFactory,
    retry,
    breaker: breakerPolicy,
    cache,
    httpClient,
    canary,
  } = deps

  //
  // ────────────────────────────────────────────────────────────
  //  Canary routing: choose primary vs canary target
  // ────────────────────────────────────────────────────────────
  //
  let effectiveUrl = upstreamUrl
  let isCanary = false

  if (canary?.enabled && canary.weight > 0) {
    if (canary.weight >= 100) {
      effectiveUrl = canary.target
      isCanary = true
    } else {
      const roll = Math.random() * 100
      if (roll < canary.weight) {
        effectiveUrl = canary.target
        isCanary = true
      }
    }
  }

  const canonicalKey = buildCanonicalKey(req, service.name, route.path)
  const stats = req.server.stats
  const logBase = {
    correlationId: req.correlationId,
    service: service.name,
    route: route.path,
    upstreamUrl: effectiveUrl,
    canary: isCanary,
    canaryVersion: canary?.version,
  }
  const metric = (name: string) => `gateway.upstream.${service.name}.${route.path}.${name}`

  if (canary?.enabled) {
    await stats?.increment(metric(isCanary ? "canary.hit" : "canary.miss"))
  }

  //
  // ────────────────────────────────────────────────────────────
  //  Collapse: hit/miss
  // ────────────────────────────────────────────────────────────
  //
  const inFlight = await collapse.get(canonicalKey)
  if (inFlight) {
    req.log.info({ ...logBase }, "collapse hit — reusing in-flight upstream request")
    await stats?.increment(metric("collapse.hit"))
    return inFlight
  }

  req.log.info({ ...logBase }, "collapse miss — starting new upstream request")
  await stats?.increment(metric("collapse.miss"))

  //
  // ────────────────────────────────────────────────────────────
  //  Cache: lookup
  // ────────────────────────────────────────────────────────────
  //
  if (cache.enabled) {
    const cacheKey = req.server.cacheStore.buildKey(req, service, route, cache)
    const cached = await req.server.cacheStore.get(cacheKey)
    if (cached) {
      req.log.info({ ...logBase, cacheKey }, "cache hit")
      await stats?.increment(metric("cache.hit"))
      return JSON.parse(cached)
    }
    req.log.info({ ...logBase, cacheKey }, "cache miss")
    await stats?.increment(metric("cache.miss"))
  }

  //
  // ────────────────────────────────────────────────────────────
  //  Breaker
  // ────────────────────────────────────────────────────────────
  //
  const breaker = breakerFactory
    ? breakerFactory.create(service, route, upstreamUrl, breakerPolicy)
    : {
        canRequest: async () => true,
        recordSuccess: async () => {},
        recordFailure: async () => {},
      }

  //
  // ────────────────────────────────────────────────────────────
  //  Main upstream call
  // ────────────────────────────────────────────────────────────
  //
  const promise = (async () => {
    if (!(await breaker.canRequest())) {
      req.log.warn({ ...logBase }, "breaker open — request blocked")
      await stats?.increment(metric("breaker.open"))
      throw classifyUpstreamError(req, { code: "CIRCUIT_OPEN" })
    }

    let attempt = 0
    const start = Date.now()

    req.log.info(
      {
        ...logBase,
        retryPolicy: retry,
        breakerPolicy,
        cachePolicy: cache,
      },
      "using resolved policies",
    )

    while (attempt <= retry.maxRetries) {
      try {
        req.log.info({ ...logBase, attempt }, "upstream request start")

        const upstreamRes = await httpClient.request({
          method: req.method,
          url: effectiveUrl,
          headers: {
            ...req.headers,
            "x-correlation-id": req.correlationId,
            ...(isCanary && canary?.version ? { "x-canary-version": canary.version } : {}),
          },
          body: req.body,
          timeout: service.upstreamTimeoutMs ?? 10_000,
        })

        const latency = Date.now() - start

        req.log.info(
          {
            ...logBase,
            attempt,
            status: upstreamRes.status,
            latencyMs: latency,
          },
          "upstream request success",
        )

        await stats?.histogram(metric("latency_ms"), latency)
        await stats?.increment(metric(`status.${upstreamRes.status}`))
        await breaker.recordSuccess()
        await stats?.increment(metric("breaker.success"))

        if (attempt > 0) {
          await stats?.increment(metric("retry.success_after_retry"))
        }

        //
        // Cache store
        //
        if (cache.enabled) {
          const cacheKey = req.server.cacheStore.buildKey(req, service, route, cache)
          await req.server.cacheStore.set(
            cacheKey,
            JSON.stringify({
              statusCode: upstreamRes.statusCode,
              headers: upstreamRes.headers,
              body: upstreamRes.data,
            }),
            cache.ttlMs,
          )
          await stats?.increment(metric("cache.store"))
        }

        return {
          statusCode: upstreamRes.status,
          headers: upstreamRes.headers,
          body: upstreamRes.data,
        }
      } catch (err: any) {
        const status = err?.response?.status
        const shouldRetry = status && retry.retryOn.includes(status)

        if (!shouldRetry || attempt === retry.maxRetries) {
          const info = classifyUpstreamError(req, err)
          req.log.error(
            {
              ...logBase,
              attempt,
              error: info.code,
              message: info.message,
            },
            "upstream request failed",
          )
          await breaker.recordFailure()
          await stats?.increment(metric("breaker.failure"))
          await stats?.increment(metric("retry.exhausted"))
          await stats?.increment(metric(`error.${info.code}`))
          throw info
        }

        const delay = Math.min(retry.baseDelayMs * Math.pow(2, attempt), retry.maxDelayMs)
        req.log.warn(
          {
            ...logBase,
            attempt,
            status,
            delay,
          },
          "upstream retry scheduled",
        )
        await stats?.increment(metric("retry.attempt"))
        await new Promise((r) => setTimeout(r, delay))
        attempt++
      }
    }
  })()

  collapse.set(canonicalKey, promise)
  return promise
}
