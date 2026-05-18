// src/core/cache/sqlite-store.ts
import { getSqliteClient } from "@/core/clients/sqlite.js"

export class SQLiteCacheStore {
  private db = getSqliteClient()

  private getStmt = this.db.prepare<[string], { value: string }>(`
    SELECT value 
    FROM cache 
    WHERE key = ? 
      AND expires_at > strftime('%s','now')
  `)

  private setStmt = this.db.prepare(`
    INSERT INTO cache (key, value, expires_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      expires_at = excluded.expires_at
  `)

  private delStmt = this.db.prepare(`
    DELETE FROM cache WHERE key = ?
  `)

  private purgeStmt = this.db.prepare(`
    DELETE FROM cache 
    WHERE expires_at <= strftime('%s','now')
  `)

  async get(key: string): Promise<any | undefined> {
    this.purgeStmt.run()
    const row = this.getStmt.get(key)
    return row ? JSON.parse(row.value) : undefined
  }

  async set(key: string, value: any, ttlMs: number): Promise<void> {
    const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(ttlMs / 1000)
    this.setStmt.run(key, JSON.stringify(value), expiresAt)
  }

  async del(key: string): Promise<void> {
    this.delStmt.run(key)
  }
}
