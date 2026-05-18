// src/core/upstream/retry-policy.ts

import type { FastifyRequest } from "fastify"

import type { RetryPolicyConfig } from "@/core/manifest/types.js"
import type { StatsBackend } from "@/core/stats/types.js"

export class RetryPolicy {
  constructor(
    private config: Required<RetryPolicyConfig>, // resolved policy is always complete
    private stats?: StatsBackend,
    private metricBase?: string,
  ) {}

  private shouldRetryStatus(status?: number): boolean {
    if (!status) return false
    return this.config.retryOn.includes(status)
  }

  private jitteredBackoff(attempt: number): number {
    const { baseDelayMs, maxDelayMs } = this.config
    const exp = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt))
    return exp * (0.5 + Math.random() * 0.5)
  }

  async execute<T>(
    req: FastifyRequest,
    call: () => Promise<T & { statusCode?: number }>,
  ): Promise<T> {
    let lastError: any = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const res = await call()

        if (!this.shouldRetryStatus(res.statusCode)) {
          return res
        }

        // Retry due to upstream status code
        await this.stats?.increment(`${this.metricBase}:retry.attempt`)

        const delay = this.jitteredBackoff(attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      } catch (err: any) {
        lastError = err

        // Retry due to network error
        await this.stats?.increment(`${this.metricBase}:retry.attempt`)

        const delay = this.jitteredBackoff(attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
    }

    // Exhausted
    await this.stats?.increment(`${this.metricBase}:retry.exhausted`)
    throw lastError
  }
}
