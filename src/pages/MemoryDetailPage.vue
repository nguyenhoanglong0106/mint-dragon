<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ChevronLeft, ExternalLink, Heart, MapPin, Mic, Video } from '@lucide/vue'
import { useRoute } from 'vue-router'
import type { Memory } from '../types'
import { memoryService } from '../services/memory.service'
import { formatDate } from '../utils/date'
const route = useRoute(); const memory = ref<Memory | null>(null); const loading = ref(true)
onMounted(async () => { memory.value = await memoryService.get(String(route.params.id)); loading.value = false })
</script>
<template>
  <section class="page-stack">
    <header class="detail-topbar">
      <RouterLink to="/memories" class="icon-link" aria-label="Quay lại Góc thương nhớ"><ChevronLeft :size="20" /></RouterLink>
    </header>

    <p v-if="loading" class="soft-card">Đang tải kỷ niệm...</p>
    <article v-else-if="memory" class="soft-card detail-card">
      <div v-if="memory.cover_image_url" class="detail-cover"><img :src="memory.cover_image_url" alt="Ảnh kỷ niệm" /></div>
      <div v-else class="detail-cover detail-cover-empty"><Heart :size="40" /></div>

      <div class="detail-body">
        <span>{{ formatDate(memory.memory_date) }}</span>
        <h1>{{ memory.title }}</h1>
        <p class="detail-content">{{ memory.content }}</p>

        <div v-if="memory.location_name || memory.is_favorite" class="detail-meta">
          <span v-if="memory.location_name" class="detail-chip"><MapPin :size="14" /> {{ memory.location_name }}</span>
          <span v-if="memory.is_favorite" class="detail-chip"><Heart :size="14" fill="currentColor" /> Kỷ niệm yêu thích</span>
        </div>

        <small v-if="memory.latitude && memory.longitude" class="detail-coords">Tọa độ: {{ memory.latitude }}, {{ memory.longitude }}</small>

        <section v-if="memory.audio_note_url || memory.video_note_url" class="detail-media-note">
          <h2>Một mẩu âm thanh / video</h2>
          <div v-if="memory.audio_note_url" class="detail-media-player">
            <span><Mic :size="15" /> Voice note</span>
            <audio :src="memory.audio_note_url" controls />
          </div>
          <div v-if="memory.video_note_url" class="detail-media-player">
            <span><Video :size="15" /> Video note</span>
            <video :src="memory.video_note_url" controls playsinline />
          </div>
        </section>

        <a v-if="memory.google_photos_url" :href="memory.google_photos_url" target="_blank" rel="noreferrer" class="ghost-btn detail-photos-link"><ExternalLink :size="16" /> Mở Google Photos</a>
      </div>
    </article>
  </section>
</template>
