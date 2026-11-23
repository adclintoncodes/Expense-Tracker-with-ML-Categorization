import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { firstName, initial } from '../lib/format'
import { PageTransition } from '../components/ui/PageTransition'
import { KpiCards } from '../components/dashboard/KpiCards'
import { SpendingBreakdown } from '../components/dashboard/SpendingBreakdown'
import { AddExpenseForm } from '../components/dashboard/AddExpenseForm'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { InsightsPanel } from '../components/dashboard/InsightsPanel'
import type { Category, SpendingSummary, Transaction } from '../types'
import { MOCK_SUMMARY } from '../lib/mockData'
import { DEFAULT_CATEGORIES } from '../lib/categories'

export function Home() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<SpendingSummary>(MOCK_SUMMARY)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [sum, txs, cats] = await Promise.all([
        api.getSummary(),
        api.getTransactions(20),
        api.getCategories(),
      ])
      setSummary(sum)
      setTransactions(txs)
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleCategoryChange(id: number, categoryId: number) {
    const updated = await api.updateTransactionCategory(id, categoryId)
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)))
  }

  const name = firstName(user?.full_name || 'there')

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Hello, {name}!
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Here&apos;s your spending overview this month.
            </p>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-bold text-white shadow-soft"
            aria-label="Profile"
          >
            {initial(user?.full_name || 'C')}
          </div>
        </header>

        {loading && transactions.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-28 animate-pulse bg-white/70" />
            ))}
          </div>
        ) : (
          <KpiCards summary={summary} />
        )}

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SpendingBreakdown summary={summary} />
          </div>
          <div className="lg:col-span-2">
            <AddExpenseForm categories={categories} onCreated={() => void refresh()} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecentTransactions
              transactions={transactions}
              categories={categories}
              onCategoryChange={(id, catId) => void handleCategoryChange(id, catId)}
            />
          </div>
          <div className="lg:col-span-2">
            <InsightsPanel summary={summary} />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
