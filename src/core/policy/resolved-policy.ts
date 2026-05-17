// src/core/policy/resolve-policy.ts

import type { FastifyRequest } from "fastify"

import type { GlobalConfig, RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

export interface ResolvedPolicy {
  cache: any
  breaker: any
  retry: any
  upstreamTimeoutMs: number
  canary: any
}

export function resolvePolicy(
  _req: FastifyRequest,
  global: GlobalConfig,
  service: ServiceConfig,
  route: RouteConfig,
): ResolvedPolicy {
  return {
    cache: {
      ...global.cache,
      ...(service.cache ?? {}),
      ...(route.cache ?? {}),
    },

    breaker: {
      ...(global.breaker?.defaultOptions ?? {}),
      ...(global.breaker?.perService?.[service.name] ?? {}),
      ...(route.breaker ?? {}),
    },

    retry: {
      ...global.retry,
      ...(service.retry ?? {}),
      ...(route.retry ?? {}),
    },

    upstreamTimeoutMs:
      route.upstreamTimeoutMs ?? service.upstreamTimeoutMs ?? global.upstreamTimeoutMs ?? 5000,

    canary: {
      ...((global as any).canary ?? {}),
      ...((service as any).canary ?? {}),
      ...((route as any).canary ?? {}),
    },
  }
}
