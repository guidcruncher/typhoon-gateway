// src/core/policy/resolve-policy.ts

// src/core/policy/types.ts
export interface EffectiveCanaryPolicy {
  enabled: boolean
  weight: number // 0–100
  target: string
  version?: string
}

export interface ResolvedPolicy {
  cache: any
  breaker: any
  retry: any
  upstreamTimeoutMs: number
  canary?: EffectiveCanaryPolicy
}
