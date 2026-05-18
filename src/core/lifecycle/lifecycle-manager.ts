// src/core/lifecycle/lifecycle-manager.ts

import type { FastifyReply, FastifyRequest } from "fastify"

import { fastJsonParse } from "@/core/json/simdjson.js"
import {
  inferTransformerMode,
  runRequestTransformers,
  runResponseTransformers,
} from "@/core/transformers/registry.js"

export class LifecycleManager {
  constructor(
    private fastify: any,
    private service: any,
    private route: any,
    private breaker: any,
    private cacheStore: any,
  ) {}

  private transformersNeedBody(): boolean {
    const list = this.route.transformers?.onResponse ?? []
    if (!list.length) return false
    return list.some((t: any) => (t.mode ?? inferTransformerMode(null)) !== "stream")
  }

  private buildCacheKey(req: FastifyRequest) {
    const url = req.raw.url || ""
    const method = req.method
    return `${method}:${url}`
  }

  async handle(req: FastifyRequest, reply: FastifyReply, upstreamRes: Response) {
    const { route, service, breaker, cacheStore } = this
    const correlationId = req.id as string

    //
    // 1. Request transformers
    //
    await runRequestTransformers(route.transformers, req, service, route)

    //
    // 2. Breaker check
    //
    if (breaker && !breaker.canRequest()) {
      reply.status(503).send({
        status: 503,
        error: "Service Unavailable",
        message: "Circuit breaker open",
        correlationId,
      })
      return
    }

    //
    // 3. Cache lookup
    //
    const cacheKey = this.buildCacheKey(req)
    if (cacheStore) {
      const cached = await cacheStore.get(cacheKey)
      if (cached) {
        reply.header("x-typhon-cache", "HIT")
        reply.send(JSON.parse(cached))
        breaker?.recordSuccess()
        return
      }
    }

    //
    // 4. Forward status + headers
    //
    reply.status(upstreamRes.status)
    upstreamRes.headers.forEach((v, k) => reply.header(k, v))

    //
    // 5. Decide streaming vs buffering
    //
    const contentType = upstreamRes.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")
    // const needBody = isJson && this.transformersNeedBody()

    //
    // 6. Buffer + transform path
    //
    if (isJson) {
      const raw = Buffer.from(await upstreamRes.arrayBuffer())
      let payload = fastJsonParse(raw)

      payload = await runResponseTransformers(route.transformers, payload, service, route)

      if (cacheStore) {
        const ttl = route.cache?.ttlSeconds ?? service.cache?.ttlSeconds ?? 60
        await cacheStore.set(cacheKey, JSON.stringify(payload), ttl)
      }

      reply.send(payload)
      breaker?.recordSuccess()
      return
    }

    //
    // 7. Non-JSON → buffer once
    //
    const buffer = Buffer.from(await upstreamRes.arrayBuffer())
    reply.send(buffer)
    breaker?.recordSuccess()
  }
}
