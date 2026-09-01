<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import LoveCounter from '../components/home/LoveCounter.vue'
import CoupleStatusCard from '../components/home/CoupleStatusCard.vue'
import DistanceLoveCard from '../components/home/DistanceLoveCard.vue'
import { useCoupleStore } from '../stores/couple'
import { useMemoriesStore } from '../stores/memories'
import { useDiariesStore } from '../stores/diaries'
import { useLocationStore } from '../stores/location'
import { daysBetween, formatDate, greeting } from '../utils/date'
import { moodMeta } from '../utils/mood'

const ONLINE_WINDOW_MS = 5 * 60 * 1000

const couple = useCoupleStore()
const memories = useMemoriesStore()
const diaries = useDiariesStore()
const locations = useLocationStore()

// Rồng luôn hiện bên trái, Bé Mint luôn hiện bên phải - xác định bằng
// username (dragon/mint) thay vì thứ tự hàng trong DB, để thứ tự luôn
// đúng bất kể ai được tạo trước. Nếu vì lý do gì đó chưa gán username
// (chưa chạy migration 0002), fallback về thứ tự gốc để không vỡ trang.
const orderedProfiles = computed(() => {
  const rong = couple.profiles.find((profile) => profile.username === 'dragon')
  const mint = couple.profiles.find((profile) => profile.username === 'mint')
  return rong && mint ? [rong, mint] : couple.profiles
})

const names = computed(() => orderedProfiles.value.map((profile) => profile.nickname || profile.display_name).join(' & ') || 'Hai chúng ta')
const daysTogether = computed(() => daysBetween(couple.couple?.started_date))
const latestMemory = computed(() => memories.items[0])

function isOnline(profileId: string) {
  const location = locations.locations.find((item) => item.user_id === profileId)
  return location ? Date.now() - new Date(location.updated_at).getTime() < ONLINE_WINDOW_MS : false
}

function latestDiaryOf(profileId: string) {
  return diaries.items.find((item) => item.created_by === profileId) ?? null
}

const statusPeople = computed(() => {
  if (orderedProfiles.value.length !== 2) return null
  const [a, b] = orderedProfiles.value
  const nameA = a.nickname || a.display_name
  const nameB = b.nickname || b.display_name
  const diaryA = latestDiaryOf(a.id)
  const diaryB = latestDiaryOf(b.id)
  return {
    personA: { name: nameA, avatarUrl: a.avatar_url, moodLabel: moodMeta(diaryA?.mood).label, statusText: diaryA?.content || `Đang nhớ ${nameB}`, online: isOnline(a.id) },
    personB: { name: nameB, avatarUrl: b.avatar_url, moodLabel: moodMeta(diaryB?.mood).label, statusText: diaryB?.content || `Đang nhớ ${nameA}`, online: isOnline(b.id) }
  }
})

const distanceKm = computed(() => {
  const meters = locations.distanceMeters
  return meters == null ? null : Math.round(meters / 1000)
})

onMounted(async () => {
  if (!couple.couple) await couple.load()
  if (couple.couple?.id) {
    await Promise.all([memories.load(couple.couple.id), diaries.load(couple.couple.id), locations.load(couple.couple.id)])
  }
})
</script>
<template>
  <section class="page-stack">
    <header class="home-hero">
      <div class="avatar-pair"><img v-for="profile in orderedProfiles" :key="profile.id" :src="profile.avatar_url || '/favicon.svg'" :alt="profile.display_name" /></div>
      <p class="home-tagline">{{ greeting() }}</p>
      <h1>{{ names }}</h1>
    </header>

    <p v-if="couple.error" class="config-warning">{{ couple.error }}</p>

    <LoveCounter v-if="couple.couple" class="soft-card" :days="daysTogether" />

    <CoupleStatusCard v-if="statusPeople" :person-a="statusPeople.personA" :person-b="statusPeople.personB" />

    <DistanceLoveCard :distance-km="distanceKm" />

    <RouterLink to="/memories" class="soft-card home-link-card"><span>Ngày kỉ niệm</span><strong>{{ latestMemory?.title || 'Chưa có mảnh ký ức nào' }}</strong><p>{{ latestMemory ? formatDate(latestMemory.memory_date) : 'Mình ghi lại khoảnh khắc đầu tiên nhé.' }}</p><ArrowRight :size="18" /></RouterLink>
  </section>
</template>
