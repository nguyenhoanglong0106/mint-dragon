<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ExternalLink, Heart, MapPin } from '@lucide/vue'
import { useRoute } from 'vue-router'
import type { Memory } from '../types'
import { memoryService } from '../services/memory.service'
import { formatDate } from '../utils/date'
const route = useRoute(); const memory = ref<Memory | null>(null); const loading = ref(true)
onMounted(async () => { memory.value = await memoryService.get(String(route.params.id)); loading.value = false })
</script>
<template>
  <section class="page-stack">
    <p v-if="loading" class="soft-card">Đang tải kỷ niệm...</p>
    <article v-else-if="memory" class="detail-card">
      <img v-if="memory.cover_image_url" :src="memory.cover_image_url" alt="Ảnh kỷ niệm" />
      <span>{{ formatDate(memory.memory_date) }}</span><h1>{{ memory.title }}</h1><p>{{ memory.content }}</p>
      <p v-if="memory.location_name"><MapPin :size="17" /> {{ memory.location_name }}</p>
      <p v-if="memory.latitude && memory.longitude">Tọa độ: {{ memory.latitude }}, {{ memory.longitude }}</p>
      <a v-if="memory.google_photos_url" :href="memory.google_photos_url" target="_blank" rel="noreferrer"><ExternalLink :size="17" /> Mở Google Photos</a>
      <strong v-if="memory.is_favorite"><Heart :size="18" fill="currentColor" /> Kỷ niệm yêu thích</strong>
    </article>
  </section>
</template>
