<script setup lang="ts">
import { BookOpen, Camera, Gift, HeartPulse, Home, Map, PanelLeftClose, PanelLeftOpen, Settings, UserRound } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCoupleStore } from '../stores/couple'
import { useOnlineStatus } from '../composables/useOnlineStatus'
import { googlePhotosAlbumUrl } from '../services/supabase'

const route = useRoute()
const couple = useCoupleStore()
const { isOnline } = useOnlineStatus()
onMounted(() => { void couple.load() })

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
