import { ref } from 'vue'
import type { ToastMessage } from '../types'

const messages = ref<ToastMessage[]>([])
let seed = 0

export function useToast() {
  const push = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = ++seed
    messages.value.push({ id, text, type })
    window.setTimeout(() => dismiss(id), 3800)
  }
  const dismiss = (id: number) => { messages.value = messages.value.filter((item) => item.id !== id) }
  return { messages, push, dismiss }
}
