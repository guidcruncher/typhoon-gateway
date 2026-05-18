// src/core/stats/redis-streams-backend.ts

import { getRedisClient } from "@/core/clients/redis.js"

import type { StatsBackend } from "./types.js"

export class RedisStreamsStatsBackend implements StatsBackend {
  private client = getRedisClient()
  private stream: string

  constructor(streamName = "typhon:stats") {
    this.stream = streamName
  }

  async increment(key: string): Promise<void> {
    await this.client.xadd(this.stream, "*", "type", "counter", "key", key, "value", "1")
  }

  async histogram(key: string, value: number): Promise<void> {
    await this.client.xadd(
      this.stream,
      "*",
      "type",
      "histogram",
      "key",
      key,
      "value",
      String(value),
    )
  }

  async gauge(key: string, value: number): Promise<void> {
    await this.client.xadd(this.stream, "*", "type", "gauge", "key", key, "value", String(value))
  }
}
