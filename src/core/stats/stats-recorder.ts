// src/core/stats/stats-recorder.ts

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import { buildCanonicalKey } from "@/core/key/build-canonical-key.js"

export interface StatsBackend {
  increment(key: string): Promise<void>
  histogram(key: string, value: number): Promise<void>
}

export function registerStatsRecorder(fastify: FastifyInstance, backend: StatsBackend) {
  fastify.addHook("onResponse", async (req: FastifyRequest, _reply: FastifyReply) => {
    const service = req.routeOptions.config.service
    const route = req.routeOptions.config.route

    if (!service || !route) return

    const key = buildCanonicalKey(req, service.name, route.path)

    const duration = Date.now() - (req as any).startTime

    await backend.increment(`${key}:requests`)
    await backend.histogram(`${key}:latency`, duration)
  })
}
