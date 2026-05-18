// src/core/discovery/static-discovery.ts
import type { ServiceConfig } from "@/core/manifest/types.js"

import type { ResolvedCanary, ResolvedTarget, ServiceDiscovery } from "./types.js"

export class StaticDiscovery implements ServiceDiscovery {
  async resolve(service: ServiceConfig): Promise<ResolvedTarget> {
    const cfg = service.discovery
    if (cfg.mode !== "static") {
      throw new Error("StaticDiscovery used incorrectly")
    }

    if (!cfg.target) {
      throw new Error(`Static discovery missing 'target' for service '${service.name}'`)
    }

    // Ensure the URL is fully qualified
    const url = cfg.target.startsWith("http") ? cfg.target : `http://${cfg.target}`

    return { url }
  }

  async resolveCanary(service: ServiceConfig): Promise<ResolvedCanary | null> {
    const cfg = service.discovery
    if (cfg.mode !== "static" || !cfg.canaryTarget) {
      return null
    }

    const url = cfg.canaryTarget.startsWith("http")
      ? cfg.canaryTarget
      : `http://${cfg.canaryTarget}`

    return { url }
  }
}
