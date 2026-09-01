import { useOnline } from '@vueuse/core'

export const useOnlineStatus = () => ({ isOnline: useOnline() })
