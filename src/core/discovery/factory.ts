// src/core/discovery/factory.ts

import type { ServiceConfig } from "@/core/manifest/types.js"

import { DnsDiscovery } from "./dns-discovery.js"
import { StaticDiscovery } from "./static-discovery.js"
import type { ServiceDiscovery } from "./types.js"

export class DiscoveryFactory {
  constructor(
    private readonly deps: {
      dnsResolver: (hostname: string) => Promise<string>
    },
  ) {}

  create(service: ServiceConfig): ServiceDiscovery {
    const cfg = service.discovery

    switch (cfg.mode) {
      case "static":
        return new StaticDiscovery()
      case "dns":
        return new DnsDiscovery(this.deps.dnsResolver)
      default:
        throw new Error(`Unsupported discovery mode: ${(cfg as any).mode}`)
    }
  }
}
