// src/core/policy/resolve-policy.ts

import type { FastifyRequest } from "fastify"

import type { GlobalConfig, RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

import type { EffectiveCanaryPolicy, ResolvedPolicy } from "./types.js"

function resolveCanary(
  global: GlobalConfig | undefined,
  service: ServiceConfig,
  route: RouteConfig,
): EffectiveCanaryPolicy | undefined {
  // currently only service/route; global can be added later if you want
  const routeCanary = route.canary
  const serviceCanary = service.canary

  const src = routeCanary ?? serviceCanary
  if (!src) return undefined

  if (src.weight <= 0) return undefined

  return {
    enabled: true,
    weight: Math.min(100, Math.max(0, src.weight)),
    target: src.target,
    version: src.version,
  }
}

export function resolvePolicy(
  _req: FastifyRequest,
  global: GlobalConfig,
  service: ServiceConfig,
  route: RouteConfig,
): ResolvedPolicy {
  const canary = resolveCanary(global, service, route)

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

    canary,
  }
}
