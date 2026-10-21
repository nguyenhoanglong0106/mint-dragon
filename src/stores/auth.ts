import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { authService } from '../services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref('')
  const isAuthenticated = computed(() => Boolean(user.value))

  let initPromise: Promise<void> | null = null

  // Khôi phục phiên đã lưu đúng 1 lần; router guard chờ hàm này xong mới kiểm
  // tra đăng nhập, nên gọi lại nhiều lần chỉ trả về cùng 1 promise.
  function init() {
    initPromise ??= (async () => {
      loading.value = true
      try {
        const { data } = await authService.getSession()
        user.value = data.session?.user ?? null
        authService.onAuthStateChange((_event, session) => { user.value = session?.user ?? null })
      } finally {
        loading.value = false
      }
    })()
    return initPromise
  }

  async function login(username: string, password: string) {
    error.value = ''
    const { data, error: authError } = await authService.signIn(username, password)
    if (authError) {
      error.value = authError.message.includes('Invalid login credentials')
        ? 'Sai username hoặc mật khẩu'
        : authError.message || 'Đăng nhập thất bại'
      throw authError
    }
    user.value = data.user
  }

  async function signup(_username: string, _password: string) {
    error.value = ''
    console.log('📝 Signup not available - use fixed accounts')
    error.value = 'Chỉ có 2 tài khoản: dragon / mint'
    throw new Error('Signup not available')
  }

  async function logout() {
    await authService.signOut()
    user.value = null
  }

  return { user, loading, error, isAuthenticated, init, login, signup, logout }
})
