import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class MemcachedStatsRecorder implements IStatsRecorder {
  constructor(private readonly client: any) {}

  async record(payload: StatsPayload): Promise<void> {
    const key = `stats:${payload.apiId}:${Date.now()}`
    await this.client.set(key, Buffer.from(JSON.stringify(payload)), { expires: 300 })
  }
}
