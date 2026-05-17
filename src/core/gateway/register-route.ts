// src/core/gateway/register-route.ts

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"
import { resolvePolicy } from "@/core/policy/resolved-policy.js"
import { callUpstream } from "@/core/upstream/call-upstream.js"

export function registerRoute(
  fastify: FastifyInstance,
  service: ServiceConfig,
  route: RouteConfig,
) {
  fastify.log.info({ method: route.methods, url: service.prefix + route.path }, "Registering route")
  fastify.route({
    method: route.methods ?? "GET",
    url: service.prefix + route.path,
    config: {
      service,
      route,
    },
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      const globalConfig = fastify.globalConfig ?? {}

      const policy = resolvePolicy(req, globalConfig, service, route)

      const upstreamUrl = await fastify.discovery.resolve(service, policy.canary)

      const res = await callUpstream(req, service, route, upstreamUrl, {
        collapse: fastify.collapse,
        breakerFactory: fastify.breakerFactory,
        retry: policy.retry,
        httpClient: fastify.httpClient,
      })

      reply
        .status(res.statusCode ?? 200)
        .headers(res.headers ?? {})
        .send(res.body)
    },
  })
}
