// src/plugins/cache.ts
import type { FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"

import { CacheManager } from "@/core/cache/factory.js"
import type { CacheBackendConfig } from "@/core/manifest/types.js"

const cachePlugin: FastifyPluginAsync<{ cache?: CacheBackendConfig }> = async (fastify, opts) => {
  // Create the backend store (memory, redis, sqlite, etc)
  const backend = CacheManager.createCacheStore(opts.cache)

  // Decorate Fastify with the unified cache interface expected by callUpstream
  fastify.decorate("cacheStore", {
    buildKey(req: any, service: any, route: any, policy: any) {
      switch (policy.keyStrategy) {
        case "full-url":
          return `cache:${req.method}:${req.url}`

        case "headers":
          const vary = policy.varyHeaders
            .map((h: string) => `${h}:${req.headers[h] ?? ""}`)
            .join("|")
          return `cache:${req.method}:${route.path}:${vary}`

        case "canonical":
        default:
          return `cache:${req.method}:${service.name}:${route.path}`
      }
    },

    async get(key: string) {
      const res = await backend.get(key)
      if (!res) return undefined
      return JSON.parse(res)
    },

    async set(key: string, value: any, ttlMs: number) {
      return backend.set(key, JSON.stringify(value), ttlMs)
    },
  })
}

export default fp(cachePlugin)
