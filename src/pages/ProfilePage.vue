<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Camera, Heart, Settings, X } from '@lucide/vue'
import { useCoupleStore } from '../stores/couple'
import { useToast } from '../composables/useToast'
import { elapsedBreakdown, formatDate } from '../utils/date'
import { imageFileToDataUrl } from '../utils/image'

const couple = useCoupleStore()
const toast = useToast()
const form = reactive({ display_name: '', nickname: '', avatar_url: '', birthday: '' })

// tick chỉ để ép breakdown tính lại mỗi giây - bản thân elapsedBreakdown()
// luôn tự lấy giờ hiện tại, không cần truyền "now" vào đây.
const tick = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
const breakdown = computed(() => { void tick.value; return couple.couple ? elapsedBreakdown(couple.couple.started_date) : null })
const pad = (value: number) => String(value).padStart(2, '0')

onMounted(async () => {
  if (!couple.couple) await couple.load()
  Object.assign(form, {
    display_name: couple.myProfile?.display_name || '',
    nickname: couple.myProfile?.nickname || '',
    avatar_url: couple.myProfile?.avatar_url || '',
    birthday: couple.myProfile?.birthday || ''
  })
  timer = setInterval(() => { tick.value++ }, 1000)
})

onBeforeUnmount(() => { if (timer) clearInterval(timer) })

async function selectAvatar(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    form.avatar_url = await imageFileToDataUrl(file, 640, 0.82)
  } catch {
    toast.push('Mình chưa đọc được ảnh này, thử chọn ảnh khác nhé.', 'error')
  } finally {
    input.value = ''
  }
}

function removeAvatar() {
  form.avatar_url = ''
}

async function save() {
  if (!couple.myProfile) return
  await couple.saveProfile({
    id: couple.myProfile.id,
    display_name: form.display_name,
    nickname: form.nickname || null,
    avatar_url: form.avatar_url || null,
    birthday: form.birthday || null
  })
  toast.push('Đã lưu lại một chút về mình', 'success')
}
</script>

<template>
  <section class="page-stack">
    <header class="page-header"><div><span>Hai trái tim</span><h1>Chuyện của chúng mình</h1></div><RouterLink to="/settings" class="icon-link" aria-label="Cài đặt"><Settings :size="20" /></RouterLink></header>
    <section v-if="couple.couple && breakdown" class="soft-card love-timer">
      <span>Ngày mình bắt đầu</span>
      <div class="love-timer-hearts">
        <div class="love-timer-unit"><div class="love-timer-heart"><Heart :size="44" fill="currentColor" /><strong>{{ breakdown.years }}</strong></div><span>Năm</span></div>
        <div class="love-timer-unit"><div class="love-timer-heart"><Heart :size="44" fill="currentColor" /><strong>{{ breakdown.months }}</strong></div><span>Tháng</span></div>
        <div class="love-timer-unit"><div class="love-timer-heart"><Heart :size="44" fill="currentColor" /><strong>{{ breakdown.weeks }}</strong></div><span>Tuần</span></div>
        <div class="love-timer-unit"><div class="love-timer-heart"><Heart :size="44" fill="currentColor" /><strong>{{ breakdown.days }}</strong></div><span>Ngày</span></div>
      </div>
      <div class="love-timer-footer">
        <span class="love-timer-date">{{ formatDate(couple.couple.started_date) }}</span>
        <span class="love-timer-clock">{{ pad(breakdown.hours) }} : {{ pad(breakdown.minutes) }} : {{ pad(breakdown.seconds) }}</span>
      </div>
    </section>
    <p v-else class="soft-card empty">Chưa cấu hình ngày bắt đầu</p>
    <form class="editor-card profile-form" @submit.prevent="save">
      <h2>Một chút về mình</h2>
      <div class="image-picker profile-image-picker">
        <img :src="form.avatar_url || '/favicon.svg'" alt="Ảnh đại diện" />
        <div>
          <strong>Ảnh đại diện</strong>
          <p>Chọn một tấm ảnh thật xinh của bạn.</p>
          <div class="image-picker-actions">
            <label class="ghost-btn image-picker-button"><Camera :size="17" /> Chọn ảnh<input type="file" accept="image/*" @change="selectAvatar" /></label>
            <button v-if="form.avatar_url" type="button" class="ghost-btn" @click="removeAvatar"><X :size="17" /> Bỏ ảnh</button>
          </div>
        </div>
      </div>
      <label>Tên hiển thị<input v-model="form.display_name" required /></label>
      <label>Nickname<input v-model="form.nickname" /></label>
      <label>Sinh nhật<input v-model="form.birthday" type="date" /></label>
      <button class="primary-btn profile-save-btn" type="submit">Lưu lại nhé</button>
    </form>
  </section>
</template>