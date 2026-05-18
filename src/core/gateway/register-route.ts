// src/core/gateway/register-route.ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"
import { resolvePolicy } from "@/core/policy/resolved-policy.js"
import { callUpstream } from "@/core/upstream/call-upstream.js"
import { selectUpstream } from "@/core/upstream/select-upstream.js"

export function registerRoute(
  fastify: FastifyInstance,
  service: ServiceConfig,
  route: RouteConfig,
) {
  fastify.log.info(
    { method: route.methods, url: service.prefix + route.path },
    "Registering route",
  )

  fastify.route({
    method: route.methods ?? "GET",
    url: service.prefix + route.path,
    config: {
      service,
      route,
    },

    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      const globalConfig = fastify.globalConfig ?? {}

      // Resolve policy (retry, breaker, cache, etc.)
      const policy = resolvePolicy(req, globalConfig, service, route)

      // Weighted upstream selection
      const upstream = selectUpstream(route)

      // Discovery resolves the service target (DNS, SRV, static)
      const discovery = fastify.discoveryFactory.create(service)
      const discovered = await discovery.resolve(service)

      // If discovery returns a value, use it; otherwise use upstream.url
      const upstreamUrl = discovered ?? upstream.url

      // Call upstream with breaker, retry, collapse, cache, etc.
      const res = await callUpstream(req, service, route, upstreamUrl, {
        collapse: fastify.collapse,
        breakerFactory: fastify.breakerFactory,
        retry: policy.retry,
        breaker: policy.breaker,
        cache: policy.cache,
        httpClient: fastify.httpClient,
      })

      reply
        .status(res.statusCode ?? 200)
        .headers(res.headers ?? {})
        .send(res.body)
    },
  })
}
