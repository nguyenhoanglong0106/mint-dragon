import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key'

export const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
export const googlePhotosAlbumUrl = import.meta.env.VITE_GOOGLE_PHOTOS_ALBUM_URL || 'https://photos.app.goo.gl/K7bKtMDdSgHypoCk8'
export const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY || ''
export const hasYoutubeConfig = Boolean(import.meta.env.VITE_YOUTUBE_API_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 5 } }
})
