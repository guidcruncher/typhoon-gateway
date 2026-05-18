// src/core/upstream/types.ts

export interface RetryOptions {
  maxRetries: number
  delayMs: number
  backoffFactor?: number
}

export interface UpstreamConfig {
  url: string
  method: string
  timeoutMs: number
  retry?: RetryOptions
}
