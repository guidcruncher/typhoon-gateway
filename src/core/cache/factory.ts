import { Redis } from "ioredis"

import type { CacheBackendConfig } from "@/core/manifest/types.js"

import { MemcachedStore } from "./memcached-store.js"
import { MemoryCacheStore } from "./memory-store.js"
import { NoopCacheStore } from "./noop-store.js"
import { RedisCacheStore } from "./redis-store.js"
import { SQLiteCacheStore } from "./sqlite-store.js"
import type { ICacheStore } from "./types.js"

export class CacheManager {
  static createCacheStore(cfg?: CacheBackendConfig): ICacheStore {
    if (!cfg) return new NoopCacheStore()

    switch (cfg.backend ?? "none") {
      case "sqlite":
        return new SQLiteCacheStore()

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

export const createCacheStore = (cfg?: CacheBackendConfig): ICacheStore => {
  return CacheManager.createCacheStore(cfg)
}
