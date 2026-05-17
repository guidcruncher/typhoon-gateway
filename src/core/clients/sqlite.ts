// src/core/clients/sqlite.ts

import Database from "better-sqlite3"

let client: Database.Database | null = null

export function getSqliteClient(): Database.Database {
  if (!client) {
    const file = process.env.SQLITE_PATH
    if (!file) {
      throw new Error("SQLite requested but SQLITE_PATH is not configured")
    }

    client = new Database(file)

    // Recommended for API gateway workloads
    client.pragma("journal_mode = WAL")
    client.pragma("synchronous = NORMAL")
    client.pragma("cache_size = -16000")   // ~16MB cache
    client.pragma("foreign_keys = ON")
  }

  return client
}
