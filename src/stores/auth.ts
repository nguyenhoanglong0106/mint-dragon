import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { authService } from '../services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref('')
  const isAuthenticated = computed(() => Boolean(user.value))

  async function init() {
    loading.value = true
    const { data } = await authService.getSession()
    user.value = data.session?.user ?? null
    authService.onAuthStateChange((_event, session) => { user.value = session?.user ?? null })
    loading.value = false
  }

  async function login(email: string, password: string) {
    error.value = ''
    const { data, error: authError } = await authService.signIn(email, password)
    if (authError) { error.value = 'Email hoặc mật khẩu chưa đúng'; throw authError }
    user.value = data.user
  }

  async function logout() {
    await authService.signOut()
    user.value = null
  }

  return { user, loading, error, isAuthenticated, init, login, logout }
})
