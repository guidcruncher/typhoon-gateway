// src/core/breaker/distributed-breaker.ts

import type { CircuitBreakerStore } from "./store.js"
import type { Breaker, BreakerOptions, BreakerState } from "./types.js"

const stateKey = (key: string) => `${key}:state`
const failKey = (key: string) => `${key}:failures`
const successKey = (key: string) => `${key}:successes`
const openUntilKey = (key: string) => `${key}:openUntil`

export class DistributedBreaker implements Breaker {
  constructor(
    private readonly store: CircuitBreakerStore,
    private readonly key: string,
    private readonly opts: BreakerOptions,
  ) {}

  async getState(): Promise<BreakerState> {
    const raw = await this.store.getState(stateKey(this.key))
    return (raw as BreakerState) ?? "CLOSED"
  }

  async canRequest(): Promise<boolean> {
    const now = Date.now()
    const state = await this.getState()

    if (state === "CLOSED") return true

    if (state === "OPEN") {
      const untilRaw = await this.store.getState(openUntilKey(this.key))
      const until = untilRaw ? Number(untilRaw) : 0

      if (now >= until) {
        // Move to HALF_OPEN
        await this.store.setState(stateKey(this.key), "HALF_OPEN")
        await this.store.del(failKey(this.key))
        await this.store.del(successKey(this.key))
        return true
      }

      return false
    }

    // HALF_OPEN → allow limited traffic
    return true
  }

  async recordSuccess(): Promise<void> {
    const state = await this.getState()

    if (state === "CLOSED") return

    if (state === "HALF_OPEN") {
      const successes = await this.store.incr(successKey(this.key))

      if (successes >= this.opts.successThreshold) {
        // Fully close the breaker
        await this.store.setState(stateKey(this.key), "CLOSED")
        await this.store.del(failKey(this.key))
        await this.store.del(successKey(this.key))
        await this.store.del(openUntilKey(this.key))
      }
    }
  }

  async recordFailure(): Promise<void> {
    const state = await this.getState()

    if (state === "CLOSED" || state === "HALF_OPEN") {
      const failures = await this.store.incr(failKey(this.key))

      if (failures >= this.opts.failureThreshold) {
        const until = Date.now() + this.opts.openTimeoutMs

        await this.store.setState(stateKey(this.key), "OPEN")
        await this.store.setState(openUntilKey(this.key), String(until))
        await this.store.del(successKey(this.key))
      }
    }
  }
}
