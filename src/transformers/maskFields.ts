// src/transformers/maskFields.ts
import { Readable } from "node:stream"

import { createStreamingMasker } from "@/core/json/streaming-masker.js"

export const maskFields = {
  name: "maskFields",

  onResponse(payload: any, service: any, route: any, config: any) {
    // If payload is a stream → apply streaming masker
    if (payload instanceof Readable) {
      return payload.pipe(createStreamingMasker(config))
    }

    // Fallback: normal JSON object
    for (const field of config.fields) {
      delete payload[field]
    }

    return payload
  },
}
