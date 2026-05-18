// src/core/upstream/select-upstream.ts
import { WeightedUpstreamPicker } from "./weighted-picker.js"

export function selectUpstream(route: any) {
  if (!route.upstreams || route.upstreams.length === 0) {
    throw new Error(`Route ${route.path} must define upstreams[]`)
  }

  // Use the weighted picker class
  const picker = new WeightedUpstreamPicker(route.upstreams)
  return picker.pick()
}
