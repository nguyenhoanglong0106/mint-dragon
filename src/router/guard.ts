import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export async function authGuard(to: RouteLocationNormalized) {
  const auth = useAuthStore()
  // Router chạy điều hướng đầu tiên ngay khi app.use(router), trước khi phiên
  // đã lưu được đọc xong - không chờ thì lần mở app nào cũng bị đẩy về /login.
  await auth.init()
  if (to.meta.auth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && auth.isAuthenticated) return { name: 'home' }
  return true
}
