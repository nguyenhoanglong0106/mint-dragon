<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import UpcomingDateCard from '../components/home/UpcomingDateCard.vue'
import FavoriteMemoryCard from '../components/home/FavoriteMemoryCard.vue'
import CurrentDistanceCard from '../components/home/CurrentDistanceCard.vue'
import QuickActions from '../components/home/QuickActions.vue'
import { useCoupleStore } from '../stores/couple'
import { useMemoriesStore } from '../stores/memories'
import { useDiariesStore } from '../stores/diaries'
import { useSpecialDatesStore } from '../stores/specialDates'
import { useLocationStore } from '../stores/location'
import { countdownLabel, formatDate, greeting } from '../utils/date'

const couple = useCoupleStore()
const memories = useMemoriesStore()
const diaries = useDiariesStore()
const dates = useSpecialDatesStore()
const locations = useLocationStore()
const names = computed(() => couple.profiles.map((profile) => profile.nickname || profile.display_name).join(' & ') || 'Hai chúng ta')
const favorite = computed(() => memories.items.find((item) => item.is_favorite) ?? memories.items[0] ?? null)
const upcoming = computed(() => dates.items.map((item) => ({ item, label: countdownLabel(item.event_date, item.repeat_yearly) }))[0])
const latestDiary = computed(() => diaries.items[0])
const latestMemory = computed(() => memories.items[0])

onMounted(async () => {
  if (!couple.couple) await couple.load()
  if (couple.couple?.id) {
    await Promise.all([memories.load(couple.couple.id), diaries.load(couple.couple.id), dates.load(couple.couple.id), locations.load(couple.couple.id)])
  }
})
</script>
<template>
  <section class="page-stack">
    <header class="home-hero">
      <div class="avatar-pair"><img v-for="profile in couple.profiles" :key="profile.id" :src="profile.avatar_url || '/favicon.svg'" :alt="profile.display_name" /></div>
      <p>{{ greeting() }}</p><h1>{{ names }}</h1>
    </header>
    <p v-if="couple.error" class="config-warning">{{ couple.error }}</p>
    <QuickActions />
    <div class="grid-two">
      <UpcomingDateCard v-if="upcoming" :title="upcoming.item.title" :countdown="upcoming.label" />
      <CurrentDistanceCard :meters="locations.distanceMeters" />
    </div>
    <FavoriteMemoryCard :memory="favorite" />
    <RouterLink to="/memories" class="soft-card home-link-card"><span>Mảnh ký ức mới nhất</span><strong>{{ latestMemory?.title || 'Chưa có mảnh ký ức nào' }}</strong><p>{{ latestMemory ? formatDate(latestMemory.memory_date) : 'Mình ghi lại khoảnh khắc đầu tiên nhé.' }}</p><ArrowRight :size="18" /></RouterLink>
    <section class="soft-card"><span>Lời thương gần nhất</span><strong>{{ latestDiary?.title || 'Chưa có lời nhắn nào' }}</strong><p>{{ latestDiary ? formatDate(latestDiary.diary_date) : 'Một dòng dịu dàng cũng đủ làm hôm nay ấm hơn.' }}</p></section>
  </section>
</template>
