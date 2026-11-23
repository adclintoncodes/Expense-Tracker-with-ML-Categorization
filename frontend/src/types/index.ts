export type CategoryName =
  | 'Food & Dining'
  | 'Shopping'
  | 'Groceries'
  | 'Transportation'
  | 'Other'

export interface User {
  id: number
  email: string
  full_name: string
}

export interface Category {
  id: number
  name: CategoryName | string
  color: string
  budget_limit: number | null
  icon: string | null
}

export interface Transaction {
  id: number
  user_id: number
  description: string
  amount: number
  category_id: number
  category?: Category
  date: string
  ml_predicted: boolean
  user_corrected: number
  confidence: number | null
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface PredictResponse {
  category: string
  category_id?: number
  confidence: number
}

export interface SpendingSummary {
  total_spent: number
  transaction_count: number
  avg_per_purchase: number
  vs_last_month: {
    total_pct: number
    count_pct: number
    avg_pct: number
  }
  by_category: Array<{
    category: string
    amount: number
    percentage: number
    color: string
  }>
}

export interface MonthlyAnalytics {
  month: string
  total: number
  by_category: Array<{
    category: string
    amount: number
    budget_limit: number | null
    color: string
  }>
  history: Array<{
    month: string
    total: number
  }>
}

export interface CreateTransactionPayload {
  description: string
  amount: number
  category_id: number
  date: string
  ml_predicted?: boolean
  confidence?: number | null
}
