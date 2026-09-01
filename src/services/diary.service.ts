import type { Diary } from '../types'
import { supabase } from './supabase'

export type DiaryInput = Omit<Diary, 'id' | 'created_at' | 'updated_at'>

export const diaryService = {
  async list(coupleId: string, search = '') {
    let query = supabase.from('diaries').select('*').eq('couple_id', coupleId).order('diary_date', { ascending: false })
    if (search.trim()) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    const { data, error } = await query.returns<Diary[]>()
    if (error) throw error
    return data
  },
  async create(input: DiaryInput) {
    const { data, error } = await supabase.from('diaries').insert(input).select().single<Diary>()
    if (error) throw error
    return data
  },
  async update(id: string, input: Partial<DiaryInput>) {
    const { data, error } = await supabase.from('diaries').update(input).eq('id', id).select().single<Diary>()
    if (error) throw error
    return data
  },
  async remove(id: string) {
    const { error } = await supabase.from('diaries').delete().eq('id', id)
    if (error) throw error
  }
}
