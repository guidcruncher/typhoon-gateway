// src/core/breaker/stores/memory.ts
import type { CircuitBreakerStore } from "../store.js"

export class MemoryCircuitBreakerStore implements CircuitBreakerStore {
  private map = new Map<string, string>()

  async getState(key: string) {
    return this.map.get(key) ?? null
  }

  async setState(key: string, value: string) {
    this.map.set(key, value)
  }

  async getNumber(key: string) {
    return Number(this.map.get(key) ?? "0")
  }

  async setNumber(key: string, value: number) {
    this.map.set(key, String(value))
  }

  async incr(key: string) {
    const next = (await this.getNumber(key)) + 1
    await this.setNumber(key, next)
    return next
  }

  async del(key: string) {
    this.map.delete(key)
  }
}
