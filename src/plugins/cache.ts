// src/plugins/cache.ts
import type { FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"

import { CacheManager } from "@/core/cache/factory.js"
import type { CacheConfig } from "@/core/manifest/types.js"

export type CacheStore = ReturnType<typeof CacheManager.createCacheStore>

const cachePlugin: FastifyPluginAsync<{ cache?: CacheConfig }> = async (fastify, opts) => {
  const store = CacheManager.createCacheStore(opts.cache)
  fastify.decorate("cacheStore", store)
}

export default fp(cachePlugin)
