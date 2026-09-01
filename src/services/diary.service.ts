import { supabase } from './supabase'
import type { Diary } from '../types'

export type DiaryInput = Omit<Diary, 'id' | 'created_at' | 'updated_at'>

export const diaryService = {
  async list(coupleId: string, search = '') {
    const { data, error } = await supabase.from('diaries').select('*').eq('couple_id', coupleId).order('diary_date', { ascending: false }).order('created_at', { ascending: false })
    if (error) throw error
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((item) => (item.title?.toLowerCase().includes(term) ?? false) || item.content.toLowerCase().includes(term))
  },
  async create(input: DiaryInput) {
    const { data, error } = await supabase.from('diaries').insert(input).select().single()
    if (error) throw error
    return data
  },
  async update(id: string, input: Partial<DiaryInput>) {
    const { data, error } = await supabase.from('diaries').update(input).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id: string) {
    const { error } = await supabase.from('diaries').delete().eq('id', id)
    if (error) throw error
  }
}
