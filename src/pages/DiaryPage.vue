<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Cloud, Frown, Heart, Pencil, Search, Send, Smile, Sparkles, Trash2 } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useDiariesStore } from '../stores/diaries'
import { useToast } from '../composables/useToast'
import { todayIso, formatDate } from '../utils/date'
import type { Diary, Mood } from '../types'

const moodOptions = [
  { value: 'love' as Mood, label: 'Đang yêu', line: 'Muốn được dỗ dành và ôm thật lâu', icon: Heart },
  { value: 'happy' as Mood, label: 'Vui xinh', line: 'Hôm nay lòng mình nhẹ và sáng', icon: Smile },
  { value: 'excited' as Mood, label: 'Háo hức', line: 'Có chuyện làm tim mình nhảy nhót', icon: Sparkles },
  { value: 'normal' as Mood, label: 'Bình yên', line: 'Một ngày dịu, không ồn ào', icon: Cloud },
  { value: 'sad' as Mood, label: 'Cần được thương', line: 'Hôm nay mình hơi chùng xuống', icon: Frown }
]
const defaultMood = moodOptions[0]
const auth = useAuthStore()
const couple = useCoupleStore()
const store = useDiariesStore()
const toast = useToast()
const search = ref('')
const editingId = ref<string | null>(null)
const form = reactive({ diary_date: todayIso(), title: '', content: '', mood: 'love' as Mood, weather: '', google_photos_url: '' })
const today = todayIso()

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return store.items
  return store.items.filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(keyword))
})
const byDate = computed(() => [...filteredItems.value].sort((a, b) => b.diary_date.localeCompare(a.diary_date)))
const myTodayDiary = computed(() => store.items.find((item) => item.created_by === auth.user?.id && item.diary_date === today) ?? null)
const todayStories = computed(() => couple.profiles.map((profile) => {
  const diary = store.items.find((item) => item.created_by === profile.id && item.diary_date === today) ?? null
  const mood = moodMeta(diary?.mood)
  return { profile, diary, mood }
}))

function moodMeta(value?: Mood | null) {
  return moodOptions.find((mood) => mood.value === value) ?? defaultMood
}

function reset() {
  editingId.value = null
  Object.assign(form, { diary_date: todayIso(), title: '', content: '', mood: 'love', weather: '', google_photos_url: '' })
}

function edit(item: Diary) {
  editingId.value = item.id
  Object.assign(form, { ...item, mood: item.mood || 'love', weather: item.weather || '', google_photos_url: item.google_photos_url || '' })
}

function editToday() {
  if (myTodayDiary.value) edit(myTodayDiary.value)
}

async function reload() {
  if (couple.couple?.id) await store.load(couple.couple.id)
}

async function submit() {
  if (!couple.couple?.id || !auth.user) return
  const mood = moodMeta(form.mood)
  const input = {
    couple_id: couple.couple.id,
    created_by: auth.user.id,
    diary_date: form.diary_date,
    title: form.title.trim() || `${mood.label} hôm nay`,
    content: form.content,
    mood: form.mood,
    weather: form.weather || null,
    google_photos_url: form.google_photos_url || null
  }
  const existingTodayId = form.diary_date === today ? myTodayDiary.value?.id : null
  const targetId = editingId.value ?? existingTodayId
  if (targetId) await store.update(targetId, input)
  else await store.create(input)
  toast.push('Đã đăng status hôm nay cho người ấy thấy', 'success')
  reset()
  await reload()
}

async function remove(id: string) {
  await store.remove(id)
  toast.push('Đã xóa nhật ký', 'success')
}

onMounted(async () => {
  if (!couple.couple) await couple.load()
  await reload()
})
</script>

<template>
  <section class="diary-page">
    <header class="page-header diary-hero">
      <div><span>Story hôm nay</span><h1>Hôm nay tim mình thế nào?</h1><p>Một status nhỏ để người ấy biết mình đang vui, buồn hay cần được thương.</p></div>
    </header>

    <section class="status-stories" aria-label="Cảm xúc hôm nay của hai người">
      <article v-for="story in todayStories" :key="story.profile.id" :class="['status-story', `mood-${story.mood.value}`, { empty: !story.diary }]">
        <div class="story-avatar"><img :src="story.profile.avatar_url || '/favicon.svg'" :alt="story.profile.display_name" /><component :is="story.mood.icon" :size="18" /></div>
        <div>
          <strong>{{ story.profile.nickname || story.profile.display_name }}</strong>
          <span>{{ story.diary ? story.mood.label : 'Chưa đăng hôm nay' }}</span>
          <p>{{ story.diary?.content || 'Một khoảng lặng cũng là một trạng thái. Khi sẵn sàng, mình viết vài dòng nhé.' }}</p>
          <button v-if="story.profile.id === auth.user?.id && story.diary" type="button" @click="editToday">Cập nhật status</button>
        </div>
      </article>
    </section>

    <form class="status-composer" @submit.prevent="submit">
      <div class="composer-header">
        <div><span>{{ editingId ? 'Đang sửa một dòng cũ' : 'Status của mình' }}</span><h2>{{ myTodayDiary && !editingId ? 'Cập nhật cảm xúc hôm nay' : 'Đăng cảm xúc hôm nay' }}</h2></div>
        <button v-if="editingId" type="button" class="ghost-btn" @click="reset">Viết mới</button>
      </div>

      <section class="mood-grid" aria-label="Chọn tâm trạng hôm nay">
        <button v-for="mood in moodOptions" :key="mood.value" :class="['mood-choice', `mood-${mood.value}`, { selected: form.mood === mood.value }]" type="button" @click="form.mood = mood.value">
          <component :is="mood.icon" :size="20" />
          <span>{{ mood.label }}</span>
        </button>
      </section>

      <label>Điều muốn người ấy thấy hôm nay<textarea v-model="form.content" rows="4" required placeholder="Hôm nay mình cảm thấy..." /></label>
      <div class="form-row"><label>Tên status<input v-model="form.title" placeholder="Có thể để trống" /></label><label>Ngày<input v-model="form.diary_date" type="date" required /></label></div>
      <div class="form-row"><label>Thời tiết trong lòng<input v-model="form.weather" placeholder="Nắng nhẹ, mưa lòng..." /></label><label>Link album Google Photos<input v-model="form.google_photos_url" type="url" /></label></div>
      <button class="primary-btn status-save-btn" type="submit"><Send :size="18" /> {{ editingId || myTodayDiary ? 'Cập nhật status' : 'Đăng status' }}</button>
    </form>

    <section class="diary-feed-head">
      <div><span>Những ngày đã qua</span><h2>Lịch sử lời thương</h2></div>
      <label><Search :size="17" /><input v-model="search" placeholder="Tìm một dòng cũ" /></label>
    </section>

    <p v-if="store.loading" class="soft-card">Đang mở nhật ký...</p><p v-else-if="!store.items.length" class="soft-card empty">Chưa có status nào.</p>
    <section v-else class="diary-feed">
      <article v-for="item in byDate" :key="item.id" :class="['story-feed-card', `mood-${moodMeta(item.mood).value}`]">
        <div class="feed-mood"><component :is="moodMeta(item.mood).icon" :size="20" /></div>
        <div>
          <span>{{ formatDate(item.diary_date) }} · {{ moodMeta(item.mood).label }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.content }}</p>
        </div>
        <div class="actions"><button aria-label="Sửa nhật ký" @click="edit(item)"><Pencil :size="17" /></button><button aria-label="Xóa nhật ký" @click="remove(item.id)"><Trash2 :size="17" /></button></div>
      </article>
    </section>
  </section>
</template>