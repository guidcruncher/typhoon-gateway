// src/core/breaker/registry.ts
import type { Breaker } from "./types.js"

export class BreakerRegistry {
  private map = new Map<string, Breaker>()

  register(key: string, breaker: Breaker) {
    this.map.set(key, breaker)
  }

  get(key: string): Breaker | undefined {
    return this.map.get(key)
  }

  list() {
    return [...this.map.entries()].map(([key, breaker]) => ({
      key,
      breaker, // <-- correct shape
    }))
  }
}

export const breakerRegistry = new BreakerRegistry()
