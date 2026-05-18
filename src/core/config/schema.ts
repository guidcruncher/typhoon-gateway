// src/core/config/schema.ts
import { z } from "zod"

//
// ---------- Breaker Options (runtime) ----------
//
export const BreakerOptionsSchema = z.object({
  failureThreshold: z.number().int().positive(),
  successThreshold: z.number().int().positive(),
  openStateDurationMs: z.number().int().positive(),
  halfOpenMaxConcurrent: z.number().int().positive(),
})

//
// ---------- Breaker (manifest) ----------
//
export const BreakerSchema = z.object({
  enabled: z.boolean().optional(),

  // Partial overrides of BreakerOptions
  failureThreshold: z.number().int().positive().optional(),
  successThreshold: z.number().int().positive().optional(),
  openStateDurationMs: z.number().int().positive().optional(),
  halfOpenMaxConcurrent: z.number().int().positive().optional(),
})

//
// ---------- Global Breaker ----------
//
export const GlobalBreakerSchema = z.object({
  store: z.enum(["memory", "redis", "memcached"]),

  defaultOptions: BreakerOptionsSchema.default({
    failureThreshold: 5,
    successThreshold: 1,
    openStateDurationMs: 30_000,
    halfOpenMaxConcurrent: 1,
  }),

  perService: z
    .record(
      z.string(),
      BreakerSchema.partial(), // partial overrides
    )
    .default({}),
})

//
// ---------- Global CORS ----------
//
export const GlobalCorsSchema = z.object({
  enabled: z.boolean().default(true),
  origin: z.union([z.string(), z.array(z.string())]).optional(),
  methods: z.array(z.string()).optional(),
  allowedHeaders: z.array(z.string()).optional(),
  exposedHeaders: z.array(z.string()).optional(),
  credentials: z.boolean().optional(),
  maxAge: z.number().optional(),
})

//
// ---------- Cache Backend (global only) ----------
//
export const CacheBackendSchema = z.object({
  backend: z.enum(["memory", "redis", "memcached", "none"]).default("memory"),
  redisUrl: z.string().optional(),
})

//
// ---------- Cache Policy (global/service/route) ----------
//
export const CachePolicySchema = z.object({
  enabled: z.boolean().optional(),
  ttlMs: z.number().int().positive().optional(),
  keyStrategy: z.enum(["canonical", "full-url", "headers"]).optional(),
  varyHeaders: z.array(z.string()).optional(),
})

//
// ---------- Discovery ----------
//
export const StaticDiscoverySchema = z.object({
  mode: z.literal("static"),
  target: z.string(),
  canaryTarget: z.string().optional(),
})

export const DnsDiscoverySchema = z.object({
  mode: z.literal("dns"),
  serviceName: z.string(),
  namespace: z.string().optional(),
  port: z.number().optional(),
  canaryServiceName: z.string().optional(),
})

export const DiscoverySchema = z.discriminatedUnion("mode", [
  StaticDiscoverySchema,
  DnsDiscoverySchema,
])

//
// ---------- Retry Policy ----------
//
export const RetryPolicySchema = z.object({
  maxRetries: z.number().int().min(0).optional(),
  baseDelayMs: z.number().int().min(1).optional(),
  maxDelayMs: z.number().int().min(1).optional(),
  retryOn: z.array(z.number().int().min(100).max(599)).optional(),
})

//
// ---------- Transformers ----------
//
export const TransformerConfigSchema = z.object({
  name: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
  mode: z.enum(["object", "stream"]).optional(),
})

export const TransformerGroupSchema = z.object({
  onRequest: z.array(TransformerConfigSchema).optional(),
  onResponse: z.array(TransformerConfigSchema).optional(),
})

//
// ---------- Rate Limit ----------
//
export const RateLimitSchema = z.object({
  enabled: z.boolean().optional(),
  max: z.number().optional(),
  timeWindow: z.union([z.string(), z.number()]).optional(),
})

//
// ---------- Canary ----------
//
export const CanarySchema = z.object({
  version: z.string().optional(),
  weight: z.number(),
  target: z.string(),
})

//
// ---------- Upstream (weighted routing) ----------
//
export const UpstreamSchema = z.object({
  url: z.string(),
  weight: z.number().positive().optional(), // default = 1
})

//
// ---------- Route ----------
//

export const RouteSchema = z.object({
  path: z.string(),
  methods: z.array(z.string()).optional(),
  transformers: TransformerGroupSchema.optional(),

  rateLimit: RateLimitSchema.optional(),
  cache: CachePolicySchema.optional(),
  breaker: BreakerSchema.optional(),
  cors: GlobalCorsSchema.partial().optional(),
  canary: CanarySchema.optional(),
  upstreams: z.array(UpstreamSchema),
  upstreamTimeoutMs: z.number().optional(),
  retry: RetryPolicySchema.optional(),
})

//
// ---------- Service ----------
//
export const ServiceSchema = z.object({
  name: z.string(),
  prefix: z.string(),
  discovery: DiscoverySchema,
  routes: z.array(RouteSchema),

  breaker: BreakerSchema.optional(),
  rateLimit: RateLimitSchema.optional(),
  cache: CachePolicySchema.optional(),
  cors: GlobalCorsSchema.partial().optional(),
  canary: CanarySchema.optional(),

  upstreamTimeoutMs: z.number().optional(),
  retry: RetryPolicySchema.optional(),
})

//
// ---------- Global Config ----------
//
export const GlobalConfigSchema = z.object({
  cors: GlobalCorsSchema.optional(),

  cacheBackend: CacheBackendSchema.optional(),
  cache: CachePolicySchema.optional(),

  breaker: GlobalBreakerSchema.optional(),

  retry: RetryPolicySchema.optional(),
  rateLimit: RateLimitSchema.optional(),
  canary: CanarySchema.optional(),
  upstreamTimeoutMs: z.number().optional(),
})

//
// ---------- Manifest ----------
//
export const ManifestSchema = z.object({
  global: GlobalConfigSchema.optional(),
  services: z.array(ServiceSchema),
})
