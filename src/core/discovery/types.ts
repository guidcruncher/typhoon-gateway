// src/core/discovery/types.ts

import type { ServiceConfig } from "@/core/manifest/types.js"

export interface ResolvedTarget {
  url: string
}

export interface ResolvedCanary {
  url: string
}

export interface ServiceDiscovery {
  resolve(service: ServiceConfig): Promise<ResolvedTarget>
  resolveCanary(service: ServiceConfig): Promise<ResolvedCanary | null>
}
