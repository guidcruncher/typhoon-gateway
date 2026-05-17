// src/app.ts

import registerCors from "@fastify/cors"
import type { FastifyInstance } from "fastify"
import Fastify from "fastify"

import breakerPlugin from "@/plugins/breaker.js"
import cachePlugin from "@/plugins/cache.js"
// THIS is your config loader plugin (not the class)
import configLoaderPlugin from "@/plugins/config-loader.js"
import { correlationIdPlugin } from "@/plugins/correlation-id.js"
import registerDebugCors from "@/plugins/debug-cors.js"
import discoveryPlugin from "@/plugins/discovery.js"
import registerGatewayCore from "@/plugins/gateway-core.js"
import registerStatsHook from "@/plugins/stats.js"
import statsPlugin from "@/plugins/stats"

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true,
  })

  //
  // 1. Load config via plugin (this sets fastify.globalConfig + fastify.services)
  //
  await fastify.register(configLoaderPlugin)

  //
  // 2. Correlation ID
  //
  await fastify.register(correlationIdPlugin)

  //
  // 3. Global CORS (always pass an object)
  //
  await fastify.register(registerCors, fastify.globalConfig.cors ?? {})

  //
  // 4. Debug CORS
  //
  await fastify.register(registerDebugCors)

  //
  // 5. Cache plugin (always pass an object)
  //
  await fastify.register(cachePlugin, { cache: fastify.globalConfig.cache })

  //
  // 6. Discovery plugin
  //
  await fastify.register(discoveryPlugin)

  //
  // 7. Stats hook
  //
  fastify.register(statsPlugin, {
    backend: (process.env.STATS_BACKEND ?? "memory")
  })

  //
  // 8. Breaker plugin (guard global.breaker)
  //
  if (fastify.globalConfig.breaker) {
    await fastify.register(breakerPlugin, {
      store: fastify.globalConfig.breaker.store,
      defaultOptions: fastify.globalConfig.breaker.defaultOptions,
      perService: fastify.globalConfig.breaker.perService,
    })
  }

  //
  // 9. Gateway core — now typed correctly
  //
  await fastify.register(registerGatewayCore)

  return fastify
}
