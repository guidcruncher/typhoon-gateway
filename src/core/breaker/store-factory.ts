// src/core/breaker/store-factory.js

import { getMemCachedClient } from "@/core/clients/memcached.js"
import { getRedisClient } from "@/core/clients/redis.js"

import { MemcachedCircuitBreakerStore } from "./stores/memcached.js"
import { MemoryCircuitBreakerStore } from "./stores/memory.js"
import { RedisCircuitBreakerStore } from "./stores/redis.js"

export function createCircuitBreakerStore(opts: any) {
  switch (opts.kind) {
    case "redis":
      return new RedisCircuitBreakerStore(getRedisClient())

    case "memcached":
      return new MemcachedCircuitBreakerStore(getMemCachedClient())

    case "memory":
    default:
      return new MemoryCircuitBreakerStore()
  }
}
