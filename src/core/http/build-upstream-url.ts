import type { FastifyRequest } from "fastify"

export function buildUpstreamUrl(base: string, routePath: string, req: FastifyRequest): string {
  const url = new URL(base)
  url.pathname = routePath

  const query = req.raw.url?.split("?")[1]
  if (query) url.search = query

  return url.toString()
}
