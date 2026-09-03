import { supabase } from './supabase'
import type { LoveCoupon, WishItem } from '../types'

export type WishInput = Omit<WishItem, 'id' | 'updated_by' | 'picked_count' | 'last_picked_at' | 'completed_at' | 'created_at' | 'updated_at'>
export type CouponInput = Omit<LoveCoupon, 'id' | 'updated_by' | 'redeemed_by' | 'redeemed_at' | 'created_at' | 'updated_at'>

export const loveVaultService = {
  async listWishes(coupleId: string) {
    const { data, error } = await supabase.from('wish_items').select('*').eq('couple_id', coupleId).order('status').order('updated_at', { ascending: false }).returns<WishItem[]>()
    if (error) throw error
    return data
  },
  async createWish(input: WishInput) {
    const { data, error } = await supabase.from('wish_items').insert(input).select().single<WishItem>()
    if (error) throw error
    return data
  },
  async updateWish(id: string, input: Partial<WishInput> & Partial<Pick<WishItem, 'updated_by' | 'picked_count' | 'last_picked_at' | 'completed_at'>>) {
    const { data, error } = await supabase.from('wish_items').update(input).eq('id', id).select().single<WishItem>()
    if (error) throw error
    return data
  },
  async removeWish(id: string) {
    const { error } = await supabase.from('wish_items').delete().eq('id', id)
    if (error) throw error
  },
  async listCoupons(coupleId: string) {
    const { data, error } = await supabase.from('love_coupons').select('*').eq('couple_id', coupleId).order('status').order('updated_at', { ascending: false }).returns<LoveCoupon[]>()
    if (error) throw error
    return data
  },
  async createCoupon(input: CouponInput) {
    const { data, error } = await supabase.from('love_coupons').insert(input).select().single<LoveCoupon>()
    if (error) throw error
    return data
  },
  async updateCoupon(id: string, input: Partial<CouponInput> & Partial<Pick<LoveCoupon, 'updated_by' | 'redeemed_by' | 'redeemed_at'>>) {
    const { data, error } = await supabase.from('love_coupons').update(input).eq('id', id).select().single<LoveCoupon>()
    if (error) throw error
    return data
  },
  async removeCoupon(id: string) {
    const { error } = await supabase.from('love_coupons').delete().eq('id', id)
    if (error) throw error
  }
}
