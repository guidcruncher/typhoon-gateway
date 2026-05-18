// src/plugins/config-loader.ts

import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

import { ConfigLoader } from "@/core/config/loader.js"

export default fp(async function configLoaderPlugin(fastify: FastifyInstance) {
  const loader = new ConfigLoader("./config/services")
  const manifest = await loader.load()
  const services = manifest.services

  fastify.decorate("globalConfig", manifest.global as any)
  fastify.decorate("services", services)
  fastify.decorate("manifest", manifest)
})
