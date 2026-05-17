// src/core/transformers/registry.ts

import type { RouteConfig, ServiceConfig, TransformerGroup } from "@/core/manifest/types.js"
// Import all transformers here
import { registry } from "@/transformers/index.js"

/**
 * Infer transformer mode based on implementation.
 *
 * - If transformer exports onResponseStream/onRequestStream → "stream"
 * - Otherwise → "object"
 */
export function inferTransformerMode(impl: any): "stream" | "object" {
  if (!impl) return "object"

  if (typeof impl.onResponseStream === "function") return "stream"
  if (typeof impl.onRequestStream === "function") return "stream"

  return "object"
}

/**
 * Run request transformers (object-mode only).
 * Streaming request transformers are handled in lifecycle-manager.
 */
export async function runRequestTransformers(
  group: TransformerGroup | undefined,
  req: any,
  service: ServiceConfig,
  route: RouteConfig,
) {
  const list = group?.onRequest ?? []

  for (const t of list) {
    const impl = registry[t.name]
    if (!impl) continue

    const mode = t.mode ?? inferTransformerMode(impl)

    // Streaming request transformers are handled upstream
    if (mode === "stream") continue

    if (typeof impl.onRequest === "function") {
      await impl.onRequest(req, service, route, t.config)
    }
  }
}

/**
 * Run response transformers (object-mode only).
 * Streaming response transformers are handled in lifecycle-manager.
 */
export async function runResponseTransformers(
  group: TransformerGroup | undefined,
  payload: any,
  service: ServiceConfig,
  route: RouteConfig,
) {
  const list = group?.onResponse ?? []
  let current = payload

  for (const t of list) {
    const impl = registry[t.name]
    if (!impl) continue

    const mode = t.mode ?? inferTransformerMode(impl)

    // Streaming transformers handled in lifecycle-manager
    if (mode === "stream") continue

    if (typeof impl.onResponse === "function") {
      current = await impl.onResponse(current, service, route, t.config)
    }
  }

  return current
}
