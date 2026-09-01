import type { SpecialDate } from '../types'
import { supabase } from './supabase'

export type SpecialDateInput = Omit<SpecialDate, 'id' | 'created_at'>

export const specialDateService = {
  async list(coupleId: string) {
    const { data, error } = await supabase.from('special_dates').select('*').eq('couple_id', coupleId).order('event_date', { ascending: true }).returns<SpecialDate[]>()
    if (error) throw error
    return data
  },
  async create(input: SpecialDateInput) {
    const { data, error } = await supabase.from('special_dates').insert(input).select().single<SpecialDate>()
    if (error) throw error
    return data
  },
  async update(id: string, input: Partial<SpecialDateInput>) {
    const { data, error } = await supabase.from('special_dates').update(input).eq('id', id).select().single<SpecialDate>()
    if (error) throw error
    return data
  },
  async remove(id: string) {
    const { error } = await supabase.from('special_dates').delete().eq('id', id)
    if (error) throw error
  }
}
