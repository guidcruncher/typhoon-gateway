// src/core/discovery/dns-discovery.ts

import type { ServiceConfig } from "@/core/manifest/types.js"

import type { ResolvedCanary, ResolvedTarget, ServiceDiscovery } from "./types.js"

export class DnsDiscovery implements ServiceDiscovery {
  constructor(private readonly resolver: (hostname: string) => Promise<string>) {}

  private buildHostname(cfg: { serviceName: string; namespace?: string; port?: number }) {
    const ns = cfg.namespace ?? "default"
    const base = `${cfg.serviceName}.${ns}.svc.cluster.local`
    return cfg.port ? `${base}:${cfg.port}` : base
  }

  async resolve(service: ServiceConfig): Promise<ResolvedTarget> {
    const cfg = service.discovery
    if (cfg.mode !== "dns") throw new Error("DnsDiscovery used incorrectly")

    const hostname = this.buildHostname(cfg)
    const resolved = await this.resolver(hostname)
    return { url: `http://${resolved}` }
  }

  async resolveCanary(service: ServiceConfig): Promise<ResolvedCanary | null> {
    const cfg = service.discovery
    if (cfg.mode !== "dns" || !cfg.canaryServiceName) return null

    const hostname = this.buildHostname({
      serviceName: cfg.canaryServiceName,
      namespace: cfg.namespace,
      port: cfg.port,
    })

    const resolved = await this.resolver(hostname)
    return { url: `http://${resolved}` }
  }
}
