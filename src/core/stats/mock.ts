import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class MockStatsRecorder implements IStatsRecorder {
  public last: StatsPayload | null = null

  async record(payload: StatsPayload): Promise<void> {
    this.last = payload
  }
}
