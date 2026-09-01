import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LiveLocation, LocationPayload } from '../types'
import { locationService } from '../services/location.service'
import { haversineMeters } from '../utils/distance'

export const useLocationStore = defineStore('location', () => {
  const locations = ref<LiveLocation[]>([])
  const sharing = ref(localStorage.getItem('share-location') === 'true')
  const loading = ref(false)
  const error = ref('')
  const realtimeStatus = ref('Chưa kết nối realtime')
  const distanceMeters = computed(() => locations.value.length >= 2 ? haversineMeters(locations.value[0], locations.value[1]) : null)

  async function load(coupleId: string) {
    loading.value = true; error.value = ''
    try { locations.value = await locationService.list(coupleId) }
    catch { error.value = 'Không tải được vị trí.' }
    finally { loading.value = false }
  }
  async function upsert(userId: string, coupleId: string, payload: LocationPayload) {
    const item = await locationService.upsert(userId, coupleId, payload)
    locations.value = [item, ...locations.value.filter((location) => location.user_id !== item.user_id)]
  }
  async function stop(userId: string) { await locationService.remove(userId); locations.value = locations.value.filter((item) => item.user_id !== userId); sharing.value = false; localStorage.setItem('share-location', 'false') }
  function setSharing(value: boolean) { sharing.value = value; localStorage.setItem('share-location', String(value)) }
  function subscribe(coupleId: string) {
    const channel = locationService.subscribe(coupleId, (item) => { locations.value = [item, ...locations.value.filter((location) => location.user_id !== item.user_id)] }, (userId) => { locations.value = locations.value.filter((item) => item.user_id !== userId) })
    realtimeStatus.value = 'Đang lắng nghe realtime'
    return channel
  }
  return { locations, sharing, loading, error, realtimeStatus, distanceMeters, load, upsert, stop, setSharing, subscribe }
})
