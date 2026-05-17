// src/core/stats/types.ts

export interface StatsPayload {
  apiId: string
  correlationId?: string
  statusCode: number
  version: string
  eventType: "request"
  method: string
  path: string
  clientIp: string
  latencyMs: number
}

export interface IStatsRecorder {
  record(payload: StatsPayload): Promise<void>
}
