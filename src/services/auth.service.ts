import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

// App chỉ có 2 tài khoản cố định, đăng nhập bằng username ngắn thay vì
// email dài. Mỗi username tương ứng 1 email cố định trong Supabase Auth
// (auth.users) - xem supabase/migrations/0002_username_login.sql.
const EMAIL_DOMAIN = 'mint-dragon.local'
const usernameToEmail = (username: string) => `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`

export const authService = {
  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) =>
    supabase.auth.onAuthStateChange(callback),

  signIn: (username: string, password: string) =>
    supabase.auth.signInWithPassword({ email: usernameToEmail(username), password }),

  signOut: () => supabase.auth.signOut()
}
