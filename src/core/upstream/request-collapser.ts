// src/core/upstream/request-collapser.ts

export class RequestCollapser {
  private static pending = new Map<string, Promise<any>>()

  static async execute<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key)
    if (existing) return existing as Promise<T>

    const p = factory().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, p)
    return p
  }
}
