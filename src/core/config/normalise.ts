// src/core/config/normalise.ts
import type {
  GlobalConfig,
  RouteConfig,
  ServiceConfig,
  TransformerConfig,
  TransformerGroup,
} from "@/core/manifest/types.js"

//
// Normalise transformer groups
// NOTE: Do NOT assign default mode — inference handles it.
//
function normaliseTransformers(group?: TransformerGroup): TransformerGroup | undefined {
  if (!group) return group

  const normaliseList = (list?: TransformerConfig[]) =>
    list?.map((t) => ({
      ...t,
      mode: t.mode, // leave undefined → registry infers
    })) ?? []

  return {
    onRequest: normaliseList(group.onRequest),
    onResponse: normaliseList(group.onResponse),
  }
}

//
// Global defaults
//
export function normaliseGlobal(raw: any = {}): GlobalConfig {
  const breaker = raw.breaker
    ? {
        store: raw.breaker.store as "memory" | "redis" | "memcached",
        defaultOptions: {
          failureThreshold: raw.breaker.defaultOptions.failureThreshold,
          successThreshold: raw.breaker.defaultOptions.successThreshold,
          openTimeoutMs: raw.breaker.defaultOptions.openTimeoutMs,
        },
        perService: (raw.breaker.perService ?? {}) as Record<
          string,
          Partial<{
            failureThreshold: number
            successThreshold: number
            openTimeoutMs: number
          }>
        >,
      }
    : undefined

  return {
    cors: raw.cors,
    cache: raw.cache,
    breaker,
    retry: raw.retry,
    rateLimit: raw.rateLimit,
    canary: raw.canary,
    upstreamTimeoutMs: raw.upstreamTimeoutMs,
  }
}

//
// Service-level normalisation
//
export function normaliseService(service: ServiceConfig): ServiceConfig {
  return {
    ...service,

    // Ensure prefix always starts with "/"
    prefix: service.prefix.startsWith("/") ? service.prefix : `/${service.prefix}`,

    routes: (service.routes ?? []).map((r: RouteConfig) => ({
      ...r,
      methods: r.methods ?? ["GET"],
      transformers: normaliseTransformers(r.transformers),
    })),
  }
}
