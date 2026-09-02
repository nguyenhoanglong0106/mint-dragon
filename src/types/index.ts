export type Mood = 'happy' | 'love' | 'normal' | 'sad' | 'excited' | 'calm'

export interface Couple { id: string; name: string; started_date: string; created_at: string }
export interface Profile { id: string; couple_id: string | null; username: string | null; display_name: string; nickname: string | null; avatar_url: string | null; birthday: string | null; created_at: string; updated_at: string }
export interface Memory { id: string; couple_id: string; created_by: string; title: string; content: string; memory_date: string; cover_image_url: string | null; google_photos_url: string | null; location_name: string | null; latitude: number | null; longitude: number | null; is_favorite: boolean; created_at: string; updated_at: string }
export interface Diary { id: string; couple_id: string; created_by: string; diary_date: string; title: string; content: string; mood: Mood | null; weather: string | null; google_photos_url: string | null; music_video_id: string | null; music_title: string | null; created_at: string; updated_at: string }
export interface LiveLocation { user_id: string; couple_id: string; latitude: number; longitude: number; accuracy: number | null; altitude: number | null; heading: number | null; speed: number | null; updated_at: string }
export interface LocationPayload { latitude: number; longitude: number; accuracy: number | null; altitude: number | null; heading: number | null; speed: number | null }
export interface ToastMessage { id: number; type: 'success' | 'error' | 'info'; text: string }
export interface PartnerLocation extends LiveLocation { profile?: Profile }
