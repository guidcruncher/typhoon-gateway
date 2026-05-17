// src/core/upstream/retry-policy.ts

import type { FastifyRequest } from "fastify"

import { classifyUpstreamError } from "@/core/errors/classify-upstream-error.js"
import { RetryPolicyConfig } from "@/core/manifest/types.js"

export class RetryPolicy {
  private retryCount = 0
  private retryBudgetUsed = 0
  private totalRequests = 0

  constructor(private config: RetryPolicyConfig) {}

  private isIdempotent(method: string): boolean {
    return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())
  }

  private shouldRetryStatus(status: number): boolean {
    return this.config.retryOn.includes(status)
  }

  private shouldRetryNetworkError(err: any): boolean {
    return (
      err?.name === "TimeoutError" ||
      err?.code === "ECONNRESET" ||
      err?.code === "ETIMEDOUT" ||
      err?.code === "EAI_AGAIN"
    )
  }

  private jitteredBackoff(attempt: number): number {
    const { baseDelayMs, maxDelayMs } = this.config
    const exp = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt))
    return exp * (0.5 + Math.random() * 0.5)
  }

  private hasBudget(): boolean {
    if (this.totalRequests === 0) return true
    const ratio = this.retryBudgetUsed / this.totalRequests
    return ratio < this.config.retryBudgetRatio
  }

  async execute(req: FastifyRequest, call: () => Promise<Response>): Promise<Response> {
    this.totalRequests++

    const method = req.method
    if (!this.isIdempotent(method)) {
      return call()
    }

    let lastError: any = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const res = await call()

        if (!this.shouldRetryStatus(res.status)) {
          return res
        }

        if (!this.hasBudget()) {
          return res
        }

        this.retryBudgetUsed++
        this.retryCount++

        const delay = this.jitteredBackoff(attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      } catch (err: any) {
        lastError = err

        if (!this.shouldRetryNetworkError(err)) {
          throw err
        }

        if (!this.hasBudget()) {
          throw err
        }

        this.retryBudgetUsed++
        this.retryCount++

        const delay = this.jitteredBackoff(attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
    }

    throw classifyUpstreamError(lastError)
  }
}
