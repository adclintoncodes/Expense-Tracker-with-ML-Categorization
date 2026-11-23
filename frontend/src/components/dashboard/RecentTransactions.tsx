import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'
import { getCategoryMeta } from '../../lib/categories'
import { formatNegativeExpense, formatShortDate } from '../../lib/format'
import type { Category, Transaction } from '../../types'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  onCategoryChange: (id: number, categoryId: number) => void
}

export function RecentTransactions({
  transactions,
  categories,
  onCategoryChange,
}: Props) {
  const items = transactions.slice(0, 6)

  return (
    <section className="card h-full p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            Recent Transactions
          </h2>
        </div>
        <Link
          to="/analytics"
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          View All →
        </Link>
      </div>

      <ul className="divide-y divide-slate-100">
        {items.map((tx, i) => {
          const name = tx.category?.name ?? categories.find((c) => c.id === tx.category_id)?.name ?? 'Other'
          const meta = getCategoryMeta(name)
          const Icon = meta.icon
          return (
            <motion.li
              key={tx.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.35 }}
              className="flex items-center gap-3 py-3.5 first:pt-1"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: meta.soft, color: meta.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{tx.description}</p>
                  {tx.ml_predicted && (
                    <span
                      className="inline-flex items-center gap-0.5 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600"
                      title={
                        tx.confidence != null
                          ? `ML ${Math.round(tx.confidence * 100)}%`
                          : 'ML predicted'
                      }
                    >
                      <Sparkles className="h-3 w-3" />
                      ML
                    </span>
                  )}
                </div>
                <select
                  className="mt-0.5 max-w-full cursor-pointer rounded-md border-0 bg-transparent py-0 pl-0 pr-6 text-xs font-medium text-slate-500 outline-none hover:text-brand-600 focus:ring-0"
                  value={tx.category_id}
                  onChange={(e) => onCategoryChange(tx.id, Number(e.target.value))}
                  aria-label={`Change category for ${tx.description}`}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-500">
                  {formatNegativeExpense(tx.amount)}
                </p>
                <p className="text-xs text-slate-400">{formatShortDate(tx.date)}</p>
              </div>
            </motion.li>
          )
        })}
        {items.length === 0 && (
          <li className="py-8 text-center text-sm text-slate-400">
            No transactions yet. Add your first expense!
          </li>
        )}
      </ul>
    </section>
  )
}
