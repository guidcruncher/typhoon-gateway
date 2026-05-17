import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class OpenMetricsStatsRecorder implements IStatsRecorder {
  private counters = new Map<string, number>()
  private histograms = new Map<string, number[]>()

  private inc(key: string) {
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1)
  }

  private observe(key: string, value: number) {
    const arr = this.histograms.get(key) ?? []
    arr.push(value)
    this.histograms.set(key, arr)
  }

  async record(payload: StatsPayload): Promise<void> {
    this.inc(
      `typhon_requests_total{apiId="${payload.apiId}",method="${payload.method}",statusCode="${payload.statusCode}"}`,
    )

    if (payload.statusCode >= 500) {
      this.inc(`typhon_errors_total{apiId="${payload.apiId}",statusCode="${payload.statusCode}"}`)
    }

    this.observe(`typhon_request_latency_ms{apiId="${payload.apiId}"}`, payload.latencyMs)
  }

  renderMetrics(): string {
    let out = ""

    for (const [key, value] of this.counters) {
      out += `${key} ${value}\n`
    }

    for (const [key, values] of this.histograms) {
      for (const v of values) {
        out += `${key} ${v}\n`
      }
    }

    return out
  }
}
