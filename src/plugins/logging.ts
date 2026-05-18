// src/plugins/logging.ts

import fp from "fastify-plugin"

export default fp(async function loggingPlugin(fastify) {
  fastify.addHook("onRequest", async (req) => {
    req.log = req.log.child({})
  })
})
