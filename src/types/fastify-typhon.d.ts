import "fastify"

import type { BreakerFactory } from "@/core/breaker/types.js"
import type { GlobalConfig, RouteConfig, ServiceConfig } from "@/core/manifest/types.js"
import type { ServiceConfig } from "@/core/manifest/types.js"
import type { StatsBackend } from "@/core/stats/types.js"
import type { AuthenticatedUser } from "@/plugins/auth.js"
import type { CacheStore } from "@/plugins/cache.js"
import type { DiscoveryFactory } from "@/plugins/discovery.js"

declare module "fastify" {
  //
  // FastifyInstance augmentation
  //
  interface FastifyInstance {
    discovery: {
      resolve: (service: ServiceConfig, canary: any) => Promise<string>
    }

    collapse: {
      get(key: string): Promise<any> | undefined
      set(key: string, p: Promise<any>): void
    }

    breakerFactory?: BreakerFactory
    httpClient: {
      request: (opts: {
        method: string
        url: string
        headers: any
        body: any
        timeout: number
      }) => Promise<any>
    }
    globalConfig?: any

    //
    // Manifest loaded by config-loader
    //
    manifest: {
      services: ServiceConfig[]
    }

    stats: StatsBackend

    //
    // Global config (Zod-normalised)
    //
    globalConfig: GlobalConfig

    //
    // Convenience alias (flat list of services)
    //
    services: ServiceConfig[]

    //
    // Plugins
    //
    discoveryFactory: DiscoveryFactory
    cacheStore: CacheStore

    //
    // Auth plugin
    //
    authUser?: AuthenticatedUser
  }

  //
  // FastifyRequest augmentation
  //
  interface FastifyRequest {
    authUser?: AuthenticatedUser
    correlationId: string
  }

  //
  // Per-route context config
  //
  interface FastifyContextConfig {
    service?: ServiceConfig
    route?: RouteConfig
  }
}
