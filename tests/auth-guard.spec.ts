import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { authGuard } from '../src/router/guard'

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }))

vi.mock('../src/services/auth.service', () => ({
  authService: { getSession, onAuthStateChange: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }
}))

const route = (path: string, name: string, auth = false) =>
  ({ path, fullPath: path, name, meta: auth ? { auth: true } : {} }) as unknown as RouteLocationNormalized

// Phiên đã lưu được đọc bất đồng bộ (localStorage + có thể refresh token qua mạng).
const restoreSessionLater = (session: unknown) =>
  getSession.mockReturnValue(new Promise((resolve) => setTimeout(() => resolve({ data: { session } }), 10)))

describe('authGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getSession.mockReset()
  })

  it('waits for the saved session instead of sending a logged-in user to /login', async () => {
    restoreSessionLater({ user: { id: 'dragon-id' } })
    expect(await authGuard(route('/memories', 'memories', true))).toBe(true)
  })

  it('redirects to /login when there is no saved session', async () => {
    restoreSessionLater(null)
    expect(await authGuard(route('/memories', 'memories', true))).toEqual({ name: 'login', query: { redirect: '/memories' } })
  })

  it('sends a logged-in user from /login to home', async () => {
    restoreSessionLater({ user: { id: 'mint-id' } })
    expect(await authGuard(route('/login', 'login'))).toEqual({ name: 'home' })
  })

  it('restores the saved session only once across navigations', async () => {
    restoreSessionLater({ user: { id: 'dragon-id' } })
    await authGuard(route('/', 'home', true))
    await authGuard(route('/map', 'map', true))
    expect(getSession).toHaveBeenCalledTimes(1)
  })
})
