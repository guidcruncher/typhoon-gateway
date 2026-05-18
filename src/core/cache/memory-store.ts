import type { ICacheStore } from "./types.js"

export class MemoryCacheStore implements ICacheStore {
  private cache = new Map<string, { value: string; expires: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }
}
