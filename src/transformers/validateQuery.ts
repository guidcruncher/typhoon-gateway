import { SchemaRegistry } from "@/core/schemas/registry.js"
import { ajv } from "@/core/schemas/validator.js"

export const validateQuery = {
  name: "validateQuery",

  async onRequest(req: any, config: any) {
    if (!config?.schema) {
      return
    }

    const schemaName = config?.schema
    if (!schemaName) {
      throw new Error("validateQuery requires config.schema")
    }

    const schema = SchemaRegistry.get(schemaName)
    const validate = ajv.compile(schema)

    const ok = validate(req.query)

    if (!ok) {
      throw new Error(`Query validation failed: ${JSON.stringify(validate.errors)}`)
    }
  },
}
