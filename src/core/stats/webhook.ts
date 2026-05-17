import axios from "axios"

import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class WebhookStatsRecorder implements IStatsRecorder {
  constructor(private readonly url: string) {}

  async record(payload: StatsPayload): Promise<void> {
    try {
      await axios.post(this.url, {
        timestamp: Date.now(),
        ...payload,
      })
    } catch (err) {
      console.warn("WebhookStatsRecorder failed:", (err as any).message)
    }
  }
}
