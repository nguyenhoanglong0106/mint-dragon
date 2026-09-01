import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Memory } from '../types'
import { memoryService, type MemoryInput } from '../services/memory.service'

export const useMemoriesStore = defineStore('memories', () => {
  const items = ref<Memory[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load(coupleId: string, search = '', year = '') {
    loading.value = true; error.value = ''
    try { items.value = await memoryService.list(coupleId, search, year) }
    catch { error.value = 'Không tải được danh sách kỷ niệm' }
    finally { loading.value = false }
  }
  async function create(input: MemoryInput) { const item = await memoryService.create(input); items.value.unshift(item); return item }
  async function update(id: string, input: Partial<MemoryInput>) { const item = await memoryService.update(id, input); items.value = items.value.map((old) => old.id === id ? item : old); return item }
  async function remove(id: string) { await memoryService.remove(id); items.value = items.value.filter((item) => item.id !== id) }

  return { items, loading, error, load, create, update, remove }
})
