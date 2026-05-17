// src/plugins/stats.ts

import fp from "fastify-plugin"
import type { FastifyInstance } from "fastify"

import { createStatsBackend } from "@/core/stats/backend-factory"
import statsRecorder from "@/plugins/stats-recorder"

export interface StatsPluginOptions {
  backend?: string   // "sqlite" | "redis" | "prometheus" | "memory"
}

export default fp<StatsPluginOptions>(async (fastify, opts) => {
  const backendName =
    (opts.backend ?? process.env.STATS_BACKEND ?? "sqlite") as any

  const backend = createStatsBackend(backendName)

  // Attach backend + hooks
  await fastify.register(statsRecorder, { backend })

  // Expose backend directly on fastify instance
  fastify.decorate("stats", backend)
})
