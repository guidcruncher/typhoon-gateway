// src/core/manifest/types.ts

//
// Discovery
//
export type DiscoveryMode = "static" | "dns"

export interface StaticDiscoveryConfig {
  mode: "static"
  target: string
  canaryTarget?: string
}

export interface DnsDiscoveryConfig {
  mode: "dns"
  serviceName: string
  namespace?: string
  port?: number
  canaryServiceName?: string
}

export type DiscoveryConfig = StaticDiscoveryConfig | DnsDiscoveryConfig

//
// Retry Policy (manifest = partial overrides)
//
export interface RetryPolicyConfig {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  retryOn?: number[]
}

//
// Transformers
//
export interface TransformerConfig {
  name: string
  config?: Record<string, unknown>
  mode?: "object" | "stream"
}

export interface TransformerGroup {
  onRequest?: TransformerConfig[]
  onResponse?: TransformerConfig[]
}

//
// Breaker (manifest = partial BreakerOptions)
//
export interface BreakerOptions {
  failureThreshold: number
  successThreshold: number
  openStateDurationMs: number
  halfOpenMaxConcurrent: number
}

export interface BreakerConfig extends Partial<BreakerOptions> {
  enabled?: boolean
}

//
// Cache Policy (per-route/service/global)
//
export interface CachePolicyConfig {
  enabled?: boolean
  ttlMs?: number
  keyStrategy?: "canonical" | "full-url" | "headers"
  varyHeaders?: string[]
}

//
// Cache Backend (global only)
//
export interface CacheBackendConfig {
  backend?: "memory" | "redis" | "memcached" | "none" | "sqlite"
  redisUrl?: string
}

//
// Rate Limit
//
export interface RateLimitConfig {
  enabled?: boolean
  max?: number
  timeWindow?: string | number
}

//
// Canary
//
export interface CanaryConfig {
  version?: string
  weight: number
  target: string
}

//
// CORS
//
export interface CorsConfig {
  enabled?: boolean
  origin?: string | string[]
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

//
// Route
//
// src/core/config/types.ts

export interface UpstreamTarget {
  url: string
  weight?: number // default 1
  timeoutMs: number
}

export interface RouteConfig {
  path: string
  methods?: string[]
  upstreams: UpstreamTarget[]
  transformers?: TransformerGroup

  rateLimit?: RateLimitConfig
  cache?: CachePolicyConfig
  breaker?: BreakerConfig
  cors?: Partial<CorsConfig>
  canary?: CanaryConfig

  upstreamTimeoutMs?: number
  retry?: RetryPolicyConfig
}

//
// Service
//
export interface ServiceConfig {
  name: string
  prefix: string
  discovery: DiscoveryConfig
  routes: RouteConfig[]

  breaker?: BreakerConfig
  rateLimit?: RateLimitConfig
  cache?: CachePolicyConfig
  cors?: Partial<CorsConfig>
  canary?: CanaryConfig

  upstreamTimeoutMs?: number
  retry?: RetryPolicyConfig
}

//
// Global
//
export interface GlobalConfig {
  cors?: Partial<CorsConfig>

  // Backend (global only)
  cacheBackend?: CacheBackendConfig

  // Policy (global default)
  cache?: CachePolicyConfig

  breaker?: {
    store: "memory" | "redis" | "memcached"
    defaultOptions: BreakerOptions
    perService: Record<string, Partial<BreakerOptions>>
  }

  retry?: RetryPolicyConfig
  rateLimit?: RateLimitConfig
  canary?: CanaryConfig
  upstreamTimeoutMs?: number
}

export interface Manifest {
  global?: GlobalConfig
  services: ServiceConfig[]
}
