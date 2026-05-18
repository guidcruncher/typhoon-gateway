// src/plugins/breaker-introspection.ts
import fp from "fastify-plugin"

import { breakerRegistry } from "@/core/breaker/registry.js"

export default fp(async (fastify) => {
  //
  // List all breakers
  //
  fastify.get("/internal/breakers", async () => {
    const entries = breakerRegistry.list()

    return Promise.all(
      entries.map(async ({ key, breaker }) => ({
        key,
        state: await breaker.getState(),
        stats: await breaker.getStats(),
        options: breaker.getOptions(),
      })),
    )
  })

  //
  // Inspect a single breaker
  //
  fastify.get("/internal/breakers/:service/:route", async (req) => {
    const { service, route } = req.params as any
    const key = `${service}:${route}`
    const breaker = breakerRegistry.get(key)

    if (!breaker) {
      return { error: "not_found", key }
    }

    return {
      key,
      state: await breaker.getState(),
      stats: await breaker.getStats(),
      options: breaker.getOptions(),
    }
  })
})
