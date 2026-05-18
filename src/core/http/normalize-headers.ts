// src/core/http/normalize-headers.ts

export function normalizeHeaders(req: any): Record<string, string> {
  const out: Record<string, string> = {}

  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue

    // Skip headers that must not be forwarded
    if (key === "host") continue

    // Flatten arrays
    if (Array.isArray(value)) {
      out[key] = value.join("; ")
    } else {
      out[key] = String(value)
    }
  }

  // Inject Typhoon correlation ID
  out["x-correlation-id"] = req.id

  return out
}
