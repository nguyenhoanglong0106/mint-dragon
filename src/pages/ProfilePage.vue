<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { Camera, Heart, Settings, X } from '@lucide/vue'
import { useCoupleStore } from '../stores/couple'
import { useToast } from '../composables/useToast'
import { daysBetween, formatDate } from '../utils/date'
import { imageFileToDataUrl } from '../utils/image'

const couple = useCoupleStore()
const toast = useToast()
const form = reactive({ display_name: '', nickname: '', avatar_url: '', birthday: '' })
const days = computed(() => daysBetween(couple.couple?.started_date))

onMounted(async () => {
  if (!couple.couple) await couple.load()
  Object.assign(form, {
    display_name: couple.myProfile?.display_name || '',
    nickname: couple.myProfile?.nickname || '',
    avatar_url: couple.myProfile?.avatar_url || '',
    birthday: couple.myProfile?.birthday || ''
  })
})

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
    <section class="couple-profile"><div v-for="profile in couple.profiles" :key="profile.id"><img :src="profile.avatar_url || '/favicon.svg'" :alt="profile.display_name" /><strong>{{ profile.nickname || profile.display_name }}</strong></div><Heart :size="28" fill="currentColor" /></section>
    <section class="soft-card"><span>Ngày mình bắt đầu</span><strong>{{ couple.couple ? formatDate(couple.couple.started_date) : 'Chưa cấu hình' }}</strong><p>Đã bên nhau {{ days }} ngày</p></section>
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