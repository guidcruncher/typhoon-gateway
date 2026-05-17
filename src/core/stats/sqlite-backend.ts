// src/core/stats/sqlite-backend.ts

import { getSqliteClient } from "@/core/clients/sqlite.js"

import type { StatsBackend } from "./types.js"

export class SqliteStatsBackend implements StatsBackend {
  private db = getSqliteClient()
  private insertStmt = this.db.prepare(`
    INSERT INTO stats_events (timestamp, type, key, value)
    VALUES (?, ?, ?, ?)
  `)

  async increment(key: string): Promise<void> {
    this.insertStmt.run(Date.now(), "counter", key, 1)
  }

  async histogram(key: string, value: number): Promise<void> {
    this.insertStmt.run(Date.now(), "histogram", key, value)
  }

  async gauge(key: string, value: number): Promise<void> {
    this.insertStmt.run(Date.now(), "gauge", key, value)
  }

  // Optional helper for debugging
  getEvents(limit = 1000) {
    return this.db.prepare(`SELECT * FROM stats_events ORDER BY id DESC LIMIT ?`).all(limit)
  }
}
