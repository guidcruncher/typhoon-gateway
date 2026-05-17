import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class MemoryStatsRecorder implements IStatsRecorder {
  private events: StatsPayload[] = []

  async record(payload: StatsPayload): Promise<void> {
    this.events.push(payload)
  }
}
