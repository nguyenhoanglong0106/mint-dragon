import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Diary } from '../types'
import { diaryService, type DiaryInput } from '../services/diary.service'

export const useDiariesStore = defineStore('diaries', () => {
  const items = ref<Diary[]>([])
  const loading = ref(false)
  const error = ref('')
  async function load(coupleId: string, search = '') {
    loading.value = true; error.value = ''
    try { items.value = await diaryService.list(coupleId, search) }
    catch { error.value = 'Không tải được nhật ký' }
    finally { loading.value = false }
  }
  async function create(input: DiaryInput) { const item = await diaryService.create(input); items.value.unshift(item); return item }
  async function update(id: string, input: Partial<DiaryInput>) { const item = await diaryService.update(id, input); items.value = items.value.map((old) => old.id === id ? item : old); return item }
  async function remove(id: string) { await diaryService.remove(id); items.value = items.value.filter((item) => item.id !== id) }
  return { items, loading, error, load, create, update, remove }
})
