<script setup lang="ts">
import { Heart } from '@lucide/vue'

interface StatusPerson {
  name: string
  avatarUrl: string | null
  moodLabel: string
  statusText: string
  online?: boolean
}

defineProps<{ personA: StatusPerson; personB: StatusPerson }>()
</script>

<template>
  <RouterLink to="/diary" class="soft-card couple-status-card">
    <h2 class="connect-title"><strong>Trạm Cảm Xúc</strong></h2>
    <div class="couple-status-row">
      <div class="couple-status-side">
        <strong class="couple-status-name">{{ personA.name }}</strong>
        <span class="couple-status-mood">Đang cảm thấy {{ personA.moodLabel }}</span>
        <img class="couple-status-avatar" :src="personA.avatarUrl || '/favicon.svg'" :alt="personA.name" />
        <p class="couple-status-text">{{ personA.statusText }}</p>
        <span v-if="personA.online" class="couple-status-online"><i aria-hidden="true" /> Online</span>
      </div>

      <Heart class="couple-status-heart" :size="20" fill="currentColor" />

      <div class="couple-status-side">
        <strong class="couple-status-name">{{ personB.name }}</strong>
        <span class="couple-status-mood">Đang cảm thấy {{ personB.moodLabel }}</span>
        <img class="couple-status-avatar" :src="personB.avatarUrl || '/favicon.svg'" :alt="personB.name" />
        <p class="couple-status-text">{{ personB.statusText }}</p>
        <span v-if="personB.online" class="couple-status-online"><i aria-hidden="true" /> Online</span>
      </div>
    </div>
  </RouterLink>
</template>
