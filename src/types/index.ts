export type Mood = 'happy' | 'love' | 'normal' | 'sad' | 'excited' | 'calm'

export interface Couple { id: string; name: string; started_date: string; created_at: string }
export interface Profile { id: string; couple_id: string | null; username: string | null; display_name: string; nickname: string | null; avatar_url: string | null; birthday: string | null; created_at: string; updated_at: string }
export interface Memory { id: string; couple_id: string; created_by: string; title: string; content: string; memory_date: string; cover_image_url: string | null; google_photos_url: string | null; location_name: string | null; latitude: number | null; longitude: number | null; audio_note_url: string | null; video_note_url: string | null; is_favorite: boolean; created_at: string; updated_at: string }
export interface Diary { id: string; couple_id: string; created_by: string; diary_date: string; title: string; content: string; mood: Mood | null; weather: string | null; google_photos_url: string | null; music_video_id: string | null; music_title: string | null; created_at: string; updated_at: string }
export interface LiveLocation { user_id: string; couple_id: string; latitude: number; longitude: number; accuracy: number | null; altitude: number | null; heading: number | null; speed: number | null; updated_at: string }
export interface LocationPayload { latitude: number; longitude: number; accuracy: number | null; altitude: number | null; heading: number | null; speed: number | null }
export interface ToastMessage { id: number; type: 'success' | 'error' | 'info'; text: string }
export interface PartnerLocation extends LiveLocation { profile?: Profile }
export type WishCategory = 'food' | 'place' | 'movie' | 'activity' | 'gift' | 'other'
export type WishStatus = 'open' | 'done'
export interface WishItem { id: string; couple_id: string; created_by: string; title: string; category: WishCategory; note: string | null; status: WishStatus; picked_count: number; last_picked_at: string | null; completed_at: string | null; created_at: string; updated_at: string }
export type CouponType = 'choice' | 'hug' | 'date' | 'pause' | 'custom'
export type CouponStatus = 'available' | 'redeemed' | 'archived'
export interface LoveCoupon { id: string; couple_id: string; created_by: string; title: string; description: string | null; coupon_type: CouponType; status: CouponStatus; redeemed_by: string | null; redeemed_at: string | null; created_at: string; updated_at: string }
