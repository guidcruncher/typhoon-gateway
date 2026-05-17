// src/plugins/prometheus.ts

import fp from "fastify-plugin"
import { PrometheusStatsBackend } from "@/core/stats/prometheus-backend"

export default fp(async (fastify) => {
  const backend = new PrometheusStatsBackend()

  fastify.decorate("stats", backend)

  fastify.get("/metrics", async (_req, reply) => {
    const metrics = await backend.getMetrics()
    reply
      .header("Content-Type", "text/plain")
      .send(metrics)
  })
})
