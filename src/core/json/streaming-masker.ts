// src/core/json/streaming-masker.ts

import { Transform } from "node:stream"

import JSONParser from "jsonparse"

export interface MaskFieldsConfig {
  fields: string[] // fields to remove or mask
  maskValue?: any // default: undefined (remove)
}

export function createStreamingMasker(config: MaskFieldsConfig) {
  const parser = new JSONParser()
  const fieldsToMask = new Set(config.fields)
  const maskValue = config.maskValue ?? undefined

  const transformer = new Transform({
    readableObjectMode: false,
    writableObjectMode: false,

    transform(chunk, _enc, cb) {
      try {
        parser.write(chunk)
        cb()
      } catch (err) {
        cb(err as Error)
      }
    },
  })

  // Output builder
  let output = ""
  const pushOut = (str: string) => transformer.push(str)

  parser.onValue = function (value: any) {
    const key = this.key

    if (key && fieldsToMask.has(key)) {
      // Mask or remove
      if (maskValue === undefined) {
        // Remove field entirely
        this.parent[this.key] = undefined
      } else {
        // Replace with mask value
        this.parent[this.key] = maskValue
      }
    }

    // When a full object/array is complete, emit it
    if (this.stack.length === 0) {
      output = JSON.stringify(value)
      pushOut(output)
    }
  }

  return transformer
}
