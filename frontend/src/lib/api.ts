import type {
  AuthResponse,
  Category,
  CreateTransactionPayload,
  MonthlyAnalytics,
  PredictResponse,
  SpendingSummary,
  Transaction,
  User,
} from '../types'
import { DEFAULT_CATEGORIES } from './categories'
import {
  MOCK_ANALYTICS,
  MOCK_SUMMARY,
  MOCK_TRANSACTIONS,
  MOCK_USER,
  mockPredict,
} from './mockData'

const TOKEN_KEY = 'expense_tracker_token'
const USER_KEY = 'expense_tracker_user'
const DEMO_TX_KEY = 'expense_tracker_demo_tx'

/**
 * Local default hits FastAPI directly.
 * Docker build sets VITE_API_URL=/api so nginx can reverse-proxy to the backend.
 */
const API_BASE =
  import.meta.env.VITE_API_URL !== undefined
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : 'http://localhost:8000'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function isNetworkError(err: unknown): boolean {
  return (
    err instanceof TypeError ||
    (err instanceof Error && /failed to fetch|network|load failed/i.test(err.message))
  )
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = (await res.json()) as { detail?: string | Array<{ msg?: string }> }
      if (typeof body.detail === 'string') detail = body.detail
      else if (Array.isArray(body.detail) && body.detail[0]?.msg) detail = body.detail[0].msg
    } catch {
      /* ignore */
    }
    throw new ApiError(detail || 'Request failed', res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function loadDemoTx(): Transaction[] {
  const raw = localStorage.getItem(DEMO_TX_KEY)
  if (!raw) return [...MOCK_TRANSACTIONS]
  try {
    return JSON.parse(raw) as Transaction[]
  } catch {
    return [...MOCK_TRANSACTIONS]
  }
}

function saveDemoTx(tx: Transaction[]) {
  localStorage.setItem(DEMO_TX_KEY, JSON.stringify(tx))
}

interface BackendSummary {
  total_amount: number
  transaction_count: number
  average_amount: number
  current_month_total: number
  previous_month_total: number
  month_over_month_delta: number
  month_over_month_pct: number | null
}

interface BackendBreakdown {
  total_amount: number
  items: Array<{
    category_id: number
    category_name: string
    color: string
    total: number
    count: number
    pct_of_total: number
  }>
}

function mapSummary(summary: BackendSummary, breakdown?: BackendBreakdown): SpendingSummary {
  const mom = summary.month_over_month_pct ?? 0
  return {
    total_spent: summary.current_month_total || summary.total_amount,
    transaction_count: summary.transaction_count,
    avg_per_purchase: summary.average_amount,
    vs_last_month: {
      total_pct: mom,
      count_pct: 0,
      avg_pct: mom,
    },
    by_category: (breakdown?.items ?? []).map((item) => ({
      category: item.category_name,
      amount: item.total,
      percentage: item.pct_of_total,
      color: item.color,
    })),
  }
}

async function loginForToken(email: string, password: string): Promise<string> {
  const tokenRes = await request<{ access_token: string; token_type: string }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
    false,
  )
  return tokenRes.access_token
}

export const api = {
  async signUp(payload: {
    email: string
    password: string
    full_name: string
  }): Promise<AuthResponse> {
    try {
      await request<User>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(payload) },
        false,
      )
      const access_token = await loginForToken(payload.email, payload.password)
      localStorage.setItem(TOKEN_KEY, access_token)
      const user = await request<User>('/auth/me')
      return { access_token, token_type: 'bearer', user }
    } catch (err) {
      if (!isNetworkError(err)) throw err
      const user: User = {
        id: Date.now(),
        email: payload.email,
        full_name: payload.full_name || payload.email.split('@')[0],
      }
      return { access_token: `demo.${btoa(payload.email)}`, token_type: 'bearer', user }
    }
  },

  async signIn(payload: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const access_token = await loginForToken(payload.email, payload.password)
      localStorage.setItem(TOKEN_KEY, access_token)
      const user = await request<User>('/auth/me')
      return { access_token, token_type: 'bearer', user }
    } catch (err) {
      if (!isNetworkError(err)) throw err
      const name = payload.email.split('@')[0]
      const user: User = {
        id: 1,
        email: payload.email,
        full_name: name.charAt(0).toUpperCase() + name.slice(1) || MOCK_USER.full_name,
      }
      return { access_token: `demo.${btoa(payload.email)}`, token_type: 'bearer', user }
    }
  },

  async me(): Promise<User> {
    try {
      return await request<User>('/auth/me')
    } catch (err) {
      if (!isNetworkError(err)) throw err
      return getStoredUser() ?? MOCK_USER
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      return await request<Category[]>('/categories')
    } catch (err) {
      if (!isNetworkError(err)) throw err
      return DEFAULT_CATEGORIES
    }
  },

  async getTransactions(limit = 20): Promise<Transaction[]> {
    try {
      return await request<Transaction[]>(`/transactions?limit=${limit}`)
    } catch (err) {
      if (!isNetworkError(err)) throw err
      return loadDemoTx().slice(0, limit)
    }
  },

  async createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
    try {
      return await request<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err) {
      if (!isNetworkError(err)) throw err
      const categories = DEFAULT_CATEGORIES
      const category = categories.find((c) => c.id === payload.category_id) ?? categories[4]
      const tx: Transaction = {
        id: Date.now(),
        user_id: getStoredUser()?.id ?? 1,
        description: payload.description,
        amount: payload.amount,
        category_id: payload.category_id,
        category,
        date: payload.date,
        ml_predicted: Boolean(payload.ml_predicted),
        user_corrected: 0,
        confidence: payload.confidence ?? null,
      }
      const list = [tx, ...loadDemoTx()]
      saveDemoTx(list)
      return tx
    }
  },

  async updateTransactionCategory(
    id: number,
    category_id: number,
  ): Promise<Transaction> {
    try {
      return await request<Transaction>(`/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ category_id }),
      })
    } catch (err) {
      if (!isNetworkError(err)) throw err
      const list = loadDemoTx()
      const idx = list.findIndex((t) => t.id === id)
      if (idx === -1) throw new ApiError('Not found', 404)
      const category =
        DEFAULT_CATEGORIES.find((c) => c.id === category_id) ?? DEFAULT_CATEGORIES[4]
      list[idx] = {
        ...list[idx],
        category_id,
        category,
        user_corrected: 1,
      }
      saveDemoTx(list)
      return list[idx]
    }
  },

  async predict(description: string): Promise<PredictResponse> {
    try {
      return await request<PredictResponse>('/predict', {
        method: 'POST',
        body: JSON.stringify({ description }),
      })
    } catch (err) {
      if (!isNetworkError(err)) throw err
      return mockPredict(description)
    }
  },

  async getSummary(): Promise<SpendingSummary> {
    try {
      const [summary, breakdown] = await Promise.all([
        request<BackendSummary>('/analytics/summary'),
        request<BackendBreakdown>('/analytics/breakdown'),
      ])
      return mapSummary(summary, breakdown)
    } catch (err) {
      if (!isNetworkError(err)) throw err
      return MOCK_SUMMARY
    }
  },

  async getAnalytics(): Promise<MonthlyAnalytics> {
    try {
      return await request<MonthlyAnalytics>('/analytics/monthly')
    } catch (err) {
      if (!isNetworkError(err)) throw err
      return MOCK_ANALYTICS
    }
  },
}

export { ApiError, API_BASE }
