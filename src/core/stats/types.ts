// src/core/stats/types.ts

export interface StatsBackend {
  /**
   * Increment a counter by 1.
   * Example keys:
   *   canonicalKey:requests
   *   canonicalKey:errors
   *   canonicalKey:breaker_open
   */
  increment(key: string): Promise<void>

  /**
   * Record a latency or numeric measurement.
   * Backends may implement this as:
   *   - histogram bucket update
   *   - XADD event
   *   - summary metric
   */
  histogram(key: string, value: number): Promise<void>

  /**
   * Set a gauge to an absolute value.
   * Useful for:
   *   - breaker state
   *   - in-flight request count
   *   - queue depth
   */
  gauge?(key: string, value: number): Promise<void>
}
