import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, clearAuth, getStoredUser, getToken, setAuth } from '../lib/api'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [token, setToken] = useState<string | null>(() => getToken())
  const [loading, setLoading] = useState(false)

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.signIn({ email, password })
      setAuth(res.access_token, res.user)
      setToken(res.access_token)
      setUser(res.user)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      const res = await api.signUp({ email, password, full_name: fullName })
      setAuth(res.access_token, res.user)
      setToken(res.access_token)
      setUser(res.user)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getToken()) return
    try {
      const me = await api.me()
      setUser(me)
      localStorage.setItem('expense_tracker_user', JSON.stringify(me))
    } catch {
      /* keep stored user */
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, loading, signIn, signUp, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
