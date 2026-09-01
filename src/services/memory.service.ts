import { supabase } from './supabase'
import type { Memory } from '../types'

export type MemoryInput = Omit<Memory, 'id' | 'created_at' | 'updated_at'>

export const memoryService = {
  async list(coupleId: string, search = '', year = '') {
    let query = supabase.from('memories').select('*').eq('couple_id', coupleId).order('memory_date', { ascending: false })
    if (year) query = query.gte('memory_date', `${year}-01-01`).lte('memory_date', `${year}-12-31`)
    const { data, error } = await query
    if (error) throw error
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((item) => item.title.toLowerCase().includes(term) || item.content.toLowerCase().includes(term))
  },
  async get(id: string) {
    const { data, error } = await supabase.from('memories').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },
  async create(input: MemoryInput) {
    const { data, error } = await supabase.from('memories').insert(input).select().single()
    if (error) throw error
    return data
  },
  async update(id: string, input: Partial<MemoryInput>) {
    const { data, error } = await supabase.from('memories').update(input).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id: string) {
    const { error } = await supabase.from('memories').delete().eq('id', id)
    if (error) throw error
  }
}
