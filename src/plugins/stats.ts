// src/plugins/stats.ts

import fp from "fastify-plugin"

export default fp(async function statsPlugin(fastify) {
  fastify.addHook("onResponse", async (req, reply) => {
    const service = req.routeOptions.config?.service
    const route = req.routeOptions.config?.route

    if (!service || !route || !route.transformers) return

    const hasStats =
      route.transformers.onRequest?.some((t: any) => t.name === "stats-console") ||
      route.transformers.onResponse?.some((t: any) => t.name === "stats-console")

    if (!hasStats) return

    const latency = Date.now() - (req as any).startTime

    fastify.log.info({
      service: service.name,
      route: route.path,
      method: req.method,
      url: req.url,
      status: reply.statusCode,
      time: latency,
    })
  })
})
