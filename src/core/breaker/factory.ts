// src/core/breaker/factory.ts

import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

import { DistributedBreaker } from "./distributed-breaker.js"
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
    create(service: ServiceConfig, route: RouteConfig): Breaker {
      const overrides = perService[service.name] ?? {}

      const opts: BreakerOptions = {
        ...defaultOptions,
        ...overrides,
      }

      const breakerKey = `breaker:${service.name}:${route.path}`

      return new DistributedBreaker(store, breakerKey, opts)
    },
  }
}
