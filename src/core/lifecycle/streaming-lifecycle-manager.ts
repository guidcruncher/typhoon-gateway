// src/core/lifecycle/streaming-lifecycle-manager.ts

import { pipeline, Readable } from "node:stream"
import { promisify } from "node:util"

import type { FastifyReply, FastifyRequest } from "fastify"

const pump = promisify(pipeline)

export class StreamingLifecycleManager {
  static isStreaming(upstream: Response): boolean {
    const te = upstream.headers.get("transfer-encoding")
    const ct = upstream.headers.get("content-type")
    const cl = upstream.headers.get("content-length")

    if (!upstream.body) return false
    if (ct?.includes("text/event-stream")) return true
    if (te?.includes("chunked")) return true
    if (!cl) return true

    return false
  }

  async handle(req: FastifyRequest, reply: FastifyReply, upstream: Response) {
    reply.status(upstream.status)
    upstream.headers.forEach((v, k) => reply.header(k, v))

    const nodeStream =
      upstream.body instanceof Readable ? upstream.body : Readable.fromWeb(upstream.body as any)

    reply.hijack()
    await pump(nodeStream, reply.raw)
  }
}
