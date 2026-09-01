import { onBeforeUnmount } from 'vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { useLocationStore } from '../stores/location'

export function useRealtimeLocation(coupleId: string) {
  const store = useLocationStore()
  let channel: RealtimeChannel | null = store.subscribe(coupleId)
  onBeforeUnmount(() => {
    if (channel) void supabase.removeChannel(channel)
    channel = null
  })
  return { status: store.realtimeStatus }
}
