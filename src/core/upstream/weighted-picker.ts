// src/core/upstream/weighted-picker.ts
import type { UpstreamTarget } from "@/core/manifest/types.js"

export interface WeightedUpstream {
  target: UpstreamTarget
  cumulative: number
}

export class WeightedUpstreamPicker {
  private readonly totalWeight: number
  private readonly table: WeightedUpstream[]

  constructor(upstreams: UpstreamTarget[]) {
    let cumulative = 0
    this.table = upstreams.map((target) => {
      const w = target.weight ?? 1
      cumulative += w
      return { target, cumulative }
    })
    this.totalWeight = cumulative
  }

  pick(rand: number = Math.random()): UpstreamTarget {
    const needle = rand * this.totalWeight

    for (const entry of this.table) {
      if (needle < entry.cumulative) {
        return entry.target
      }
    }

    // Fallback: last one (should never happen if totalWeight > 0)
    return this.table[this.table.length - 1]!.target
  }
}
