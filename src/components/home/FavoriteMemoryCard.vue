<script setup lang="ts">
import { Star } from '@lucide/vue'
import type { Memory } from '../../types'
import { formatDate } from '../../utils/date'
defineProps<{ memory?: Memory | null }>()
</script>
<template>
  <RouterLink v-if="memory" :to="`/memories/${memory.id}`" class="soft-card favorite-memory">
    <img v-if="memory.cover_image_url" :src="memory.cover_image_url" alt="Ảnh kỷ niệm" />
    <div><Star :size="18" /><span>Mảnh nhớ thương nhất</span><strong>{{ memory.title }}</strong><p>{{ formatDate(memory.memory_date) }}</p></div>
  </RouterLink>
  <article v-else class="soft-card empty">Chưa có mảnh nhớ thương nhất nào.</article>
</template>
