// src/core/cors/merge.ts

import type { CorsConfig } from "@/core/manifest/types.js"

export function mergeCors(
  global?: Partial<CorsConfig>,
  service?: Partial<CorsConfig>,
  route?: Partial<CorsConfig>,
): Partial<CorsConfig> | undefined {
  const merged: Partial<CorsConfig> = {
    ...global,
    ...service,
    ...route,
  }

  if (merged.enabled === false) {
    return { enabled: false }
  }

  if (!merged.enabled) {
    return undefined
  }

  if (merged.origin) merged.origin = normalizeArray(merged.origin)
  if (merged.methods) merged.methods = normalizeArray(merged.methods)
  if (merged.allowedHeaders) merged.allowedHeaders = normalizeArray(merged.allowedHeaders)
  if (merged.exposedHeaders) merged.exposedHeaders = normalizeArray(merged.exposedHeaders)

  return merged
}

function normalizeArray(value: string | string[]): string[] {
  if (value === "*") return ["*"]
  return Array.isArray(value) ? value : [value]
}
