import { getMemCachedClient } from "@/core/clients/memcached.js"
import { getRedisClient } from "@/core/clients/redis.js"

import { FileStatsRecorder } from "./file.js"
import { MemcachedStatsRecorder } from "./memcached.js"
import { MemoryStatsRecorder } from "./memory.js"
import { MockStatsRecorder } from "./mock.js"
import { NoopStatsRecorder } from "./noop.js"
import { OpenMetricsStatsRecorder } from "./openmetrics.js"
import { RedisStatsRecorder } from "./redis.js"
import { SQLiteStatsRecorder } from "./sqlite.js"
import type { IStatsRecorder } from "./types.js"
import { WebhookStatsRecorder } from "./webhook.js"

export class StatsRecorderFactory {
  static create(type: string, config: any = {}): IStatsRecorder {
    switch (type) {
      case "redis":
        return new RedisStatsRecorder(getRedisClient())
      case "memcached":
        return new MemcachedStatsRecorder(getMemCachedClient())
      case "mock":
        return new MockStatsRecorder()
      case "none":
        return new NoopStatsRecorder()
      case "memory":
        return new MemoryStatsRecorder()
      case "openmetrics":
        return new OpenMetricsStatsRecorder()
      case "sqlite":
        if (!config.path) {
          console.warn("SQLite recorder selected but no path provided — using Noop")
          return new NoopStatsRecorder()
        }
        return new SQLiteStatsRecorder(config.path)
      case "file":
        if (!config.path) {
          console.warn("File recorder selected but no path provided — using Noop")
          return new NoopStatsRecorder()
        }
        return new FileStatsRecorder(config.path)
      case "webhook":
        if (!config.url) {
          console.warn("Webhook recorder selected but no URL provided — using Noop")
          return new NoopStatsRecorder()
        }
        return new WebhookStatsRecorder(config.url)

      // --- Default fallback ---
      default:
        return new MemoryStatsRecorder()
    }
  }
}
