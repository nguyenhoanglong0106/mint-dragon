import type { LiveLocation, LocationPayload } from '../types'
import { supabase } from './supabase'

export const locationService = {
  async list(coupleId: string) {
    const { data, error } = await supabase.from('live_locations').select('*').eq('couple_id', coupleId).returns<LiveLocation[]>()
    if (error) throw error
    return data
  },
  async upsert(userId: string, coupleId: string, payload: LocationPayload) {
    const row = { user_id: userId, couple_id: coupleId, ...payload, updated_at: new Date().toISOString() }
    const { data, error } = await supabase.from('live_locations').upsert(row, { onConflict: 'user_id' }).select().single<LiveLocation>()
    if (error) throw error
    return data
  },
  async remove(userId: string) {
    const { error } = await supabase.from('live_locations').delete().eq('user_id', userId)
    if (error) throw error
  },
  subscribe(coupleId: string, onChange: (location: LiveLocation) => void, onDelete: (userId: string) => void) {
    return supabase.channel(`live_locations:${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_locations', filter: `couple_id=eq.${coupleId}` }, (payload) => {
        if (payload.eventType === 'DELETE') onDelete((payload.old as { user_id: string }).user_id)
        else onChange(payload.new as LiveLocation)
      })
      .subscribe()
  }
}
