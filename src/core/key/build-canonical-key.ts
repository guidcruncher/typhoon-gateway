// src/core/key/canonical-key.ts

import crypto from "node:crypto"

import type { FastifyRequest } from "fastify"

export interface CanonicalKeyOptions {
  includeHeaders?: string[]
  includeBody?: boolean
  prefix?: string
}

export function buildCanonicalKey(
  req: FastifyRequest,
  serviceName: string,
  routePath: string,
  opts: CanonicalKeyOptions = {},
): string {
  const { includeHeaders = [], includeBody = false, prefix = "gw" } = opts

  const base = {
    service: serviceName,
    route: routePath,
    method: req.method,
    path: req.url,
    params: req.params ?? {},
    query: req.query ?? {},
    headers: pickHeaders(req.headers, includeHeaders),
    body: includeBody ? (req.body ?? {}) : undefined,
  }

  const json = stableStringify(base)
  const hash = sha256(json)

  return `${prefix}:${serviceName}:${hash}`
}

function pickHeaders(headers: Record<string, any>, keys: string[]) {
  if (!keys.length) return undefined
  const out: Record<string, any> = {}
  for (const k of keys) {
    if (headers[k.toLowerCase()]) {
      out[k] = headers[k.toLowerCase()]
    }
  }
  return out
}

function stableStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex")
}
