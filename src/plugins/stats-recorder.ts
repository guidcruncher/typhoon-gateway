// src/plugins/stats-recorder.ts

import fp from "fastify-plugin"

import { buildCanonicalKey } from "@/core/key/build-canonical-key.js"
import type { StatsBackend } from "@/core/stats/types.js"

interface StatsRecorderOptions {
  backend: StatsBackend
}

export default fp<StatsRecorderOptions>(async (fastify, opts) => {
  const backend = opts.backend

  fastify.decorate("stats", backend)

  fastify.addHook("onRequest", async (req) => {
    ;(req as any)._startTime = process.hrtime.bigint()
  })

  fastify.addHook("onResponse", async (req, reply) => {
    const start = (req as any)._startTime as bigint
    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1_000_000

    const service = req.routeOptions.config.service
    const route = req.routeOptions.config.route

    if (!service || !route) {
      // Should never happen for Typhon routes
      return
    }

    const key = buildCanonicalKey(req, service.name, route.path)

    await backend.increment(`${key}:requests`)
    await backend.histogram(`${key}:latency`, durationMs)
    await backend.increment(`${key}:status:${reply.statusCode}`)
  })

  fastify.addHook("onError", async (req, _reply, _err) => {
    const service = req.routeOptions.config.service
    const route = req.routeOptions.config.route

    if (!service || !route) return

    const key = buildCanonicalKey(req, service.name, route.path)

    await backend.increment(`${key}:errors`)
  })
})
