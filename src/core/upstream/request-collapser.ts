// src/core/upstream/request-collapser.ts
import type { StatsBackend } from "@/core/stats/types.js"

export class RequestCollapser {
  private static pending = new Map<string, Promise<any>>()
  private static stats?: StatsBackend

  // Allow the gateway to inject stats backend once at startup
  static registerStats(stats: StatsBackend) {
    this.stats = stats
  }

  static get(key: string): Promise<any> | undefined {
    return this.pending.get(key)
  }

  static set(key: string, p: Promise<any>): void {
    this.pending.set(key, p)
  }

  static async execute<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.get(key)

    if (existing) {
      // Collapse hit
      await this.stats?.increment?.(`${key}:collapse:hit`)
      return existing as Promise<T>
    }

    // Collapse miss
    await this.stats?.increment?.(`${key}:collapse:miss`)

    const p = factory().finally(() => {
      this.pending.delete(key)
    })

    this.set(key, p)
    return p
  }
}
