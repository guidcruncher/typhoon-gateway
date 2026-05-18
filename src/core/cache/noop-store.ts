import type { ICacheStore } from "./types.js"

export class NoopCacheStore implements ICacheStore {
  async get(): Promise<string | null> {
    return null
  }
  async set(): Promise<void> {}
  async del(): Promise<void> {}
}
