import { ref } from 'vue'
import type { ToastMessage } from '../types'

const messages = ref<ToastMessage[]>([])
let seed = 0

export function useToast() {
  const push = (text: string, type: ToastMessage['type'] = 'info', notification?: { title: string; body: string }) => {
    const id = ++seed
    messages.value.push({ id, text, type })
    window.setTimeout(() => dismiss(id), 3800)
    // Chỉ bắn system notification (kể cả khi hiện trên màn hình khóa) cho các sự kiện có
    // nội dung rõ ràng, cụ thể được truyền vào — không dùng cho toast báo lỗi/thao tác vặt.
    if (notification && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.body, icon: '/favicon.svg' })
    }
  }
  const dismiss = (id: number) => { messages.value = messages.value.filter((item) => item.id !== id) }
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }
  return { messages, push, dismiss, requestPermission }
}
