<script setup lang="ts">
import { BookOpen, Camera, Gift, HeartPulse, Home, Map, PanelLeftClose, PanelLeftOpen, Settings, UserRound } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCoupleStore } from '../stores/couple'
import { useOnlineStatus } from '../composables/useOnlineStatus'
import { useToast } from '../composables/useToast'
import { googlePhotosAlbumUrl, supabase } from '../services/supabase'
import { formatDate } from '../utils/date'
import { moodMeta } from '../utils/mood'
import type { Diary, LoveCoupon, WishItem } from '../types'

const route = useRoute()
const couple = useCoupleStore()
const toast = useToast()
const { isOnline } = useOnlineStatus()
let notificationsChannel: RealtimeChannel | null = null

const openAlbum = () => window.open(googlePhotosAlbumUrl, '_blank', 'noopener,noreferrer')

const sidebarOpen = ref(localStorage.getItem('sidebar-open') !== 'false')
watch(sidebarOpen, (value) => localStorage.setItem('sidebar-open', String(value)))

const nav = [
  { to: '/', label: 'Chúng mình', icon: Home },
  { to: '/diary', label: 'Lời nhắn', icon: BookOpen },
  { to: '/memories', label: 'Kỉ niệm', icon: HeartPulse },
  { to: '/vault', label: 'Kho yêu', icon: Gift },
  { to: '/map', label: 'Vị trí', icon: Map },
  { to: '/profile', label: 'Cá nhân', icon: UserRound }
]

const profileName = (id: string | null | undefined) => couple.profiles.find((profile) => profile.id === id)?.nickname || couple.profiles.find((profile) => profile.id === id)?.display_name || 'Người ấy'
const isMine = (userId: string | null | undefined) => userId === couple.myProfile?.id
const couponTypeLabels: Record<LoveCoupon['coupon_type'], string> = { choice: 'Được chọn', hug: 'Một cái ôm', date: 'Một buổi hẹn', pause: 'Không điện thoại', custom: 'Tự viết' }

function notifyDiary(item: Diary) {
  if (isMine(item.created_by)) return
  const sender = profileName(item.created_by)
  const mood = item.mood ? moodMeta(item.mood).label : 'nhớ'
  const musicLine = item.music_title ? `\nKèm bài hát: ${item.music_title}` : ''
  toast.push(`Lời nhắn mới từ ${sender}`, 'info', {
    title: `Lời nhắn mới từ ${sender}`,
    body: `${sender} vừa cảm thấy ${mood}: "${item.content}"${musicLine}`
  })
}

function notifyWishInsert(item: WishItem) {
  if (isMine(item.created_by)) return
  const sender = profileName(item.created_by)
  toast.push(`Điều ước mới từ ${sender}`, 'info', {
    title: `Điều ước mới từ ${sender}`,
    body: `Ngày ${formatDate(item.created_at)}, ${sender} ước rằng: "${item.title}". ${item.note || 'Một điều nhỏ cho hai đứa.'}`
  })
}

function notifyWishUpdate(current: WishItem, previous: Partial<WishItem>) {
  if (isMine(current.updated_by)) return
  const sender = profileName(current.updated_by)
  if (previous.picked_count != null && current.picked_count > previous.picked_count) {
    toast.push(`${sender} vừa bốc hũ điều ước`, 'info', {
      title: `${sender} vừa bốc hũ điều ước`,
      body: `Ngày ${formatDate(current.last_picked_at || current.updated_at)}, ${sender} bốc trúng: "${current.title}". ${current.note || 'Một điều nhỏ cho hai đứa.'}`
    })
    return
  }
  if (previous.status && previous.status !== current.status) {
    const title = current.status === 'done' ? `${sender} vừa hoàn thành một điều ước` : `${sender} vừa mở lại một điều ước`
    const date = current.status === 'done' ? (current.completed_at || current.updated_at) : current.updated_at
    toast.push(title, 'info', {
      title,
      body: current.status === 'done' ? `Ngày ${formatDate(date)}, ${sender} đã hoàn thành: "${current.title}".` : `Ngày ${formatDate(date)}, ${sender} muốn giữ lại điều ước: "${current.title}".`
    })
  }
}

function notifyCouponInsert(item: LoveCoupon) {
  if (isMine(item.created_by)) return
  const sender = profileName(item.created_by)
  toast.push(`Vé yêu thương mới từ ${sender}`, 'info', {
    title: `Vé yêu thương mới từ ${sender}`,
    body: `Ngày ${formatDate(item.created_at)}, ${sender} muốn: "${item.title}" (${couponTypeLabels[item.coupon_type]}). ${item.description || 'Dùng khi cần được chiều một chút.'}`
  })
}

function notifyCouponUpdate(current: LoveCoupon, previous: Partial<LoveCoupon>) {
  if (isMine(current.updated_by)) return
  const sender = profileName(current.updated_by)
  if (previous.status && previous.status !== current.status) {
    const title = current.status === 'redeemed' ? `${sender} vừa dùng vé yêu thương` : `${sender} vừa mở lại vé yêu thương`
    const date = current.status === 'redeemed' ? (current.redeemed_at || current.updated_at) : current.updated_at
    toast.push(title, 'info', {
      title,
      body: current.status === 'redeemed' ? `Ngày ${formatDate(date)}, ${sender} đã dùng: "${current.title}". ${current.description || 'Một lời hứa nhỏ vừa thành thật.'}` : `Ngày ${formatDate(date)}, "${current.title}" đã sẵn sàng dùng lại.`
    })
  }
}

function subscribeNotifications(coupleId: string) {
  if (notificationsChannel) void supabase.removeChannel(notificationsChannel)
  notificationsChannel = supabase.channel(`couple-notifications:${coupleId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'diaries', filter: `couple_id=eq.${coupleId}` }, (payload) => notifyDiary(payload.new as Diary))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wish_items', filter: `couple_id=eq.${coupleId}` }, (payload) => notifyWishInsert(payload.new as WishItem))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wish_items', filter: `couple_id=eq.${coupleId}` }, (payload) => notifyWishUpdate(payload.new as WishItem, payload.old as Partial<WishItem>))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'love_coupons', filter: `couple_id=eq.${coupleId}` }, (payload) => notifyCouponInsert(payload.new as LoveCoupon))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'love_coupons', filter: `couple_id=eq.${coupleId}` }, (payload) => notifyCouponUpdate(payload.new as LoveCoupon, payload.old as Partial<LoveCoupon>))
    .subscribe()
}

onMounted(async () => {
  await couple.load()
  if (couple.couple?.id) subscribeNotifications(couple.couple.id)
})

onBeforeUnmount(() => {
  if (notificationsChannel) void supabase.removeChannel(notificationsChannel)
})
</script>

<template>
  <div class="app-shell">
    <aside class="desktop-sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-head">
        <RouterLink v-show="sidebarOpen" to="/" class="brand">Homie Love</RouterLink>
        <button
          class="icon-link"
          type="button"
          :aria-label="sidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'"
          @click="sidebarOpen = !sidebarOpen"
        >
          <component :is="sidebarOpen ? PanelLeftClose : PanelLeftOpen" :size="18" />
        </button>
      </div>

      <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="side-link" :title="item.label">
        <component :is="item.icon" :size="18" /><span v-show="sidebarOpen">{{ item.label }}</span>
      </RouterLink>
      <RouterLink to="/settings" class="side-link" title="Cài đặt"><Settings :size="18" /><span v-show="sidebarOpen">Cài đặt</span></RouterLink>

      <p class="side-divider"><span v-show="sidebarOpen">Thao tác nhanh</span></p>
      <RouterLink to="/memories?add=1" class="side-link" title="Ghi kỷ niệm mới"><HeartPulse :size="18" /><span v-show="sidebarOpen">Ghi kỷ niệm mới</span></RouterLink>
      <button type="button" class="side-link" title="Album hai đứa" @click="openAlbum"><Camera :size="18" /><span v-show="sidebarOpen">Album hai đứa</span></button>
    </aside>

    <main class="app-main">
      <div v-if="!isOnline" class="offline-banner">Mất kết nối Internet. Dữ liệu có thể không được cập nhật.</div>
      <RouterView v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <nav class="bottom-nav" aria-label="Điều hướng chính">
      <RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="['bottom-link', { active: route.path === item.to || (item.to !== '/' && route.path.startsWith(`${item.to}/`)) }]" :aria-label="item.label">
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
