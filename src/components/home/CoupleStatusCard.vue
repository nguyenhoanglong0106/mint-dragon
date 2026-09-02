<script setup lang="ts">
import { AudioLines, Heart } from '@lucide/vue'
import { useYoutubePlayer } from '../../composables/useYoutubePlayer'

interface StatusPerson {
  name: string
  avatarUrl: string | null
  moodLabel: string
  statusText: string
  online?: boolean
  musicVideoId?: string | null
  musicTitle?: string | null
}

defineProps<{ personA: StatusPerson; personB: StatusPerson }>()

const { toggle, isPlaying, currentVideoId } = useYoutubePlayer()

function onToggleMusic(videoId: string | null | undefined) {
  if (videoId) void toggle(videoId)
}
</script>

<template>
  <RouterLink to="/diary" class="soft-card couple-status-card">
    <h2 class="connect-title"><strong>Trạm Cảm Xúc</strong></h2>
    <div class="couple-status-row">
      <div class="couple-status-side">
        <strong class="couple-status-name">{{ personA.name }}</strong>
        <span class="couple-status-mood">Đang cảm thấy {{ personA.moodLabel }}</span>
        <div class="couple-status-avatar-wrap">
          <img class="couple-status-avatar" :src="personA.avatarUrl || '/favicon.svg'" :alt="personA.name" />
          <button
            v-if="personA.musicVideoId"
            type="button"
            class="couple-status-music"
            :class="{ playing: currentVideoId === personA.musicVideoId && isPlaying }"
            :aria-label="personA.musicTitle || 'Phát nhạc'"
            :title="personA.musicTitle || undefined"
            @click.stop.prevent="onToggleMusic(personA.musicVideoId)"
          ><AudioLines :size="13" /></button>
        </div>
        <p class="couple-status-text">{{ personA.statusText }}</p>
        <span v-if="personA.online" class="couple-status-online"><i aria-hidden="true" /> Online</span>
      </div>

      <Heart class="couple-status-heart" :size="20" fill="currentColor" />

      <div class="couple-status-side">
        <strong class="couple-status-name">{{ personB.name }}</strong>
        <span class="couple-status-mood">Đang cảm thấy {{ personB.moodLabel }}</span>
        <div class="couple-status-avatar-wrap">
          <img class="couple-status-avatar" :src="personB.avatarUrl || '/favicon.svg'" :alt="personB.name" />
          <button
            v-if="personB.musicVideoId"
            type="button"
            class="couple-status-music"
            :class="{ playing: currentVideoId === personB.musicVideoId && isPlaying }"
            :aria-label="personB.musicTitle || 'Phát nhạc'"
            :title="personB.musicTitle || undefined"
            @click.stop.prevent="onToggleMusic(personB.musicVideoId)"
          ><AudioLines :size="13" /></button>
        </div>
        <p class="couple-status-text">{{ personB.statusText }}</p>
        <span v-if="personB.online" class="couple-status-online"><i aria-hidden="true" /> Online</span>
      </div>
    </div>
  </RouterLink>
</template>
