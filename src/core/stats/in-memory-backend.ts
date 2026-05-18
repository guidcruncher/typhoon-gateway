// src/core/stats/in-memory-backend.ts

import type { StatsBackend } from "./types.js"

export class InMemoryStatsBackend implements StatsBackend {
  private counters = new Map<string, number>()
  private histograms = new Map<string, number[]>()
  private gauges = new Map<string, number>()

  async increment(key: string): Promise<void> {
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1)
  }

  async histogram(key: string, value: number): Promise<void> {
    if (!this.histograms.has(key)) {
      this.histograms.set(key, [])
    }
    this.histograms.get(key)!.push(value)
  }

  async gauge(key: string, value: number): Promise<void> {
    this.gauges.set(key, value)
  }

  getCounter(key: string): number {
    return this.counters.get(key) ?? 0
  }

  getHistogram(key: string): number[] {
    return this.histograms.get(key) ?? []
  }

  getGauge(key: string): number | undefined {
    return this.gauges.get(key)
  }

  reset(): void {
    this.counters.clear()
    this.histograms.clear()
    this.gauges.clear()
  }
}
