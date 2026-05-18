// src/plugins/discovery.ts

import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

import { DiscoveryFactory } from "@/core/discovery/factory.js"

export default fp(async function discoveryPlugin(fastify: FastifyInstance) {
  const dnsResolver = async (hostname: string) => hostname

  const factory = new DiscoveryFactory({ dnsResolver })

  fastify.decorate("discoveryFactory", factory)
})
