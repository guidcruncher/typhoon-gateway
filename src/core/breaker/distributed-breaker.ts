// src/core/breaker/distributed-breaker.ts

import type { CircuitBreakerStore } from "./store.js"
import type { Breaker, BreakerOptions, BreakerState } from "./types.js"
import type { StatsBackend } from "@/core/stats/types.js"

const stateKey = (key: string) => `${key}:state`
const failKey = (key: string) => `${key}:failures`
const successKey = (key: string) => `${key}:successes`
const openUntilKey = (key: string) => `${key}:openUntil`

export class DistributedBreaker implements Breaker {
  constructor(
    private readonly store: CircuitBreakerStore,
    private readonly key: string,
    private readonly opts: BreakerOptions,
    private readonly stats?: StatsBackend, // optional for tests
  ) {}

  //
  // ────────────────────────────────────────────────────────────
  //  Metrics helpers
  // ────────────────────────────────────────────────────────────
  //

  private async emitState(state: BreakerState) {
    if (!this.stats) return

    // Gauge: 0 = CLOSED, 1 = HALF_OPEN, 2 = OPEN
    await this.stats.gauge(`${this.key}:breaker:state`, this.stateToNumber(state))

    // Transition counter
    await this.stats.increment(`${this.key}:breaker:transition:${state}`)
  }

  private stateToNumber(state: BreakerState): number {
    switch (state) {
      case "CLOSED": return 0
      case "HALF_OPEN": return 1
      case "OPEN": return 2
    }
  }

  //
  // ────────────────────────────────────────────────────────────
  //  Breaker core logic
  // ────────────────────────────────────────────────────────────
  //

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
        // Transition → HALF_OPEN
        await this.store.setState(stateKey(this.key), "HALF_OPEN")
        await this.store.del(failKey(this.key))
        await this.store.del(successKey(this.key))

        await this.emitState("HALF_OPEN")

        return true
      }

      return false
    }

    // HALF_OPEN → allow limited traffic
    return true
  }

  async recordSuccess(): Promise<void> {
    const state = await this.getState()

    // Metrics: success event
    await this.stats?.increment(`${this.key}:breaker:success`)

    if (state === "CLOSED") return

    if (state === "HALF_OPEN") {
      const successes = await this.store.incr(successKey(this.key))

      if (successes >= this.opts.successThreshold) {
        // Transition → CLOSED
        await this.store.setState(stateKey(this.key), "CLOSED")
        await this.store.del(failKey(this.key))
        await this.store.del(successKey(this.key))
        await this.store.del(openUntilKey(this.key))

        await this.emitState("CLOSED")
      }
    }
  }

  async recordFailure(): Promise<void> {
    const state = await this.getState()

    // Metrics: failure event
    await this.stats?.increment(`${this.key}:breaker:failure`)

    if (state === "CLOSED" || state === "HALF_OPEN") {
      const failures = await this.store.incr(failKey(this.key))

      if (failures >= this.opts.failureThreshold) {
        const until = Date.now() + this.opts.openTimeoutMs

        // Transition → OPEN
        await this.store.setState(stateKey(this.key), "OPEN")
        await this.store.setState(openUntilKey(this.key), String(until))
        await this.store.del(successKey(this.key))

        await this.emitState("OPEN")
      }
    }
  }
}
