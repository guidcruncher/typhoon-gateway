import { readFileSync } from "node:fs"
import { join } from "node:path"

export type JsonSchema = Record<string, any>

const schemaDir = join(process.cwd(), "config/schemas")

function loadSchema(name: string): JsonSchema {
  const file = join(schemaDir, `${name}.json`)
  return JSON.parse(readFileSync(file, "utf8"))
}

export const SchemaRegistry = {
  get(name: string): JsonSchema {
    try {
      return loadSchema(name)
    } catch (err) {
      throw new Error(`Schema "${name}" not found`, { cause: err })
    }
  },
}
