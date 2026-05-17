import type { Redis } from "ioredis"

import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class RedisStatsRecorder implements IStatsRecorder {
  constructor(private readonly client: Redis) {}

  async record(payload: StatsPayload): Promise<void> {
    await this.client.xadd(
      `stats:${payload.apiId}`,
      "*",
      "eventType",
      payload.eventType,
      "correlationId",
      payload.correlationId ?? "",
      "version",
      payload.version,
      "method",
      payload.method,
      "path",
      payload.path,
      "statusCode",
      String(payload.statusCode),
      "clientIp",
      payload.clientIp,
      "latencyMs",
      String(payload.latencyMs),
    )
  }
}
