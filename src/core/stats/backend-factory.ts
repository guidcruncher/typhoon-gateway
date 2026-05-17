// src/core/stats/backend-factory.ts

import type { StatsBackend } from "./types.js"
import { SqliteStatsBackend } from "./sqlite-backend.js"
import { RedisStreamsStatsBackend } from "./redis-streams-backend.js"
import { PrometheusStatsBackend } from "./prometheus-backend.js"
import { InMemoryStatsBackend } from "./in-memory-backend.js"

export type StatsBackendName =
  | "sqlite"
  | "redis"
  | "prometheus"
  | "memory"

export function createStatsBackend(name: StatsBackendName): StatsBackend {
  switch (name) {
    case "sqlite": {
      return new SqliteStatsBackend()

    case "redis": {
      const stream = process.env.REDIS_STATS_STREAM ?? "typhon:stats"
      return new RedisStreamsStatsBackend(stream)
    }

    case "prometheus": {
      return new PrometheusStatsBackend()
    }

    case "memory": {
      return new InMemoryStatsBackend()
    }

    default:
      throw new Error(`Unknown stats backend: ${name}`)
  }
}
