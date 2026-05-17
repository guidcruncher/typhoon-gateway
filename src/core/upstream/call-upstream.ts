// src/core/upstream/call-upstream.ts

import type { FastifyRequest } from "fastify"

import type { BreakerFactory } from "@/core/breaker/types.js"
import { buildCanonicalKey } from "@/core/key/build-canonical-key.js"
import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

export interface UpstreamCallerDeps {
  collapse: {
    get: (key: string) => Promise<any | undefined>
    set: (key: string, promise: Promise<any>) => void
  }
  breakerFactory?: BreakerFactory
  retry: {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
    retryOn: number[]
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
  const { collapse, breakerFactory, retry, httpClient } = deps

  const key = buildCanonicalKey(req, service.name, route.path)

  const inFlight = await collapse.get(key)
  if (inFlight) return inFlight

  // -----------------------------------------
  // 🔥 LEGACY MODE: breakerFactory undefined
  // -----------------------------------------
  const breaker = breakerFactory
    ? breakerFactory.create(service, route)
    : {
        canRequest: async () => true,
        recordSuccess: async () => {},
        recordFailure: async () => {},
      }

  const promise = (async () => {
    // Skip breaker check if in legacy mode
    if (!(await breaker.canRequest())) {
      throw new Error("CircuitBreakerOpen")
    }

    let attempt = 0
    let lastError: any

    while (attempt <= retry.maxRetries) {
      try {
        const upstreamRes = await httpClient.request({
          method: req.method,
          url: upstreamUrl + req.url.replace(service.prefix, ""),
          headers: req.headers,
          body: req.body,
          timeout: service.upstreamTimeoutMs ?? 10_000,
        })

        await breaker.recordSuccess()
        return upstreamRes
      } catch (err: any) {
        lastError = err

        const status = err?.response?.statusCode
        const shouldRetry = status && retry.retryOn.includes(status)

        if (!shouldRetry || attempt === retry.maxRetries) {
          await breaker.recordFailure()
          throw err
        }

        const delay = Math.min(retry.baseDelayMs * Math.pow(2, attempt), retry.maxDelayMs)

        await new Promise((r) => setTimeout(r, delay))
        attempt++
      }
    }

    throw lastError
  })()

  collapse.set(key, promise)
  return promise
}
