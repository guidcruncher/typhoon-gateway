// src/core/json/simdjson.ts

import * as simdjson from "simdjson"

/**
 * Fast JSON parsing using the simdjson Node addon.
 * This variant expects a UTF‑8 string, not a Buffer.
 */
export function fastJsonParse(buf: Buffer | Uint8Array): any {
  // Convert Buffer/Uint8Array → UTF‑8 string
  const json = Buffer.from(buf).toString("utf8")
  return simdjson.parse(json)
}
