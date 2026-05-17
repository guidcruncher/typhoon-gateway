// src/core/breaker/types.ts

import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

export type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN"

export interface BreakerOptions {
  failureThreshold: number // e.g. 5 failures
  successThreshold: number // e.g. 2 successes to close from HALF_OPEN
  openTimeoutMs: number // e.g. 30_000
}

export interface Breaker {
  canRequest(): Promise<boolean>
  recordSuccess(): Promise<void>
  recordFailure(): Promise<void>
  getState(): Promise<BreakerState>
}

export interface BreakerFactory {
  create(service: ServiceConfig, route: RouteConfig): Breaker
}
