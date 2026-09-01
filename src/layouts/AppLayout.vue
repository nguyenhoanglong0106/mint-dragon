<script setup lang="ts">
import { HeartPulse, Home, Map, Settings, UserRound } from '@lucide/vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCoupleStore } from '../stores/couple'
import { useOnlineStatus } from '../composables/useOnlineStatus'

const route = useRoute()
const couple = useCoupleStore()
const { isOnline } = useOnlineStatus()
onMounted(() => { void couple.load() })
const nav = [
  { to: '/', label: 'Nhà mình', icon: Home },
  { to: '/memories', label: 'Thương nhớ', icon: HeartPulse },
  { to: '/map', label: 'Gần nhau', icon: Map },
  { to: '/profile', label: 'Chúng mình', icon: UserRound }
]
</script>

<template>
  <div class="app-shell">
    <aside class="desktop-sidebar">
      <RouterLink to="/" class="brand">Homie Love</RouterLink>
      <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="side-link">
        <component :is="item.icon" :size="18" /> {{ item.label }}
      </RouterLink>
      <RouterLink to="/settings" class="side-link"><Settings :size="18" /> Góc riêng</RouterLink>
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
