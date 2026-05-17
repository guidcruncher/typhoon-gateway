// src/core/breaker/stores/memcached.ts
import type memjs from "memjs"

import type { CircuitBreakerStore } from "../store.js"

export class MemcachedCircuitBreakerStore implements CircuitBreakerStore {
  constructor(private readonly client: memjs.Client) {}

  async getState(key: string) {
    const { value } = await this.client.get(key)
    return value ? value.toString() : null
  }

  async setState(key: string, value: string) {
    await this.client.set(key, value)
  }

  async getNumber(key: string) {
    const raw = await this.getState(key)
    return raw ? Number(raw) : 0
  }

  async setNumber(key: string, value: number) {
    await this.setState(key, String(value))
  }

  async incr(key: string) {
    const next = (await this.getNumber(key)) + 1
    await this.setNumber(key, next)
    return next
  }

  async del(key: string) {
    await this.client.delete(key)
  }
}
