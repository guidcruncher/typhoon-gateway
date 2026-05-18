// src/plugins/stats.ts

import fp from "fastify-plugin"

import { createStatsBackend } from "@/core/stats/backend-factory.js"
import statsRecorder from "@/plugins/stats-recorder.js"

export interface StatsPluginOptions {
  backend?: string // "sqlite" | "redis" | "prometheus" | "memory"
}

export default fp<StatsPluginOptions>(async (fastify, opts) => {
  const backendName = (opts.backend ?? process.env.STATS_BACKEND ?? "sqlite") as any

  const backend = createStatsBackend(backendName)

  // Attach backend + hooks
  await fastify.register(statsRecorder, { backend })
})
