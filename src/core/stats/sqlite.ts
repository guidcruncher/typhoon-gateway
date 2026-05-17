import Database from "better-sqlite3"

import type { IStatsRecorder, StatsPayload } from "@/core/stats/types.js"

export class SQLiteStatsRecorder implements IStatsRecorder {
  private insert: any

  constructor(dbPath: string) {
    const db = new Database(dbPath)

    db.exec(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        apiId TEXT NOT NULL,
        eventType TEXT NOT NULL,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        statusCode INTEGER NOT NULL,
        latencyMs INTEGER,
        clientIp TEXT,
        version TEXT
      )
    `)

    this.insert = db.prepare(`
      INSERT INTO stats (
        timestamp, apiId, eventType, method, path, statusCode,
        latencyMs, clientIp, version
      ) VALUES (
        @timestamp, @apiId, @eventType, @method, @path, @statusCode,
        @latencyMs, @clientIp, @version
      )
    `)
  }

  async record(payload: StatsPayload): Promise<void> {
    this.insert.run({
      timestamp: Date.now(),
      apiId: payload.apiId,
      eventType: payload.eventType,
      method: payload.method,
      path: payload.path,
      statusCode: payload.statusCode,
      latencyMs: payload.latencyMs,
      clientIp: payload.clientIp,
      version: payload.version,
    })
  }
}
