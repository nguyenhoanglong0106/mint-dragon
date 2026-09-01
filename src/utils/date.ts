import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

export const formatDate = (value: string) => dayjs(value).format('DD/MM/YYYY')
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
