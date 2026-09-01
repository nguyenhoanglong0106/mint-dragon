<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Send } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useDiariesStore } from '../stores/diaries'
import { useToast } from '../composables/useToast'
import { todayIso } from '../utils/date'
import { moodMeta, moodOptions } from '../utils/mood'
import type { Mood } from '../types'

const auth = useAuthStore()
const couple = useCoupleStore()
const store = useDiariesStore()
const toast = useToast()
const isSubmitting = ref(false)
const form = reactive({ content: '', mood: 'love' as Mood })

function reset() {
  Object.assign(form, { content: '', mood: 'love' })
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
      google_photos_url: null
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
  <section class="diary-page">
    <header class="page-header diary-hero">
      <div><span>Story hôm nay</span><h1>Hôm nay tim mình thế nào?</h1><p>Một status nhỏ để người ấy biết mình đang vui, buồn hay cần được thương.</p></div>
    </header>

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
      <button :disabled="isSubmitting" class="primary-btn status-save-btn" type="submit"><Send :size="18" /> {{ isSubmitting ? 'Đang đăng...' : 'Đăng status' }}</button>
    </form>
  </section>
</template>
