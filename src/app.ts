// src/app.ts

import registerCors from "@fastify/cors"
import type { FastifyInstance } from "fastify"
import Fastify from "fastify"

import breakerPlugin from "@/plugins/breaker.js"
import breakerStats from "@/plugins/breaker-introspective.js"
import cachePlugin from "@/plugins/cache.js"
import collapsePlugin from "@/plugins/collapse.js"
import configLoaderPlugin from "@/plugins/config-loader.js"
import correlationIdPlugin from "@/plugins/correlation-id.js"
import { generateCorrelationId } from "@/plugins/correlation-id.js"
import registerDebugCors from "@/plugins/debug-cors.js"
import discoveryPlugin from "@/plugins/discovery.js"
import errorHandlingPlugin from "@/plugins/error-handling.js"
import registerGatewayCore from "@/plugins/gateway-core.js"
import httpClientPlugin from "@/plugins/http-client.js"
import loggingPlugin from "@/plugins/logging.js"
import prometheusPlugin from "@/plugins/prometheus.js"
import statsPlugin from "@/plugins/stats.js"

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    genReqId: generateCorrelationId,
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  })

  //
  // 1. Load config via plugin (this sets fastify.globalConfig + fastify.services)
  //
  await fastify.register(configLoaderPlugin)

  //
  // 2. Correlation ID
  //
  await fastify.register(correlationIdPlugin)
  await fastify.register(loggingPlugin)

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
  const statsBackend = process.env.STATS_BACKEND ?? "memory"
  fastify.register(statsPlugin, {
    backend: statsBackend,
  })

  if (statsBackend == "prometheus") {
    fastify.register(prometheusPlugin)
  }

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

  await fastify.register(httpClientPlugin)

  //
  // 9. Request collapser
  //
  await fastify.register(collapsePlugin)

  //
  // 10. Gateway core — now typed correctly
  //
  await fastify.register(registerGatewayCore)

  //
  // 11. Register internal API if enabled
  //
  const enableInternalApi = process.env.ENABLE_INTERNAL_API ?? "true"

  if (enableInternalApi === "true") {
    await fastify.register(breakerStats)
  }

  //
  // 12. Error handling
  //
  await fastify.register(errorHandlingPlugin)

  return fastify
}
