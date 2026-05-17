// src/types/fastify-typhoon.d.ts
import "fastify"

import type { BreakerFactory } from "@/core/breaker/types.js"
import type { ServiceConfig } from "@/core/manifest/types.js"

declare module "fastify" {
  interface FastifyInstance {
    discovery: {
      resolve: (service: ServiceConfig, canary: any) => Promise<string>
    }
    collapse: {
      get: (key: string) => Promise<any | undefined>
      set: (key: string, promise: Promise<any>) => void
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
  }
}
