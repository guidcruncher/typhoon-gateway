// src/core/config/schema.ts
import { z } from "zod"

//
// ---------- Breaker ----------
//
export const BreakerOptionsSchema = z.object({
  failureThreshold: z.number().int().positive(),
  successThreshold: z.number().int().positive(),
  openTimeoutMs: z.number().int().positive(),
})

export const BreakerSchema = z.object({
  store: z.enum(["memory", "redis", "memcached"]).default("memory"),

  defaultOptions: BreakerOptionsSchema.default({
    failureThreshold: 5,
    successThreshold: 1,
    openTimeoutMs: 30_000,
  }),
  perService: z.record(
    z.string(),
    z.object({
      failureThreshold: z.number().optional(),
      successThreshold: z.number().optional(),
      openTimeoutMs: z.number().optional(),
    }),
  ),
})

//
// ---------- Global ----------
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

export const GlobalCacheSchema = z.object({
  enabled: z.boolean().default(false),
  ttlSeconds: z.number().optional(),
  backend: z.enum(["memory", "redis", "memcached", "none"]).optional(),
  redisUrl: z.string().optional(),
})

//
// ---------- Discovery ----------
//
export const StaticDiscoverySchema = z.object({
  mode: z.literal("static"),
  target: z.string().url(),
  canaryTarget: z.string().url().optional(),
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
  maxRetries: z.number().int().min(0).max(10),
  baseDelayMs: z.number().int().min(1).max(5_000),
  maxDelayMs: z.number().int().min(1).max(30_000),
  retryBudgetRatio: z.number().min(0).max(1),
  retryOn: z.array(z.number().int().min(100).max(599)).default([502, 503, 504]),
})

//
// ---------- Transformers ----------
//
export const TransformerConfigSchema = z.object({
  name: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
  mode: z.enum(["object", "stream"]).optional(), // optional → inferred
})

export const TransformerGroupSchema = z.object({
  onRequest: z.array(TransformerConfigSchema).optional(),
  onResponse: z.array(TransformerConfigSchema).optional(),
})

//
// ---------- Cache ----------
//
export const CacheSchema = z.object({
  enabled: z.boolean().optional(),
  ttlSeconds: z.number().optional(),
  backend: z.enum(["memory", "redis", "memcached", "none"]).optional(),
  redisUrl: z.string().optional(),
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
// ---------- Routes ----------
//
export const RouteSchema = z.object({
  path: z.string(),
  methods: z.array(z.string()).optional(),
  transformers: TransformerGroupSchema.optional(),

  rateLimit: RateLimitSchema.optional(),
  cache: CacheSchema.optional(),
  breaker: BreakerSchema.optional(),
  cors: GlobalCorsSchema.partial().optional(),
  canary: CanarySchema.optional(),

  upstreamTimeoutMs: z.number().optional(),
  retryPolicy: RetryPolicySchema.optional(),
})

//
// ---------- Services ----------
//
export const ServiceSchema = z.object({
  name: z.string(),
  prefix: z.string(),
  discovery: DiscoverySchema,
  routes: z.array(RouteSchema),

  breaker: BreakerSchema.optional(),
  rateLimit: RateLimitSchema.optional(),
  cache: CacheSchema.optional(),
  cors: GlobalCorsSchema.partial().optional(),
  canary: CanarySchema.optional(),

  upstreamTimeoutMs: z.number().optional(),
  retryPolicy: RetryPolicySchema.optional(),
})

// src/core/config/schema.ts

export const GlobalConfigSchema = z.object({
  cors: GlobalCorsSchema.optional(),
  cache: CacheSchema.optional(),
  breaker: z
    .object({
      store: z.enum(["memory", "redis", "memcached"]),
      defaultOptions: z.object({
        failureThreshold: z.number(),
        successThreshold: z.number(),
        openTimeoutMs: z.number(),
      }),
      perService: z.record(
        z.string(),
        z.object({
          failureThreshold: z.number().optional(),
          successThreshold: z.number().optional(),
          openTimeoutMs: z.number().optional(),
        }),
      ),
    })
    .optional(),
  retry: RetryPolicySchema.optional(),
  rateLimit: RateLimitSchema.optional(),
  canary: CanarySchema.optional(),
  upstreamTimeoutMs: z.number().optional(),
})

export const ManifestSchema = z.object({
  global: GlobalConfigSchema.optional(),
  services: z.array(ServiceSchema),
})
