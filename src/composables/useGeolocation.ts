import { onBeforeUnmount, ref } from 'vue'
import type { LocationPayload } from '../types'

type PositionHandler = (payload: LocationPayload) => Promise<void> | void

const toPayload = (position: GeolocationPosition): LocationPayload => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy ?? null,
  altitude: position.coords.altitude ?? null,
  heading: position.coords.heading ?? null,
  speed: position.coords.speed ?? null
})

export function useGeolocation(onPosition: PositionHandler) {
  const permission = ref<'idle' | 'watching' | 'denied' | 'unsupported' | 'timeout' | 'error'>('idle')
  const lastError = ref('')
  const watchId = ref<number | null>(null)
  let lastSentAt = 0
  let lastPayload: LocationPayload | null = null

  const shouldSend = (next: LocationPayload) => {
    const now = Date.now()
    if (!lastPayload) return true
    const elapsed = now - lastSentAt
    const moved = Math.hypot(next.latitude - lastPayload.latitude, next.longitude - lastPayload.longitude) * 111_000
    return elapsed > 8000 || moved > 15
  }

  const start = () => {
    if (!('geolocation' in navigator)) { permission.value = 'unsupported'; return }
    permission.value = 'watching'
    watchId.value = navigator.geolocation.watchPosition(async (position) => {
      const payload = toPayload(position)
      if (!shouldSend(payload)) return
      lastSentAt = Date.now(); lastPayload = payload
      try { await onPosition(payload) }
      catch (err) { if (import.meta.env.DEV) console.error('Gui vi tri that bai', err) }
    }, (error) => {
      if (error.code === error.PERMISSION_DENIED) permission.value = 'denied'
      else if (error.code === error.TIMEOUT) permission.value = 'timeout'
      else permission.value = 'error'
      lastError.value = error.message
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 })
  }

  const stop = () => {
    if (watchId.value != null) navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
    permission.value = 'idle'
  }

  onBeforeUnmount(stop)
  return { permission, lastError, start, stop }
}
