// src/plugins/stats-recorder.ts

import fp from "fastify-plugin"
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import type { StatsBackend } from "@/core/stats/types.js"
import { buildCanonicalKey } from "@/core/key/build-canonical-key.js"

interface StatsRecorderOptions {
  backend: StatsBackend
}

export default fp<StatsRecorderOptions>(async (fastify, opts) => {
  const backend = opts.backend

  if (!backend) {
    throw new Error("StatsRecorder requires a StatsBackend instance")
  }

  fastify.decorate("stats", backend)

  fastify.addHook("onRequest", async (req: FastifyRequest) => {
    // Capture start time for latency measurement
    ;(req as any)._startTime = process.hrtime.bigint()
  })

  fastify.addHook("onResponse", async (req: FastifyRequest, reply: FastifyReply) => {
    const start = (req as any)._startTime as bigint
    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1_000_000

    const key = buildCanonicalKey(req)

    // Request count
    await backend.increment(`${key}:requests`)

    // Latency histogram
    await backend.histogram(`${key}:latency`, durationMs)

    // Status code counters
    await backend.increment(`${key}:status:${reply.statusCode}`)
  })

  fastify.addHook("onError", async (req: FastifyRequest, _reply: FastifyReply, _err) => {
    const key = buildCanonicalKey(req)
    await backend.increment(`${key}:errors`)
  })
})
