import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { daysBetween, timeAgoLabel } from '../src/utils/date'

describe('daysBetween', () => {
  it('returns 0 when there is no start date', () => {
    expect(daysBetween(null)).toBe(0)
    expect(daysBetween(undefined)).toBe(0)
  })

  it('counts whole days between two dates', () => {
    const from = '2024-01-01'
    const to = dayjs('2024-01-11')
    expect(daysBetween(from, to)).toBe(10)
  })

  it('never returns a negative number for future start dates', () => {
    const future = dayjs().add(5, 'day').format('YYYY-MM-DD')
    expect(daysBetween(future)).toBe(0)
  })
})

describe('timeAgoLabel', () => {
  it('reports missing data when there is no timestamp', () => {
    expect(timeAgoLabel(null)).toBe('Không có dữ liệu vị trí')
  })

  it('reports active status under 60 seconds', () => {
    const now = dayjs().subtract(10, 'second').toISOString()
    expect(timeAgoLabel(now)).toBe('Đang hoạt động')
  })

  it('reports stale status after 30 minutes', () => {
    const old = dayjs().subtract(40, 'minute').toISOString()
    expect(timeAgoLabel(old)).toBe('Vị trí cũ')
  })
})
