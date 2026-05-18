// src/plugins/gateway-core.ts

import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"

import { registerRoute } from "@/core/gateway/register-route.js"
import type { RouteConfig } from "@/core/manifest/types.js"

const gatewayCorePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  for (const service of fastify.manifest.services) {
    for (const route of service.routes as RouteConfig[]) {
      registerRoute(fastify, service, route)
    }
  }
}

export default fp(gatewayCorePlugin, { name: "gateway-core" })
