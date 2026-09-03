import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LoveCoupon, WishItem } from '../types'
import { loveVaultService, type CouponInput, type WishInput } from '../services/love-vault.service'

export const useLoveVaultStore = defineStore('love-vault', () => {
  const wishes = ref<WishItem[]>([])
  const coupons = ref<LoveCoupon[]>([])
  const loading = ref(false)
  const error = ref('')

  const openWishes = computed(() => wishes.value.filter((item) => item.status === 'open'))
  const availableCoupons = computed(() => coupons.value.filter((item) => item.status === 'available'))

  async function load(coupleId: string) {
    loading.value = true
    error.value = ''
    try {
      const [wishRows, couponRows] = await Promise.all([
        loveVaultService.listWishes(coupleId),
        loveVaultService.listCoupons(coupleId)
      ])
      wishes.value = wishRows
      coupons.value = couponRows
    } catch (loadError) {
      error.value = loadError instanceof Error ? loadError.message : 'Không tải được kho yêu thương'
    } finally {
      loading.value = false
    }
  }

  async function createWish(input: WishInput) {
    const item = await loveVaultService.createWish(input)
    wishes.value = [item, ...wishes.value]
    return item
  }

  async function updateWish(id: string, input: Parameters<typeof loveVaultService.updateWish>[1]) {
    const item = await loveVaultService.updateWish(id, input)
    wishes.value = wishes.value.map((old) => old.id === id ? item : old)
    return item
  }

  async function removeWish(id: string) {
    await loveVaultService.removeWish(id)
    wishes.value = wishes.value.filter((item) => item.id !== id)
  }

  async function createCoupon(input: CouponInput) {
    const item = await loveVaultService.createCoupon(input)
    coupons.value = [item, ...coupons.value]
    return item
  }

  async function updateCoupon(id: string, input: Parameters<typeof loveVaultService.updateCoupon>[1]) {
    const item = await loveVaultService.updateCoupon(id, input)
    coupons.value = coupons.value.map((old) => old.id === id ? item : old)
    return item
  }

  async function removeCoupon(id: string) {
    await loveVaultService.removeCoupon(id)
    coupons.value = coupons.value.filter((item) => item.id !== id)
  }

  return { wishes, coupons, openWishes, availableCoupons, loading, error, load, createWish, updateWish, removeWish, createCoupon, updateCoupon, removeCoupon }
})
