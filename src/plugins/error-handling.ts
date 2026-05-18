import { FastifyPluginAsync } from "fastify"

export const errorHandlingPlugin: FastifyPluginAsync = async (fastify: any) => {
  //
  // Catch‑all 404 handler (must be registered last)
  //
  fastify.setNotFoundHandler((req: any, reply: any) => {
    reply.status(404).send({
      status: 404,
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.url} does not exist`,
      correlationId: req.correlationId,
    })
  })

  //
  // Global error handler — converts all Fastify errors into Typhon format
  //
  fastify.setErrorHandler((err: any, req: any, reply: any) => {
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500

    reply.status(status).send({
      status,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred",
      correlationId: req.correlationId,
    })
  })
}

export default errorHandlingPlugin
