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

// src/core/manifest/types.ts

export interface RetryPolicyConfig {
  /** Maximum number of retry attempts */
  maxRetries: number

  /** Base delay for exponential backoff (ms) */
  baseDelayMs: number

  /** Maximum backoff delay (ms) */
  maxDelayMs: number

  /** Retry budget ratio (0.0–1.0) */
  retryBudgetRatio: number

  /** HTTP status codes that qualify for retry */
  retryOn: number[]
}

//
// Transformers
//
export interface TransformerConfig {
  name: string
  config?: Record<string, unknown>
  mode?: "object" | "stream" // optional → inferred automatically
}

export interface TransformerGroup {
  onRequest?: TransformerConfig[]
  onResponse?: TransformerConfig[]
}

//
// Breaker
//
export interface BreakerConfig {
  enabled?: boolean
  threshold: number
  timeoutMs: number
}

//
// Cache
//
export interface CacheConfig {
  enabled?: boolean
  ttlSeconds?: number
  backend?: "memory" | "redis" | "memcached" | "none"
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
export interface RouteConfig {
  path: string
  methods?: string[]
  transformers?: TransformerGroup

  rateLimit?: RateLimitConfig
  cache?: CacheConfig
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
  cache?: CacheConfig
  cors?: Partial<CorsConfig>
  canary?: CanaryConfig

  upstreamTimeoutMs?: number
  retry?: RetryPolicyConfig
}

export interface GlobalConfig {
  cors?: Partial<CorsConfig>
  cache?: CacheConfig
  breaker?: {
    store: "memory" | "redis" | "memcached"
    defaultOptions: {
      failureThreshold: number
      successThreshold: number
      openTimeoutMs: number
    }
    perService: Record<
      string,
      Partial<{
        failureThreshold: number
        successThreshold: number
        openTimeoutMs: number
      }>
    >
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
