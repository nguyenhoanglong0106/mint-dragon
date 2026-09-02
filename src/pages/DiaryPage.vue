<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Music, Send } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useDiariesStore } from '../stores/diaries'
import { useToast } from '../composables/useToast'
import { hasYoutubeConfig } from '../services/supabase'
import { youtubeService, type YoutubeSearchResult } from '../services/youtube.service'
import { todayIso } from '../utils/date'
import { moodMeta, moodOptions } from '../utils/mood'
import type { Mood } from '../types'

const auth = useAuthStore()
const couple = useCoupleStore()
const store = useDiariesStore()
const toast = useToast()
const isSubmitting = ref(false)
const form = reactive({ content: '', mood: 'love' as Mood, music_video_id: '', music_title: '' })

const musicQuery = ref('')
const musicResults = ref<YoutubeSearchResult[]>([])
const musicSearching = ref(false)
const musicError = ref('')

function reset() {
  Object.assign(form, { content: '', mood: 'love', music_video_id: '', music_title: '' })
  musicQuery.value = ''
  musicResults.value = []
  musicError.value = ''
}

async function searchMusic() {
  const query = musicQuery.value.trim()
  if (!query || musicSearching.value) return
  musicSearching.value = true
  musicError.value = ''
  try {
    musicResults.value = await youtubeService.search(query)
    if (!musicResults.value.length) musicError.value = 'Không tìm thấy bài nào, thử từ khóa khác nhé.'
  } catch (error) {
    musicError.value = error instanceof Error ? error.message : 'Lỗi khi tìm nhạc'
  } finally {
    musicSearching.value = false
  }
}

function pickMusic(result: YoutubeSearchResult) {
  form.music_video_id = result.videoId
  form.music_title = result.title
  musicResults.value = []
  musicQuery.value = ''
}

function clearMusic() {
  form.music_video_id = ''
  form.music_title = ''
}

async function reload() {
  if (couple.couple?.id) await store.load(couple.couple.id)
}

async function submit() {
  if (!couple.couple?.id || !auth.user || isSubmitting.value) {
    if (!couple.couple?.id || !auth.user) toast.push('Chưa có couple_id nên chưa thể gửi lên Supabase.', 'error')
    return
  }
  isSubmitting.value = true
  try {
    await toast.requestPermission()
    const mood = moodMeta(form.mood)
    const input = {
      couple_id: couple.couple.id,
      created_by: auth.user.id,
      diary_date: todayIso(),
      title: `${mood.label} hôm nay`,
      content: form.content,
      mood: form.mood,
      weather: null,
      google_photos_url: null,
      music_video_id: form.music_video_id || null,
      music_title: form.music_title || null
    }
    await store.create(input)
    toast.push('Đã đăng status cho người ấy thấy', 'success')
    reset()
    await reload()
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi đăng status'
    toast.push(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!couple.couple) await couple.load()
  await reload()
})
</script>

<template>
  <section class="diary-page pane-page">
    <header class="page-header diary-hero">
      <div><span>Story hôm nay</span><h1>Hôm nay tim mình thế nào?</h1><p>Một status nhỏ để người ấy biết mình đang vui, buồn hay cần được thương.</p></div>
    </header>

    <div class="pane-scroll diary-scroll">
      <form class="status-composer" @submit.prevent="submit">
        <div class="composer-header">
          <div><span>Status của mình</span><h2>Đăng cảm xúc bây giờ</h2></div>
        </div>

        <section class="mood-grid" aria-label="Chọn tâm trạng hôm nay">
          <button v-for="mood in moodOptions" :key="mood.value" :class="['mood-choice', `mood-${mood.value}`, { selected: form.mood === mood.value }]" :disabled="isSubmitting" type="button" @click="form.mood = mood.value">
            <component :is="mood.icon" :size="20" />
            <span>{{ mood.label }}</span>
          </button>
        </section>

        <label>Điều muốn người ấy thấy bây giờ<textarea v-model="form.content" :disabled="isSubmitting" rows="4" required placeholder="Hôm nay mình cảm thấy..." /></label>

        <div class="music-picker">
          <span class="music-picker-label"><Music :size="16" /> Thêm nhạc cho status</span>

          <p v-if="!hasYoutubeConfig" class="music-picker-note">Chưa cấu hình tìm nhạc (thiếu VITE_YOUTUBE_API_KEY).</p>

          <div v-else-if="form.music_video_id" class="music-picked">
            <img :src="`https://i.ytimg.com/vi/${form.music_video_id}/default.jpg`" alt="" />
            <span>{{ form.music_title }}</span>
            <button type="button" class="ghost-btn" @click="clearMusic">Đổi bài khác</button>
          </div>

          <div v-else class="music-search">
            <div class="music-search-row">
              <input v-model="musicQuery" placeholder="Tìm tên bài hát..." :disabled="musicSearching" @keydown.enter.prevent="searchMusic" />
              <button type="button" class="ghost-btn" :disabled="musicSearching || !musicQuery.trim()" @click="searchMusic">{{ musicSearching ? 'Đang tìm...' : 'Tìm' }}</button>
            </div>
            <p v-if="musicError" class="music-search-error">{{ musicError }}</p>
            <ul v-if="musicResults.length" class="music-results">
              <li v-for="result in musicResults" :key="result.videoId">
                <button type="button" @click="pickMusic(result)">
                  <img :src="result.thumbnailUrl" alt="" />
                  <span><strong>{{ result.title }}</strong><small>{{ result.channelTitle }}</small></span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <button :disabled="isSubmitting" class="primary-btn status-save-btn" type="submit"><Send :size="18" /> {{ isSubmitting ? 'Đang đăng...' : 'Đăng status' }}</button>
      </form>
    </div>
  </section>
</template>
