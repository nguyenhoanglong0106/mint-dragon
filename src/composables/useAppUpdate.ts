import { useRegisterSW } from 'virtual:pwa-register/vue'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

export function useAppUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      window.setInterval(() => void registration.update(), CHECK_INTERVAL_MS)
    }
  })
  const updateNow = () => updateServiceWorker(true)
  return { needRefresh, updateNow }
}
