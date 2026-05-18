// src/core/breaker/stores/redis.ts
import type Redis from "ioredis"

import type { CircuitBreakerStore } from "../store.js"

export class RedisCircuitBreakerStore implements CircuitBreakerStore {
  /** @type {import("ioredis").default} */
  redis

  /** @param {Redis} redis */
  constructor(redis: any) {
    this.redis = redis
  }

  async getState(key: string) {
    return await this.redis.get(key)
  }

  async setState(key: string, value: string) {
    await this.redis.set(key, value)
  }

  async getNumber(key: string) {
    const raw = await this.redis.get(key)
    return raw ? Number(raw) : 0
  }

  async setNumber(key: string, value: number) {
    await this.redis.set(key, String(value))
  }

  async incr(key: string) {
    return await this.redis.incr(key)
  }

  async del(key: string) {
    await this.redis.del(key)
  }
}
