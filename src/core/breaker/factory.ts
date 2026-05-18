// src/core/breaker/factory.ts
import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

import { DistributedBreaker } from "./distributed-breaker.js"
import { breakerRegistry } from "./registry.js"
import type { CircuitBreakerStore } from "./store.js"
import type { Breaker, BreakerFactory, BreakerOptions } from "./types.js"

export interface BreakerFactoryConfig {
  store: CircuitBreakerStore
  defaultOptions: BreakerOptions
  perService?: Record<string, Partial<BreakerOptions>>
}

export function createBreakerFactory(config: BreakerFactoryConfig): BreakerFactory {
  const { store, defaultOptions, perService = {} } = config

  return {
    create(
      service: ServiceConfig,
      route: RouteConfig,
      upstreamUrl: string, // ← NEW: upstream passed in
      policy: BreakerOptions, // ← route-level overrides
    ): Breaker {
      // Merge global + per-service + resolved policy
      const serviceOverrides = perService[service.name] ?? {}
      const opts: BreakerOptions = {
        ...defaultOptions,
        ...serviceOverrides,
        ...policy,
      }

      const breakerKey = `breaker:${service.name}:${route.path}:${upstreamUrl}`

      const breaker = new DistributedBreaker(store, breakerKey, opts)
      breakerRegistry.register(breakerKey, breaker)

      return breaker
    },
  }
}
