// src/core/upstream/canary.ts
import type { EffectiveCanaryPolicy } from "@/core/policy/types.js"

export function pickCanaryTarget(primaryTarget: string, canary?: EffectiveCanaryPolicy): string {
  if (!canary?.enabled) return primaryTarget
  if (canary.weight <= 0) return primaryTarget
  if (canary.weight >= 100) return canary.target

  const roll = Math.random() * 100
  return roll < canary.weight ? canary.target : primaryTarget
}
