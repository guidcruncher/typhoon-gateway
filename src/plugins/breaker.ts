// src/plugins/breaker-plugin.ts

import type { FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"

import { createBreakerFactory } from "@/core/breaker/factory.js"
import { createCircuitBreakerStore } from "@/core/breaker/store-factory.js"
import type { BreakerOptions } from "@/core/breaker/types.js"

export interface BreakerPluginOptions {
  store: string
  defaultOptions: BreakerOptions
  perService?: Record<string, Partial<BreakerOptions>>
}

const breakerPlugin: FastifyPluginAsync<BreakerPluginOptions> = async (fastify, opts) => {
  const { store, defaultOptions, perService = {} } = opts
  const breakerStore = createCircuitBreakerStore({ kind: store })

  const factory = createBreakerFactory({
    store: breakerStore,
    defaultOptions,
    perService,
  })

  fastify.decorate("breakerFactory", factory)
}

export default fp(breakerPlugin, {
  name: "breaker-plugin",
})
