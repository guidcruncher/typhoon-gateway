// src/plugins/collapse.ts
import fp from "fastify-plugin"

import { RequestCollapser } from "@/core/upstream/request-collapser.js"

export default fp(async function collapsePlugin(fastify) {
  fastify.decorate("collapse", {
    get: (key: string): Promise<any> | undefined => {
      return RequestCollapser.get(key)
    },
    set: (key: string, p: Promise<any>): void => {
      RequestCollapser.set(key, p)
    },
  })
})
