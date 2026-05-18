// src/core/breaker/types.ts

import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

export type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN"

export interface BreakerStats {
  failures: number
  successes: number
  openedAt: number | null
  halfOpenRequests: number
}

export interface BreakerOptions {
  failureThreshold: number
  successThreshold: number
  openStateDurationMs: number
  halfOpenMaxConcurrent: number
}

export interface Breaker {
  canRequest(): Promise<boolean>
  recordSuccess(): Promise<void>
  recordFailure(): Promise<void>
  getState(): Promise<BreakerState>
  getStats(): Promise<BreakerStats>
  getOptions(): any
}

export interface BreakerFactory {
  create(
    service: ServiceConfig,
    route: RouteConfig,
    upstreamUrl: string,
    policy: BreakerOptions,
  ): Breaker
}
