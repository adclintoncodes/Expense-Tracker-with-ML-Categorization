import type { MonthlyAnalytics, SpendingSummary, Transaction, User } from '../types'
import { DEFAULT_CATEGORIES } from './categories'

export const MOCK_USER: User = {
  id: 1,
  email: 'clinton@example.com',
  full_name: 'Clinton',
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    user_id: 1,
    description: 'Starbucks',
    amount: 6.5,
    category_id: 1,
    category: DEFAULT_CATEGORIES[0],
    date: '2026-11-23',
    ml_predicted: true,
    user_corrected: 0,
    confidence: 0.94,
  },
  {
    id: 2,
    user_id: 1,
    description: 'Target',
    amount: 45.2,
    category_id: 2,
    category: DEFAULT_CATEGORIES[1],
    date: '2026-11-22',
    ml_predicted: true,
    user_corrected: 0,
    confidence: 0.88,
  },
  {
    id: 3,
    user_id: 1,
    description: "Trader Joe's",
    amount: 67.8,
    category_id: 3,
    category: DEFAULT_CATEGORIES[2],
    date: '2026-11-21',
    ml_predicted: false,
    user_corrected: 0,
    confidence: null,
  },
  {
    id: 4,
    user_id: 1,
    description: 'Uber',
    amount: 18.4,
    category_id: 4,
    category: DEFAULT_CATEGORIES[3],
    date: '2026-11-20',
    ml_predicted: true,
    user_corrected: 0,
    confidence: 0.91,
  },
  {
    id: 5,
    user_id: 1,
    description: 'Chipotle',
    amount: 14.75,
    category_id: 1,
    category: DEFAULT_CATEGORIES[0],
    date: '2026-11-19',
    ml_predicted: true,
    user_corrected: 0,
    confidence: 0.86,
  },
  {
    id: 6,
    user_id: 1,
    description: 'Amazon',
    amount: 32.99,
    category_id: 2,
    category: DEFAULT_CATEGORIES[1],
    date: '2026-11-18',
    ml_predicted: true,
    user_corrected: 1,
    confidence: 0.72,
  },
  {
    id: 7,
    user_id: 1,
    description: 'Whole Foods',
    amount: 54.3,
    category_id: 3,
    category: DEFAULT_CATEGORIES[2],
    date: '2026-11-17',
    ml_predicted: true,
    user_corrected: 0,
    confidence: 0.9,
  },
  {
    id: 8,
    user_id: 1,
    description: 'Gas Station',
    amount: 42.0,
    category_id: 4,
    category: DEFAULT_CATEGORIES[3],
    date: '2026-11-16',
    ml_predicted: false,
    user_corrected: 0,
    confidence: null,
  },
]

export const MOCK_SUMMARY: SpendingSummary = {
  total_spent: 428.5,
  transaction_count: 18,
  avg_per_purchase: 23.8,
  vs_last_month: {
    total_pct: -12,
    count_pct: 2,
    avg_pct: -8,
  },
  by_category: [
    { category: 'Food & Dining', amount: 145.2, percentage: 34, color: '#800020' },
    { category: 'Shopping', amount: 98.5, percentage: 23, color: '#EC4899' },
    { category: 'Groceries', amount: 112.3, percentage: 26, color: '#F97316' },
    { category: 'Transportation', amount: 48.0, percentage: 11, color: '#8B5CF6' },
    { category: 'Other', amount: 24.5, percentage: 6, color: '#3B82F6' },
  ],
}

export const MOCK_ANALYTICS: MonthlyAnalytics = {
  month: '2026-11',
  total: 428.5,
  by_category: DEFAULT_CATEGORIES.map((c) => {
    const spent =
      MOCK_SUMMARY.by_category.find((b) => b.category === c.name)?.amount ?? 0
    return {
      category: c.name,
      amount: spent,
      budget_limit: c.budget_limit,
      color: c.color,
    }
  }),
  history: [
    { month: 'Jun', total: 510 },
    { month: 'Jul', total: 480 },
    { month: 'Aug', total: 540 },
    { month: 'Sep', total: 460 },
    { month: 'Oct', total: 487 },
    { month: 'Nov', total: 428.5 },
  ],
}

const PREDICT_RULES: Array<{ pattern: RegExp; category: string; confidence: number }> = [
  { pattern: /starbucks|coffee|chipotle|restaurant|dining|pizza|cafe/i, category: 'Food & Dining', confidence: 0.93 },
  { pattern: /amazon|target|nike|mall|store|clothing/i, category: 'Shopping', confidence: 0.89 },
  { pattern: /trader|whole foods|grocery|costco|kroger|safeway/i, category: 'Groceries', confidence: 0.91 },
  { pattern: /uber|lyft|gas|shell|parking|transit|metro/i, category: 'Transportation', confidence: 0.9 },
]

export function mockPredict(description: string) {
  const hit = PREDICT_RULES.find((r) => r.pattern.test(description))
  if (hit) {
    const cat = DEFAULT_CATEGORIES.find((c) => c.name === hit.category)!
    return { category: hit.category, category_id: cat.id, confidence: hit.confidence }
  }
  return { category: 'Other', category_id: 5, confidence: 0.55 }
}
