import type { VerifyPayloadType } from "@fastify/jwt"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

// -----------------------------------------------------
// Define your own user type
// -----------------------------------------------------
export interface AuthenticatedUser {
  sub: string
  roles: string[]
  raw: VerifyPayloadType
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  // -----------------------------------------------------
  // Register JWT
  // -----------------------------------------------------
  fastify.register(import("@fastify/jwt"), {
    secret: process.env.JWT_SECRET || "dev-secret",
  })

  // -----------------------------------------------------
  // Decorate authenticate()
  // -----------------------------------------------------
  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = await request.jwtVerify<VerifyPayloadType>()

      const sub = typeof token === "object" && "sub" in token ? String(token.sub) : ""

      const roles =
        typeof token === "object" && Array.isArray((token as any).roles)
          ? (token as any).roles.map(String)
          : typeof token === "object" && "role" in token
            ? [String((token as any).role)]
            : []

      request.authUser = {
        sub,
        roles,
        raw: token,
      }
    } catch {
      return reply.status(401).send({ error: "unauthorized" })
    }
  })
})
