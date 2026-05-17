// src/core/upstream/request-collapser.ts

import type { StatsBackend } from "@/core/stats/types.js"

export class RequestCollapser {
  private static pending = new Map<string, Promise<any>>()
  private static stats?: StatsBackend

  // Allow the gateway to inject stats backend once at startup
  static registerStats(stats: StatsBackend) {
    this.stats = stats
  }

  static async execute<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key)

    if (existing) {
      // Collapse hit
      await this.stats?.increment(`${key}:collapse:hit`)
      return existing as Promise<T>
    }

    // Collapse miss
    await this.stats?.increment(`${key}:collapse:miss`)

    const p = factory().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, p)
    return p
  }
}
