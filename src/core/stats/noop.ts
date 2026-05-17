import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class NoopStatsRecorder implements IStatsRecorder {
  async record(_payload: StatsPayload): Promise<void> {
    // intentionally empty
  }
}
