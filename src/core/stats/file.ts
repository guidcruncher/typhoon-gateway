import { appendFile } from "node:fs/promises"

import type { IStatsRecorder } from "@/core/stats/types.js"
import type { StatsPayload } from "@/core/stats/types.js"

export class FileStatsRecorder implements IStatsRecorder {
  constructor(private readonly filePath: string) {}

  async record(payload: StatsPayload): Promise<void> {
    const line =
      JSON.stringify({
        timestamp: Date.now(),
        ...payload,
      }) + "\n"

    await appendFile(this.filePath, line)
  }
}
