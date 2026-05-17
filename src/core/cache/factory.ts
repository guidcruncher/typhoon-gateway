import { Redis } from "ioredis"

import type { CacheConfig } from "@/core/manifest/types.js"

import { MemcachedStore } from "./memcached-store.js"
import { MemoryCacheStore } from "./memory-store.js"
import { NoopCacheStore } from "./noop-store.js"
import { RedisCacheStore } from "./redis-store.js"
import type { ICacheStore } from "./types.js"

export class CacheManager {
  static createCacheStore(cfg?: CacheConfig): ICacheStore {
    if (!cfg?.enabled) return new NoopCacheStore()

    switch (cfg.backend ?? "none") {
      case "memory":
        return new MemoryCacheStore()

      case "redis":
        return new RedisCacheStore(new Redis(cfg.redisUrl!))

      case "memcached":
        return new MemcachedStore()

      case "none":
      default:
        return new NoopCacheStore()
    }
  }
}

export const createCacheStore = (cfg?: CacheConfig): ICacheStore => {
  return CacheManager.createCacheStore(cfg)
}
