import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

export const formatDate = (value: string) => dayjs(value).format('DD/MM/YYYY')
export const relativeTimeLabel = (value: string) => dayjs(value).fromNow()
export const todayIso = () => dayjs().format('YYYY-MM-DD')
export const daysBetween = (from?: string | null, to = dayjs()) => from ? Math.max(0, to.startOf('day').diff(dayjs(from).startOf('day'), 'day')) : 0
export const greeting = () => {
  const hour = dayjs().hour()
  if (hour < 11) return 'Chào buổi sáng'
  if (hour < 18) return 'Hôm nay mình cùng nhau nhé'
  return 'Một ngày nữa lại qua cùng nhau'
}
export const timeAgoLabel = (updatedAt?: string | null) => {
  if (!updatedAt) return 'Không có dữ liệu vị trí'
  const seconds = dayjs().diff(dayjs(updatedAt), 'second')
  if (seconds < 60) return 'Đang hoạt động'
  if (seconds < 300) return 'Vừa cập nhật'
  if (seconds < 1800) return `${Math.floor(seconds / 60)} phút trước`
  return 'Vị trí cũ'
}
export const nextOccurrence = (date: string, repeatYearly: boolean) => {
  let next = dayjs(date)
  const now = dayjs().startOf('day')
  if (repeatYearly) {
    next = next.year(now.year())
    if (next.isBefore(now)) next = next.add(1, 'year')
  }
  return next
}
export const countdownLabel = (date: string, repeatYearly: boolean) => {
  const days = nextOccurrence(date, repeatYearly).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (days === 0) return 'Hôm nay là ngày đặc biệt'
  if (days === 1) return 'Còn 1 ngày nữa'
  return `Còn ${days} ngày nữa`
}

export interface ElapsedBreakdown { years: number; months: number; weeks: number; days: number; hours: number; minutes: number; seconds: number }

// Chia thời gian đã bên nhau (từ `from` tới hiện tại) thành năm/tháng/tuần/ngày/giờ/phút/giây,
// mỗi đơn vị chỉ tính phần dư sau khi đã trừ các đơn vị lớn hơn (không cộng dồn).
export const elapsedBreakdown = (from: string): ElapsedBreakdown => {
  const start = dayjs(from).startOf('day')
  const now = dayjs()
  if (now.isBefore(start)) return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }

  const years = now.diff(start, 'year')
  let cursor = start.add(years, 'year')
  const months = now.diff(cursor, 'month')
  cursor = cursor.add(months, 'month')
  const totalDays = now.diff(cursor, 'day')
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7
  cursor = cursor.add(totalDays, 'day')
  const totalSeconds = now.diff(cursor, 'second')
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { years, months, weeks, days, hours, minutes, seconds }
}
