// src/core/discovery/static-discovery.ts

import type { ServiceConfig } from "@/core/manifest/types.js"

import type { ResolvedCanary, ResolvedTarget, ServiceDiscovery } from "./types.js"

export class StaticDiscovery implements ServiceDiscovery {
  async resolve(service: ServiceConfig): Promise<ResolvedTarget> {
    const cfg = service.discovery
    if (cfg.mode !== "static") throw new Error("StaticDiscovery used incorrectly")
    return { url: cfg.target }
  }

  async resolveCanary(service: ServiceConfig): Promise<ResolvedCanary | null> {
    const cfg = service.discovery
    if (cfg.mode !== "static" || !cfg.canaryTarget) return null
    return { url: cfg.canaryTarget }
  }
}
