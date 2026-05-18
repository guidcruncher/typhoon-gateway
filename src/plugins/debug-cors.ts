// src/plugins/debug-cors.ts

import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

import type { RouteConfig, ServiceConfig } from "@/core/manifest/types.js"

function mergeCors(globalCors: any, serviceCors: any, routeCors: any) {
  return {
    ...globalCors,
    ...serviceCors,
    ...routeCors,
  }
}

export default fp(async function debugCorsPlugin(fastify: FastifyInstance) {
  fastify.get("/__debug/cors", async () => {
    const global = fastify.globalConfig.cors

    const services = fastify.services.map((service: ServiceConfig) => {
      return {
        name: service.name,
        prefix: service.prefix,
        cors: service.cors,
        routes: service.routes.map((route: RouteConfig) => {
          const merged = mergeCors(global, service.cors, route.cors)

          return {
            path: route.path,
            methods: route.methods,
            cors: merged,
          }
        }),
      }
    })

    return {
      global,
      services,
    }
  })
})
