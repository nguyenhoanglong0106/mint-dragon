import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import AppLayout from '../layouts/AppLayout.vue'
import HomePage from '../pages/HomePage.vue'
import MemoriesPage from '../pages/MemoriesPage.vue'
import MemoryDetailPage from '../pages/MemoryDetailPage.vue'
import DiaryPage from '../pages/DiaryPage.vue'
import MapPage from '../pages/MapPage.vue'
import LoveVaultPage from '../pages/LoveVaultPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import SettingsPage from '../pages/SettingsPage.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginPage },
    {
      path: '/', component: AppLayout, meta: { auth: true }, children: [
        { path: '', name: 'home', component: HomePage },
        { path: 'memories', name: 'memories', component: MemoriesPage },
        { path: 'memories/:id', name: 'memory-detail', component: MemoryDetailPage },
        { path: 'diary', name: 'diary', component: DiaryPage },
        { path: 'vault', name: 'vault', component: LoveVaultPage },
        { path: 'map', name: 'map', component: MapPage },
        { path: 'profile', name: 'profile', component: ProfilePage },
        { path: 'settings', name: 'settings', component: SettingsPage }
      ]
    }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && auth.isAuthenticated) return { name: 'home' }
  return true
})

export default router
