// src/core/breaker/store.ts
export interface CircuitBreakerStore {
  getState(key: string): Promise<string | null>
  setState(key: string, value: string): Promise<void>

  getNumber(key: string): Promise<number>
  setNumber(key: string, value: number): Promise<void>
  incr(key: string): Promise<number>
  del(key: string): Promise<void>
}
