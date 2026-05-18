// src/core/config/normalise.ts

import type {
  BreakerOptions,
  CachePolicyConfig,
  GlobalConfig,
  RetryPolicyConfig,
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
  //
  // Breaker
  //
  const breaker = raw.breaker
    ? {
        store: raw.breaker.store as "memory" | "redis" | "memcached",

        defaultOptions: {
          failureThreshold: raw.breaker.defaultOptions?.failureThreshold,
          successThreshold: raw.breaker.defaultOptions?.successThreshold,
          openStateDurationMs: raw.breaker.defaultOptions?.openStateDurationMs,
          halfOpenMaxConcurrent: raw.breaker.defaultOptions?.halfOpenMaxConcurrent,
        } as BreakerOptions,

        perService: (raw.breaker.perService ?? {}) as Record<string, Partial<BreakerOptions>>,
      }
    : undefined

  //
  // Cache backend + cache policy
  //
  const cacheBackend = raw.cacheBackend
    ? {
        backend: raw.cacheBackend.backend,
        redisUrl: raw.cacheBackend.redisUrl,
      }
    : undefined

  const cache: CachePolicyConfig | undefined = raw.cache
    ? {
        enabled: raw.cache.enabled,
        ttlMs: raw.cache.ttlMs,
        keyStrategy: raw.cache.keyStrategy,
        varyHeaders: raw.cache.varyHeaders,
      }
    : undefined

  //
  // Retry
  //
  const retry: RetryPolicyConfig | undefined = raw.retry
    ? {
        maxRetries: raw.retry.maxRetries,
        baseDelayMs: raw.retry.baseDelayMs,
        maxDelayMs: raw.retry.maxDelayMs,
        retryOn: raw.retry.retryOn,
      }
    : undefined

  return {
    cors: raw.cors,
    cacheBackend,
    cache,
    breaker,
    retry,
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
