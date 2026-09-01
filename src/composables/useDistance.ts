import { computed } from 'vue'
import type { LiveLocation } from '../types'
import { formatDistance, haversineMeters } from '../utils/distance'

export function useDistance(a: () => LiveLocation | null | undefined, b: () => LiveLocation | null | undefined) {
  const meters = computed(() => a() && b() ? haversineMeters(a()!, b()!) : null)
  const label = computed(() => formatDistance(meters.value))
  return { meters, label }
}
