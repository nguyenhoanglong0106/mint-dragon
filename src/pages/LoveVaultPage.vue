<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Check, Dice5, Film, Gift, HeartHandshake, MapPinned, Plus, RotateCcw, Sparkles, Ticket, Trash2, UtensilsCrossed, X } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useLoveVaultStore } from '../stores/love-vault'
import { useToast } from '../composables/useToast'
import type { CouponType, LoveCoupon, WishCategory, WishItem } from '../types'

const auth = useAuthStore()
const couple = useCoupleStore()
const vault = useLoveVaultStore()
const toast = useToast()
const activeTab = ref<'wishes' | 'coupons'>('wishes')
const pickedWish = ref<WishItem | null>(null)
const submitting = ref(false)

const wishForm = reactive({ title: '', category: 'food' as WishCategory, note: '' })
const couponForm = reactive({ title: '', coupon_type: 'choice' as CouponType, description: '' })

const wishCategories = [
  { value: 'food', label: 'Món ăn', icon: UtensilsCrossed },
  { value: 'place', label: 'Nơi đi', icon: MapPinned },
  { value: 'movie', label: 'Phim', icon: Film },
  { value: 'activity', label: 'Việc làm', icon: Sparkles },
  { value: 'gift', label: 'Quà nhỏ', icon: Gift },
  { value: 'other', label: 'Khác', icon: HeartHandshake }
] as const

const couponTypes = [
  { value: 'choice', label: 'Được chọn' },
  { value: 'hug', label: 'Một cái ôm' },
  { value: 'date', label: 'Một buổi hẹn' },
  { value: 'pause', label: 'Không điện thoại' },
  { value: 'custom', label: 'Tự viết' }
] as const

const openWishes = computed(() => vault.wishes.filter((item) => item.status === 'open'))
const doneWishes = computed(() => vault.wishes.filter((item) => item.status === 'done'))
const availableCoupons = computed(() => vault.coupons.filter((item) => item.status === 'available'))
const usedCoupons = computed(() => vault.coupons.filter((item) => item.status === 'redeemed'))

const categoryMeta = (value: WishCategory) => wishCategories.find((item) => item.value === value) ?? wishCategories[5]
const couponTypeLabel = (value: CouponType) => couponTypes.find((item) => item.value === value)?.label ?? 'Tự viết'

async function reload() {
  if (couple.couple?.id) await vault.load(couple.couple.id)
}

async function createWish() {
  if (!couple.couple?.id || !auth.user || submitting.value) return
  submitting.value = true
  try {
    await vault.createWish({
      couple_id: couple.couple.id,
      created_by: auth.user.id,
      title: wishForm.title.trim(),
      category: wishForm.category,
      note: wishForm.note.trim() || null,
      status: 'open'
    })
    Object.assign(wishForm, { title: '', category: 'food', note: '' })
    toast.push('Đã thả một điều ước vào hũ', 'success')
  } catch (error) {
    toast.push(error instanceof Error ? error.message : 'Không lưu được điều ước', 'error')
  } finally {
    submitting.value = false
  }
}

async function pickWish() {
  if (!openWishes.value.length) {
    toast.push('Hũ điều ước đang trống.', 'info')
    return
  }
  const item = openWishes.value[Math.floor(Math.random() * openWishes.value.length)]
  try {
    pickedWish.value = await vault.updateWish(item.id, {
      picked_count: item.picked_count + 1,
      last_picked_at: new Date().toISOString()
    })
    toast.push('Đã bốc một điều cho hôm nay', 'success')
  } catch (error) {
    toast.push(error instanceof Error ? error.message : 'Không bốc được điều ước', 'error')
  }
}

async function toggleWish(item: WishItem) {
  const nextDone = item.status !== 'done'
  try {
    await vault.updateWish(item.id, {
      status: nextDone ? 'done' : 'open',
      completed_at: nextDone ? new Date().toISOString() : null
    })
  } catch (error) {
    toast.push(error instanceof Error ? error.message : 'Không cập nhật được điều ước', 'error')
  }
}

async function removeWish(item: WishItem) {
  if (!confirm('Xóa điều ước này khỏi hũ?')) return
  await vault.removeWish(item.id)
  if (pickedWish.value?.id === item.id) pickedWish.value = null
}

async function createCoupon() {
  if (!couple.couple?.id || !auth.user || submitting.value) return
  submitting.value = true
  try {
    await vault.createCoupon({
      couple_id: couple.couple.id,
      created_by: auth.user.id,
      title: couponForm.title.trim(),
      coupon_type: couponForm.coupon_type,
      description: couponForm.description.trim() || null,
      status: 'available'
    })
    Object.assign(couponForm, { title: '', coupon_type: 'choice', description: '' })
    toast.push('Đã tạo coupon yêu thương', 'success')
  } catch (error) {
    toast.push(error instanceof Error ? error.message : 'Không tạo được coupon', 'error')
  } finally {
    submitting.value = false
  }
}

async function redeemCoupon(item: LoveCoupon) {
  if (!auth.user) return
  try {
    await vault.updateCoupon(item.id, {
      status: 'redeemed',
      redeemed_by: auth.user.id,
      redeemed_at: new Date().toISOString()
    })
    toast.push('Coupon đã được dùng rồi nha', 'success')
  } catch (error) {
    toast.push(error instanceof Error ? error.message : 'Không dùng được coupon', 'error')
  }
}

async function restoreCoupon(item: LoveCoupon) {
  try {
    await vault.updateCoupon(item.id, {
      status: 'available',
      redeemed_by: null,
      redeemed_at: null
    })
  } catch (error) {
    toast.push(error instanceof Error ? error.message : 'Không mở lại được coupon', 'error')
  }
}

async function removeCoupon(item: LoveCoupon) {
  if (!confirm('Xóa coupon này?')) return
  await vault.removeCoupon(item.id)
}

onMounted(async () => {
  if (!couple.couple) await couple.load()
  await reload()
})
</script>

<template>
  <section class="vault-page pane-page">
    <header class="page-header vault-header">
      <div><span>Kho yêu thương</span><h1>Hũ điều ước & coupon</h1><p>Những món muốn ăn, nơi muốn đi, điều muốn làm và mấy tấm vé nhỏ để thương nhau vui hơn.</p></div>
    </header>

    <div class="vault-tabs" aria-label="Kho yêu thương">
      <button :class="{ selected: activeTab === 'wishes' }" type="button" @click="activeTab = 'wishes'"><Sparkles :size="18" /> Hũ điều ước</button>
      <button :class="{ selected: activeTab === 'coupons' }" type="button" @click="activeTab = 'coupons'"><Ticket :size="18" /> Coupon</button>
    </div>

    <div class="pane-scroll vault-scroll">
      <p v-if="couple.error || vault.error" class="config-warning">{{ couple.error || vault.error }}</p>
      <p v-if="vault.loading" class="soft-card">Đang mở kho yêu thương...</p>

      <template v-else-if="activeTab === 'wishes'">
        <form class="vault-form" @submit.prevent="createWish">
          <label>Điều muốn làm cùng nhau<input v-model="wishForm.title" required maxlength="120" placeholder="Ăn lẩu, xem phim, đi một nơi mới..." /></label>
          <div class="vault-choice-row">
            <button v-for="category in wishCategories" :key="category.value" :class="{ selected: wishForm.category === category.value }" type="button" @click="wishForm.category = category.value">
              <component :is="category.icon" :size="17" />
              <span>{{ category.label }}</span>
            </button>
          </div>
          <label>Ghi chú nhỏ<textarea v-model="wishForm.note" rows="2" placeholder="Quán nào, dịp nào, điều kiện gì..." /></label>
          <div class="vault-form-actions">
            <button class="primary-btn" :disabled="submitting" type="submit"><Plus :size="18" /> Thêm vào hũ</button>
            <button class="ghost-btn" type="button" @click="pickWish"><Dice5 :size="18" /> Hôm nay làm gì?</button>
          </div>
        </form>

        <section v-if="pickedWish" class="vault-random">
          <span>Kết quả bốc thăm</span>
          <strong>{{ pickedWish.title }}</strong>
          <p>{{ pickedWish.note || 'Một điều nhỏ cũng đủ làm hôm nay vui hơn.' }}</p>
          <button class="ghost-btn" type="button" @click="pickedWish = null"><X :size="17" /> Cất lại</button>
        </section>

        <section class="vault-list">
          <article v-for="item in openWishes" :key="item.id" class="vault-card">
            <div class="vault-card-icon"><component :is="categoryMeta(item.category).icon" :size="20" /></div>
            <div><span>{{ categoryMeta(item.category).label }}</span><strong>{{ item.title }}</strong><p v-if="item.note">{{ item.note }}</p><small v-if="item.picked_count">Đã bốc {{ item.picked_count }} lần</small></div>
            <div class="vault-actions"><button type="button" aria-label="Đánh dấu đã làm" @click="toggleWish(item)"><Check :size="17" /></button><button type="button" aria-label="Xóa" @click="removeWish(item)"><Trash2 :size="17" /></button></div>
          </article>
          <p v-if="!openWishes.length" class="soft-card empty">Hũ đang trống, thêm một điều muốn làm cùng nhau nha.</p>
        </section>

        <section v-if="doneWishes.length" class="vault-list done">
          <h2>Đã cùng nhau làm</h2>
          <article v-for="item in doneWishes" :key="item.id" class="vault-card">
            <div class="vault-card-icon done"><Check :size="20" /></div>
            <div><span>{{ categoryMeta(item.category).label }}</span><strong>{{ item.title }}</strong><p v-if="item.note">{{ item.note }}</p></div>
            <div class="vault-actions"><button type="button" aria-label="Mở lại" @click="toggleWish(item)"><RotateCcw :size="17" /></button><button type="button" aria-label="Xóa" @click="removeWish(item)"><Trash2 :size="17" /></button></div>
          </article>
        </section>
      </template>

      <template v-else>
        <form class="vault-form coupon-form" @submit.prevent="createCoupon">
          <label>Tên coupon<input v-model="couponForm.title" required maxlength="120" placeholder="Một lần được chọn món" /></label>
          <div class="coupon-type-row">
            <button v-for="type in couponTypes" :key="type.value" :class="{ selected: couponForm.coupon_type === type.value }" type="button" @click="couponForm.coupon_type = type.value">{{ type.label }}</button>
          </div>
          <label>Lời hứa nhỏ<textarea v-model="couponForm.description" rows="2" placeholder="Điều kiện dùng, thời hạn, lời nhắn..." /></label>
          <button class="primary-btn" :disabled="submitting" type="submit"><Ticket :size="18" /> Tạo coupon</button>
        </form>

        <section class="coupon-grid">
          <article v-for="item in availableCoupons" :key="item.id" class="coupon-card">
            <span>{{ couponTypeLabel(item.coupon_type) }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.description || 'Dùng khi cần được chiều một chút.' }}</p>
            <div class="vault-actions"><button type="button" @click="redeemCoupon(item)"><Check :size="17" /> Dùng coupon</button><button type="button" aria-label="Xóa" @click="removeCoupon(item)"><Trash2 :size="17" /></button></div>
          </article>
          <p v-if="!availableCoupons.length" class="soft-card empty">Chưa có coupon nào sẵn sàng.</p>
        </section>

        <section v-if="usedCoupons.length" class="coupon-grid used">
          <h2>Coupon đã dùng</h2>
          <article v-for="item in usedCoupons" :key="item.id" class="coupon-card used">
            <span>{{ couponTypeLabel(item.coupon_type) }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.description || 'Một lần yêu thương đã được đổi.' }}</p>
            <div class="vault-actions"><button type="button" @click="restoreCoupon(item)"><RotateCcw :size="17" /> Mở lại</button><button type="button" aria-label="Xóa" @click="removeCoupon(item)"><Trash2 :size="17" /></button></div>
          </article>
        </section>
      </template>
    </div>
  </section>
</template>
