import { pipeline } from "node:stream"
import { promisify } from "node:util"
import { createBrotliCompress, createDeflate, createGzip } from "node:zlib"

const pump = promisify(pipeline)

const COMPRESSIBLE_TYPES = [
  "text/",
  "application/json",
  "application/javascript",
  "application/xml",
  "image/svg+xml",
]

function isCompressible(contentType?: string): boolean {
  if (!contentType) return false
  const lower = contentType.toLowerCase()
  return COMPRESSIBLE_TYPES.some((t) => lower.startsWith(t))
}

function negotiateEncoding(acceptEncoding: string | undefined) {
  if (!acceptEncoding) return null
  const ae = acceptEncoding.toLowerCase()

  if (ae.includes("br")) return "br"
  if (ae.includes("gzip")) return "gzip"
  if (ae.includes("deflate")) return "deflate"
  if (ae.includes("identity") || ae === "*") return "identity"

  return null
}

export const compressResponse = {
  name: "compressResponse",

  async onResponseStream(
    upstream: NodeJS.ReadableStream,
    ctx: {
      req: { headers: Record<string, string | string[] | undefined> }
      res: {
        headers: {
          get(n: string): string | undefined
          set(n: string, v: string): void
          delete(n: string): void
        }
      }
    },
  ): Promise<NodeJS.ReadableStream> {
    const acceptEncodingHeader = ctx.req.headers["accept-encoding"]
    const acceptEncoding = Array.isArray(acceptEncodingHeader)
      ? acceptEncodingHeader.join(",")
      : acceptEncodingHeader

    const contentEncoding = ctx.res.headers.get("content-encoding")
    const contentType = ctx.res.headers.get("content-type") || undefined

    if (contentEncoding || !isCompressible(contentType)) {
      return upstream
    }

    const encoding = negotiateEncoding(acceptEncoding)
    if (!encoding || encoding === "identity") {
      return upstream
    }

    ctx.res.headers.delete("content-length")
    ctx.res.headers.set("content-encoding", encoding)

    let compressor: NodeJS.ReadWriteStream

    switch (encoding) {
      case "br":
        compressor = createBrotliCompress()
        break
      case "gzip":
        compressor = createGzip()
        break
      case "deflate":
        compressor = createDeflate()
        break
      default:
        return upstream
    }

    const compressed = compressor as unknown as NodeJS.ReadableStream & { destroy(): void }

    void pump(upstream, compressor).catch(() => {
      compressed.destroy()
    })

    return compressed
  },
}
