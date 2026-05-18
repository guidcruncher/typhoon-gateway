// src/plugins/cors.ts

import cors from "@fastify/cors"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

export interface CorsOptions {
  enabled?: boolean
  origin?: string | string[]
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

export default fp(async function corsPlugin(fastify: FastifyInstance, opts: CorsOptions) {
  // If CORS is disabled globally, do nothing
  if (opts?.enabled === false) {
    fastify.log.info("Global CORS disabled")
    return
  }

  // Register @fastify/cors with provided options
  await fastify.register(cors, {
    origin: opts.origin ?? "*",
    methods: opts.methods ?? ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: opts.allowedHeaders,
    exposedHeaders: opts.exposedHeaders,
    credentials: opts.credentials,
    maxAge: opts.maxAge,
  })

  fastify.log.info("Global CORS enabled")
})
