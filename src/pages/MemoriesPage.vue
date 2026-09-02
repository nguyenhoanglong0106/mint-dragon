<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Calendar, Camera, Grid2X2, Heart, MapPin, Pencil, Plus, SlidersHorizontal, Trash2, X } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useMemoriesStore } from '../stores/memories'
import { useRoute } from 'vue-router'
import { useToast } from '../composables/useToast'
import { formatDate, todayIso } from '../utils/date'
import { imageFileToDataUrl } from '../utils/image'
import type { Memory } from '../types'

const route = useRoute()
const auth = useAuthStore()
const couple = useCoupleStore()
const memories = useMemoriesStore()
const toast = useToast()
const activeFilter = ref<'all' | 'year' | 'favorite'>('all')
const selectedYear = ref('')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  title: '',
  content: '',
  memory_date: todayIso(),
  cover_image_url: '',
  google_photos_url: '',
  location_name: '',
  latitude: '',
  longitude: '',
  is_favorite: false
})

const years = computed(() => [...new Set(memories.items.map((item) => item.memory_date.slice(0, 4)))])
const filteredMemories = computed(() => {
  if (activeFilter.value === 'favorite') return memories.items.filter((item) => item.is_favorite)
  if (activeFilter.value === 'year' && selectedYear.value) return memories.items.filter((item) => item.memory_date.startsWith(selectedYear.value))
  return memories.items
})
const groupedMemories = computed(() => years.value
  .map((year) => ({ year, items: filteredMemories.value.filter((item) => item.memory_date.startsWith(year)) }))
  .filter((group) => group.items.length))

function resetForm() {
  Object.assign(form, { title: '', content: '', memory_date: todayIso(), cover_image_url: '', google_photos_url: '', location_name: '', latitude: '', longitude: '', is_favorite: false })
}

function openForm(item?: Memory) {
  if (item) {
    editingId.value = item.id
    Object.assign(form, {
      title: item.title,
      content: item.content,
      memory_date: item.memory_date,
      cover_image_url: item.cover_image_url || '',
      google_photos_url: item.google_photos_url || '',
      location_name: item.location_name || '',
      latitude: item.latitude != null ? String(item.latitude) : '',
      longitude: item.longitude != null ? String(item.longitude) : '',
      is_favorite: item.is_favorite
    })
  } else {
    editingId.value = null
    resetForm()
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  resetForm()
}

async function selectCoverImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    form.cover_image_url = await imageFileToDataUrl(file, 1000, 0.84)
  } catch {
    toast.push('Mình chưa đọc được ảnh bìa này, thử chọn ảnh khác nhé.', 'error')
  } finally {
    input.value = ''
  }
}

function removeCoverImage() {
  form.cover_image_url = ''
}

async function reload() {
  if (couple.couple?.id) await memories.load(couple.couple.id)
  if (!selectedYear.value) selectedYear.value = years.value[0] || ''
}

async function saveMemory() {
  if (!couple.couple?.id || !auth.user) {
    toast.push('Chưa có couple_id nên chưa thể lưu kỷ niệm.', 'error')
    return
  }
  const payload = {
    couple_id: couple.couple.id,
    created_by: auth.user.id,
    title: form.title,
    content: form.content,
    memory_date: form.memory_date,
    cover_image_url: form.cover_image_url || null,
    google_photos_url: form.google_photos_url || null,
    location_name: form.location_name || null,
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    is_favorite: form.is_favorite
  }
  if (editingId.value) {
    await memories.update(editingId.value, payload)
    toast.push('Đã cập nhật kỷ niệm', 'success')
  } else {
    await memories.create(payload)
    toast.push('Đã cất kỷ niệm vào góc thương nhớ', 'success')
  }
  closeForm()
  await reload()
}

async function toggleFavorite(item: Memory) {
  try {
    await memories.update(item.id, { is_favorite: !item.is_favorite })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi cập nhật yêu thích'
    toast.push(msg, 'error')
  }
}

async function removeMemory(id: string) {
  if (!confirm('Xóa kỷ niệm này? Không thể hoàn tác đâu.')) return
  try {
    await memories.remove(id)
    toast.push('Đã xóa kỷ niệm', 'success')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi xóa kỷ niệm'
    toast.push(msg, 'error')
  }
}

onMounted(async () => {
  if (!couple.couple) await couple.load()
  await reload()
  if (route.query.add === '1') openForm()
})

watch(() => route.query.add, (value) => {
  if (value === '1') openForm()
})
</script>

<template>
  <section class="memories-page pane-page">
    <header class="memories-header">
      <div>
        <span>Góc thương nhớ</span>
        <h1>Những ngày mình thương</h1>
        <p>Từng dấu mốc nhỏ, gom thành chuyện tình của hai đứa</p>
      </div>
      <button class="memory-icon-btn" type="button" aria-label="Lọc yêu thích" @click="activeFilter = activeFilter === 'favorite' ? 'all' : 'favorite'"><SlidersHorizontal :size="20" /></button>
    </header>

    <section class="memory-tabs" aria-label="Bộ lọc kỷ niệm">
      <button :class="{ selected: activeFilter === 'all' }" type="button" @click="activeFilter = 'all'"><Grid2X2 :size="18" /> Tất cả</button>
      <button :class="{ selected: activeFilter === 'year' }" type="button" @click="activeFilter = 'year'"><Calendar :size="18" /> Theo năm</button>
      <button :class="{ selected: activeFilter === 'favorite' }" type="button" @click="activeFilter = 'favorite'"><Heart :size="18" /> Yêu thích</button>
    </section>

    <div class="pane-scroll memories-scroll">
      <label v-if="activeFilter === 'year'" class="memory-year-select">Chọn mùa thương<select v-model="selectedYear"><option v-for="year in years" :key="year" :value="year">{{ year }}</option></select></label>

      <p v-if="memories.loading" class="soft-card">Đang mở lại những ngày thương...</p>
      <p v-else-if="!filteredMemories.length" class="soft-card empty">Góc này vẫn đang chờ một kỷ niệm thật xinh.</p>

      <div v-else class="memory-history">
        <section v-for="group in groupedMemories" :key="group.year" class="memory-year-group">
          <h2>{{ group.year }}</h2>
          <RouterLink v-for="item in group.items" :key="item.id" :to="`/memories/${item.id}`" class="memory-card">
            <div class="memory-card-actions">
              <button type="button" :class="{ active: item.is_favorite }" :aria-label="item.is_favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'" @click.stop.prevent="toggleFavorite(item)"><Heart :size="15" :fill="item.is_favorite ? 'currentColor' : 'none'" /></button>
              <template v-if="item.created_by === auth.user?.id">
                <button type="button" aria-label="Sửa kỷ niệm" @click.stop.prevent="openForm(item)"><Pencil :size="15" /></button>
                <button type="button" aria-label="Xóa kỷ niệm" @click.stop.prevent="removeMemory(item.id)"><Trash2 :size="15" /></button>
              </template>
            </div>
            <div class="memory-card-body">
              <time>{{ formatDate(item.memory_date) }}</time>
              <strong><Heart v-if="item.is_favorite" :size="15" fill="currentColor" /> {{ item.title }}</strong>
              <p>{{ item.content }}</p>
              <small v-if="item.location_name"><MapPin :size="14" /> {{ item.location_name }}</small>
            </div>
            <img v-if="item.cover_image_url" :src="item.cover_image_url" alt="Ảnh kỷ niệm" />
          </RouterLink>
        </section>
      </div>
    </div>

    <button class="memory-fab" type="button" @click="openForm()"><Plus :size="34" /><span>Ghi thêm thương nhớ</span></button>

    <div v-if="showForm" class="memory-modal" role="dialog" aria-modal="true" aria-label="Ghi thêm thương nhớ">
      <form class="memory-form" @submit.prevent="saveMemory">
        <div class="memory-form-header"><h2>{{ editingId ? 'Sửa lại ngày thương' : 'Ghi lại một ngày thương' }}</h2><button type="button" aria-label="Đóng" @click="closeForm"><X :size="20" /></button></div>
        <label>Tên kỷ niệm<input v-model="form.title" required maxlength="120" placeholder="Valentine 2026" /></label>
        <label>Ngày của chúng mình<input v-model="form.memory_date" type="date" required /></label>
        <label>Lời nhắn gửi ngày ấy<textarea v-model="form.content" rows="3" required placeholder="Viết vài dòng để sau này đọc lại vẫn mỉm cười" /></label>
        <label>Nơi mình đã ở bên nhau<input v-model="form.location_name" placeholder="Hà Nội" /></label>
        <div class="image-picker memory-cover-picker">
          <img v-if="form.cover_image_url" :src="form.cover_image_url" alt="Ảnh bìa kỷ niệm" />
          <div v-else class="image-placeholder"><Camera :size="24" /><span>Ảnh bìa</span></div>
          <div>
            <strong>Ảnh bìa kỷ niệm</strong>
            <p>Chọn ảnh từ máy hoặc điện thoại để làm ảnh đại diện cho kỷ niệm này.</p>
            <div class="image-picker-actions">
              <label class="ghost-btn image-picker-button"><Camera :size="17" /> Chọn ảnh<input type="file" accept="image/*" @change="selectCoverImage" /></label>
              <button v-if="form.cover_image_url" type="button" class="ghost-btn" @click="removeCoverImage"><X :size="17" /> Bỏ ảnh</button>
            </div>
          </div>
        </div>
        <label>Link album Google Photos<input v-model="form.google_photos_url" type="url" placeholder="https://photos.app.goo.gl/..." /></label>
        <button class="primary-btn" type="submit"><Plus :size="18" /> {{ editingId ? 'Cập nhật ngày thương' : 'Lưu ngày thương' }}</button>
      </form>
    </div>
  </section>
</template>
