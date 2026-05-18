// src/core/config/loader.ts

import fs from "node:fs/promises"
import path from "node:path"

import YAML from "yaml"

import type { ServiceConfig } from "@/core/manifest/types.js"
import type { GlobalConfig } from "@/core/manifest/types.js"

import { normaliseGlobal, normaliseService } from "./normalise.js"
import { ManifestSchema } from "./schema.js"

export class ConfigLoader {
  constructor(private readonly configDir: string) {}

  async load(): Promise<{
    global: GlobalConfig
    services: ServiceConfig[]
  }> {
    const files = await fs.readdir(this.configDir)

    for (const file of files) {
      if (!file.endsWith(".json") && !file.endsWith(".yaml") && !file.endsWith(".yml")) {
        continue
      }

      const fullPath = path.join(this.configDir, file)
      const raw = await fs.readFile(fullPath, "utf8")

      const parsed = file.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw)

      //
      // 1. Validate manifest via Zod
      //
      const validated = ManifestSchema.parse(parsed)

      //
      // 2. Normalise global + services
      //
      const global = normaliseGlobal(validated.global as any)
      const services = validated.services.map((s) => normaliseService(s as ServiceConfig))

      return { global, services }
    }

    throw new Error("No manifest files found in config directory")
  }
}
