import memjs from "memjs"

import type { ICacheStore } from "./types.js"

export class MemcachedStore implements ICacheStore {
  private client = memjs.Client.create(process.env.MEMCACHED_URL || "localhost:11211")

  async get(key: string): Promise<string | null> {
    const result = await this.client.get(key)
    return result.value ? result.value.toString() : null
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, Buffer.from(value), { expires: ttlSeconds })
  }

  async del(key: string): Promise<void> {
    await this.client.delete(key)
  }
}
