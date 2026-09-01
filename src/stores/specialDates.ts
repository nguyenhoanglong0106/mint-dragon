import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpecialDate } from '../types'
import { specialDateService, type SpecialDateInput } from '../services/specialDate.service'

export const useSpecialDatesStore = defineStore('specialDates', () => {
  const items = ref<SpecialDate[]>([])
  const loading = ref(false)
  async function load(coupleId: string) { loading.value = true; try { items.value = await specialDateService.list(coupleId) } finally { loading.value = false } }
  async function create(input: SpecialDateInput) { const item = await specialDateService.create(input); items.value.push(item); return item }
  async function update(id: string, input: Partial<SpecialDateInput>) { const item = await specialDateService.update(id, input); items.value = items.value.map((old) => old.id === id ? item : old); return item }
  async function remove(id: string) { await specialDateService.remove(id); items.value = items.value.filter((item) => item.id !== id) }
  return { items, loading, load, create, update, remove }
})
