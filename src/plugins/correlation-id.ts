// src/plugins/correlation-id.ts

import fp from "fastify-plugin"

let counter = 0

export const generateCorrelationId = () => {
  const ts = Date.now()
  counter = (counter + 1) & 0xffff // keep it small + fast
  const rand = Math.random().toString(16).slice(2, 8)
  return `ty-${ts}-${counter}-${rand}`
}

export default fp(async function correlationIdPlugin(fastify) {
  fastify.decorateRequest("correlationId", "")

  fastify.addHook("onRequest", async (req, reply) => {
    // Prefer inbound header, otherwise generate
    const inbound = req.headers["x-correlation-id"]
    const id = typeof inbound === "string" && inbound.length > 0 ? inbound : req.id

    req.correlationId = id

    // Always send it back to the client
    reply.header("x-correlation-id", id)
  })

  // Make correlation ID available to upstream calls
  fastify.addHook("preHandler", async (req) => {
    // Attach correlation ID to outbound upstream requests
    req.headers["x-correlation-id"] = req.correlationId
  })
})
