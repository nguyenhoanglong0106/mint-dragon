<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'

const username = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const canSubmit = computed(() => username.value.length > 0 && password.value.length >= 6)

async function submit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    await router.replace(String(route.query.redirect || '/'))
  } catch {
    // auth.error is already set by the store; nothing else to do here
  } finally { loading.value = false }
}
</script>
<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-mark"><Heart :size="30" /></div>
      <h1>Góc nhỏ của chúng mình</h1>
      <p>Một nơi dịu dàng để cất kỷ niệm, lời nhắn và những lần mình tìm thấy nhau.</p>
      <form @submit.prevent="submit" method="post">
        <label>Username<input v-model.trim="username" type="text" name="username" id="login-username" autocomplete="username" placeholder="dragon hoặc mint" required /></label>
        <label>Mật khẩu<input v-model="password" type="password" name="password" id="login-password" autocomplete="current-password" minlength="6" required /></label>
        <label class="check"><input type="checkbox" checked disabled /> Ghi nhớ phiên đăng nhập (luôn bật)</label>
        <button class="primary-btn" type="submit" :disabled="!canSubmit || loading">{{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}</button>
        <p v-if="auth.error" class="form-error">{{ auth.error }}</p>
      </form>
    </section>
  </main>
</template>
