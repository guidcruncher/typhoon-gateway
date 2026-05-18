import { randomUUID } from "crypto"
import { FastifyReply, FastifyRequest } from "fastify"

export async function correlationMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const headerName = "x-correlation-id"
  // Use existing ID or generate a new one
  const correlationId = (request.headers[headerName] as string) || randomUUID()

  // Set on request so transformers and recorders can access it
  ;(request as any).correlationId = correlationId

  // Inject into upstream headers
  request.headers[headerName] = correlationId

  // Set in response header so the client can reference it for support
  reply.header(headerName, correlationId)
}
