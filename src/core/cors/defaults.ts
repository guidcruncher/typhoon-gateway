import type { CorsConfig } from "@/core/manifest/types.js"

export const defaultCorsConfig: CorsConfig = {
  enabled: false,
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  exposedHeaders: [],
  credentials: true,
  maxAge: 600,
}
