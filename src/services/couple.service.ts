import { supabase } from './supabase'
import type { Couple, Profile } from '../types'

export const coupleService = {
  async getMyProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    return data
  },
  async createProfile(profile: Pick<Profile, 'id' | 'display_name'>): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').insert(profile).select().single()
    if (error) throw error
    return data
  },
  async getCouple(coupleId: string): Promise<Couple> {
    const { data, error } = await supabase.from('couples').select('*').eq('id', coupleId).single()
    if (error) throw error
    return data
  },
  async getProfiles(coupleId: string): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*').eq('couple_id', coupleId).order('created_at')
    if (error) throw error
    return data
  },
  async updateProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const { id, ...changes } = profile
    const { data, error } = await supabase.from('profiles').update(changes).eq('id', id).select().single()
    if (error) throw error
    return data
  }
}
