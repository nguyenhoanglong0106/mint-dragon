import { describe, expect, it } from 'vitest'
import { formatDistance, haversineMeters } from '../src/utils/distance'

describe('haversineMeters', () => {
  it('returns 0 for identical coordinates', () => {
    const point = { latitude: 10.7769, longitude: 106.7009 }
    expect(haversineMeters(point, point)).toBeCloseTo(0, 5)
  })

  it('computes the known distance between Hanoi and Ho Chi Minh City', () => {
    const hanoi = { latitude: 21.0278, longitude: 105.8342 }
    const hcmc = { latitude: 10.8231, longitude: 106.6297 }
    const meters = haversineMeters(hanoi, hcmc)
    // Great-circle distance is ~1140-1160 km depending on the exact reference points used.
    expect(meters).toBeGreaterThan(1_100_000)
    expect(meters).toBeLessThan(1_200_000)
  })

  it('is symmetric', () => {
    const a = { latitude: 10.77, longitude: 106.7 }
    const b = { latitude: 10.8, longitude: 106.65 }
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6)
  })
})

describe('formatDistance', () => {
  it('reports missing data when meters is null or undefined', () => {
    expect(formatDistance(null)).toBe('Chưa có dữ liệu khoảng cách')
    expect(formatDistance(undefined)).toBe('Chưa có dữ liệu khoảng cách')
  })

  it('shows "dang o gan nhau" under 100m', () => {
    expect(formatDistance(50)).toBe('Đang ở gần nhau')
    expect(formatDistance(0)).toBe('Đang ở gần nhau')
  })

  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistance(350)).toBe('Cách nhau 350 m')
    expect(formatDistance(999)).toBe('Cách nhau 999 m')
  })

  it('formats distances of 1km or more in kilometers', () => {
    expect(formatDistance(2400)).toBe('Cách nhau 2.4 km')
    expect(formatDistance(1000)).toBe('Cách nhau 1.0 km')
  })
})
