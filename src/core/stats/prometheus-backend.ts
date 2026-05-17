// src/core/stats/prometheus-backend.ts

import type { StatsBackend } from "./types.js"
import client from "prom-client"

export class PrometheusStatsBackend implements StatsBackend {
  private counters = new Map<string, client.Counter>()
  private histograms = new Map<string, client.Histogram>()
  private gauges = new Map<string, client.Gauge>()

  constructor() {
    // Default registry
    client.collectDefaultMetrics()
  }

  private getOrCreateCounter(key: string): client.Counter {
    if (!this.counters.has(key)) {
      const c = new client.Counter({
        name: this.sanitize(`${key}_total`),
        help: `Counter for ${key}`,
      })
      this.counters.set(key, c)
    }
    return this.counters.get(key)!
  }

  private getOrCreateHistogram(key: string): client.Histogram {
    if (!this.histograms.has(key)) {
      const h = new client.Histogram({
        name: this.sanitize(`${key}_histogram`),
        help: `Histogram for ${key}`,
        buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000], // ms
      })
      this.histograms.set(key, h)
    }
    return this.histograms.get(key)!
  }

  private getOrCreateGauge(key: string): client.Gauge {
    if (!this.gauges.has(key)) {
      const g = new client.Gauge({
        name: this.sanitize(`${key}_gauge`),
        help: `Gauge for ${key}`,
      })
      this.gauges.set(key, g)
    }
    return this.gauges.get(key)!
  }

  // Prometheus metric names must match /^[a-zA-Z_:][a-zA-Z0-9_:]*$/
  private sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, "_")
  }

  async increment(key: string): Promise<void> {
    this.getOrCreateCounter(key).inc()
  }

  async histogram(key: string, value: number): Promise<void> {
    this.getOrCreateHistogram(key).observe(value)
  }

  async gauge(key: string, value: number): Promise<void> {
    this.getOrCreateGauge(key).set(value)
  }

  // Expose metrics for Fastify route
  async getMetrics(): Promise<string> {
    return await client.register.metrics()
  }
}
