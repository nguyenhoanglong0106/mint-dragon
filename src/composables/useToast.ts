import { ref } from 'vue'
import type { ToastMessage } from '../types'

const messages = ref<ToastMessage[]>([])
let seed = 0

export function useToast() {
  const push = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = ++seed
    messages.value.push({ id, text, type })
    window.setTimeout(() => dismiss(id), 3800)
    // Gửi system notification nếu permission được cấp
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Mint Dragon 💕', { body: text, icon: '/favicon.svg' })
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
