import type { Couple, Profile } from '../types'
import { supabase } from './supabase'

export const coupleService = {
  async getMyProfile() {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id ?? '').maybeSingle<Profile>()
    if (error) throw error
    return data
  },
  async getCouple(coupleId: string) {
    const { data, error } = await supabase.from('couples').select('*').eq('id', coupleId).single<Couple>()
    if (error) throw error
    return data
  },
  async getProfiles(coupleId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('couple_id', coupleId).order('created_at', { ascending: true }).returns<Profile[]>()
    if (error) throw error
    return data
  },
  async updateProfile(profile: Partial<Profile> & { id: string }) {
    const { data, error } = await supabase.from('profiles').update(profile).eq('id', profile.id).select().single<Profile>()
    if (error) throw error
    return data
  }
}
