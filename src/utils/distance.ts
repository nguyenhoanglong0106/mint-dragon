import type { LiveLocation } from '../types'

export const haversineMeters = (a: Pick<LiveLocation, 'latitude' | 'longitude'>, b: Pick<LiveLocation, 'latitude' | 'longitude'>) => {
  const earthRadius = 6371000
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

export const formatDistance = (meters?: number | null) => {
  if (meters == null) return 'Chưa có dữ liệu khoảng cách'
  if (meters < 100) return 'Đang ở gần nhau'
  if (meters < 1000) return `Cách nhau ${Math.round(meters)} m`
  return `Cách nhau ${(meters / 1000).toFixed(1)} km`
}
