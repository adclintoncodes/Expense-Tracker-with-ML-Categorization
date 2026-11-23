import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'framer-motion'
import { Target, Wallet, Zap } from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/format'
import { PageTransition } from '../components/ui/PageTransition'
import { FlipCard } from '../components/ui/FlipCard'
import type { MonthlyAnalytics } from '../types'
import { MOCK_ANALYTICS } from '../lib/mockData'

export function Analytics() {
  const [data, setData] = useState<MonthlyAnalytics>(MOCK_ANALYTICS)

  useEffect(() => {
    void api.getAnalytics().then(setData)
  }, [])

  const budgetRows = data.by_category.map((c) => ({
    ...c,
    pct: c.budget_limit ? Math.min(100, Math.round((c.amount / c.budget_limit) * 100)) : 0,
    remaining: c.budget_limit != null ? Math.max(0, c.budget_limit - c.amount) : null,
  }))

  const top = budgetRows.reduce(
    (a, b) => (b.amount > a.amount ? b : a),
    budgetRows[0] ?? { category: '—', amount: 0, budget_limit: 0, color: '#800020', pct: 0, remaining: 0 },
  )

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monthly spending vs category budget limits — flip cards for details.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <FlipCard
            front={
              <div className="pr-8">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Month total</p>
                <p className="mt-1 font-display text-3xl font-bold text-slate-900">
                  {formatCurrency(data.total)}
                </p>
                <p className="mt-2 text-xs text-slate-400">Tap flip for trend context</p>
              </div>
            }
            back={
              <div className="pr-8">
                <p className="text-sm font-semibold text-pink-100">Trend</p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  November is tracking {formatCurrency(data.total)} — about{' '}
                  {formatCurrency(
                    Math.abs(
                      (data.history.at(-2)?.total ?? data.total) - data.total,
                    ),
                  )}{' '}
                  {(data.history.at(-2)?.total ?? 0) > data.total ? 'under' : 'over'} last
                  month.
                </p>
              </div>
            }
          />

          <FlipCard
            front={
              <div className="pr-8">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Top category</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">
                  {top.category}
                </p>
                <p className="mt-2 text-sm font-semibold" style={{ color: top.color }}>
                  {formatCurrency(top.amount)}
                </p>
              </div>
            }
            back={
              <div className="pr-8">
                <p className="text-sm font-semibold text-pink-100">Budget pulse</p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  {top.budget_limit != null
                    ? `You've used ${top.pct}% of the ${formatCurrency(top.budget_limit)} ${top.category} budget.`
                    : 'No budget set for this category yet.'}
                </p>
              </div>
            }
          />

          <FlipCard
            front={
              <div className="pr-8">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Budgets on track</p>
                <p className="mt-1 font-display text-3xl font-bold text-slate-900">
                  {budgetRows.filter((r) => r.pct < 90).length}/{budgetRows.length}
                </p>
                <p className="mt-2 text-xs text-slate-400">Under 90% of limit</p>
              </div>
            }
            back={
              <div className="pr-8">
                <p className="text-sm font-semibold text-pink-100">Watch list</p>
                <ul className="mt-2 space-y-1 text-sm text-white/90">
                  {budgetRows
                    .filter((r) => r.pct >= 80)
                    .map((r) => (
                      <li key={r.category}>
                        {r.category}: {r.pct}%
                      </li>
                    ))}
                  {budgetRows.every((r) => r.pct < 80) && <li>All categories look healthy.</li>}
                </ul>
              </div>
            }
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-6"
          >
            <h2 className="mb-4 font-display text-lg font-bold text-slate-900">
              Spending vs budget
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetRows.map((r) => ({
                    name: r.category.replace(' & Dining', '').replace('Transportation', 'Transit'),
                    spent: r.amount,
                    budget: r.budget_limit ?? 0,
                    fill: r.color,
                  }))}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" radius={[6, 6, 0, 0]}>
                    {budgetRows.map((r) => (
                      <Cell key={r.category} fill={r.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 sm:p-6"
          >
            <h2 className="mb-4 font-display text-lg font-bold text-slate-900">
              6-month trend
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#800020"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#800020' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </div>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-900">
            Category budget progress
          </h2>
          <ul className="space-y-4">
            {budgetRows.map((row, i) => (
              <motion.li
                key={row.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{row.category}</span>
                  <span className="text-slate-500">
                    {formatCurrency(row.amount)}
                    {row.budget_limit != null && (
                      <span className="text-slate-400"> / {formatCurrency(row.budget_limit)}</span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${row.budget_limit ? row.pct : 40}%`,
                      backgroundColor: row.color,
                    }}
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        </section>
      </div>
    </PageTransition>
  )
}
