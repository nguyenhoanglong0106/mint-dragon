<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Heart, LocateFixed, RefreshCw, UsersRound } from '@lucide/vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import CoupleMap from '../components/map/CoupleMap.vue'
import MemoryMap from '../components/map/MemoryMap.vue'
import LocationStatusCard from '../components/map/LocationStatusCard.vue'
import DistanceBadge from '../components/map/DistanceBadge.vue'
import LocationPermissionBanner from '../components/map/LocationPermissionBanner.vue'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useLocationStore } from '../stores/location'
import { useMemoriesStore } from '../stores/memories'
import { useGeolocation } from '../composables/useGeolocation'
import { useToast } from '../composables/useToast'
import { supabase } from '../services/supabase'
import { formatDistance } from '../utils/distance'
import type { LiveLocation } from '../types'
import type CoupleMapVue from '../components/map/CoupleMap.vue'

const auth = useAuthStore(); const couple = useCoupleStore(); const locations = useLocationStore(); const toast = useToast(); const mapRef = ref<InstanceType<typeof CoupleMapVue> | null>(null)
const memories = useMemoriesStore()
const activeMap = ref<'live' | 'memories'>('live')
const memoryMapRef = ref<InstanceType<typeof MemoryMap> | null>(null)
let realtimeChannel: RealtimeChannel | null = null
const myLocation = computed(() => locations.locations.find((item) => item.user_id === auth.user?.id) ?? null)
const otherLocation = computed(() => locations.locations.find((item) => item.user_id !== auth.user?.id) ?? null)
const visibleLocations = computed<LiveLocation[]>(() => [myLocation.value, otherLocation.value].filter((item): item is LiveLocation => Boolean(item)))
const distanceLabel = computed(() => formatDistance(locations.distanceMeters))
const pinnedMemories = computed(() => memories.items.filter((item) => item.latitude != null && item.longitude != null))
const geo = useGeolocation(async (payload) => { if (auth.user && couple.couple?.id && locations.sharing) await locations.upsert(auth.user.id, couple.couple.id, payload) })
async function toggleSharing() {
  if (!auth.user) return
  try {
    if (locations.sharing) { geo.stop(); await locations.stop(auth.user.id) }
    else { locations.setSharing(true); geo.start() }
  } catch {
    toast.push('Không cập nhật được trạng thái chia sẻ vị trí.', 'error')
  }
}
async function refresh() {
  if (!couple.couple?.id) return
  await locations.load(couple.couple.id)
  if (locations.error) toast.push(locations.error, 'error')
}
function fitBoth() { mapRef.value?.fitBoth() }
function fitMemoryMap() { memoryMapRef.value?.fitAll() }
onMounted(async () => {
  if (!couple.couple) await couple.load()
  if (couple.couple?.id) {
    await Promise.all([locations.load(couple.couple.id), memories.load(couple.couple.id)])
    realtimeChannel = locations.subscribe(couple.couple.id)
    if (locations.sharing) geo.start()
  }
})
onBeforeUnmount(() => { if (realtimeChannel) void supabase.removeChannel(realtimeChannel) })
</script>
<template>
  <section class="map-page"><header class="map-header"><div><span>{{ activeMap === 'live' ? 'Khoảng cách yêu thương' : 'Bản đồ kỷ niệm' }}</span><h1>{{ activeMap === 'live' ? 'Mình đang gần nhau đến đâu?' : 'Ở đây mình từng...' }}</h1></div><DistanceBadge :label="activeMap === 'live' ? distanceLabel : `${pinnedMemories.length} điểm thương`" /></header><p v-if="couple.error || locations.error || memories.error" class="config-warning">{{ couple.error || locations.error || memories.error }}</p><div class="map-tabs"><button :class="{ selected: activeMap === 'live' }" type="button" @click="activeMap = 'live'"><UsersRound :size="17" /> Realtime</button><button :class="{ selected: activeMap === 'memories' }" type="button" @click="activeMap = 'memories'"><Heart :size="17" /> Kỷ niệm</button></div><template v-if="activeMap === 'live'"><LocationPermissionBanner :status="geo.permission.value" :error="geo.lastError.value" /><CoupleMap ref="mapRef" :locations="locations.locations" :profiles="couple.profiles" /><div class="map-controls"><button aria-label="Vị trí của tôi" @click="myLocation && fitBoth()"><LocateFixed :size="18" /> Tôi</button><button @click="fitBoth"><UsersRound :size="18" /> Xem cả hai</button><button aria-label="Làm mới vị trí" @click="refresh"><RefreshCw :size="18" /></button><button class="share-toggle" @click="toggleSharing">{{ locations.sharing ? 'Tắt chia sẻ' : 'Bật chia sẻ' }}</button></div><LocationStatusCard :locations="visibleLocations" :profiles="couple.profiles" :distance-meters="locations.distanceMeters" /></template><template v-else><p v-if="!pinnedMemories.length" class="soft-card empty">Chưa có kỷ niệm nào được gắn tọa độ.</p><MemoryMap v-else ref="memoryMapRef" :memories="pinnedMemories" /><div v-if="pinnedMemories.length" class="map-controls"><button type="button" @click="fitMemoryMap"><Heart :size="18" /> Xem tất cả kỷ niệm</button><RouterLink to="/memories?add=1" class="share-toggle"><Heart :size="18" /> Thêm điểm mới</RouterLink></div></template></section>
</template>
