import { motion } from 'framer-motion'
import { CalendarDays, ShoppingCart, Wallet } from 'lucide-react'
import type { SpendingSummary } from '../../types'
import { formatCurrency, formatPct } from '../../lib/format'

const cards = [
  {
    key: 'total' as const,
    label: 'Total Spent',
    icon: Wallet,
    getValue: (s: SpendingSummary) => formatCurrency(s.total_spent),
    getPct: (s: SpendingSummary) => s.vs_last_month.total_pct,
  },
  {
    key: 'count' as const,
    label: 'Transactions',
    icon: ShoppingCart,
    getValue: (s: SpendingSummary) => String(s.transaction_count),
    getPct: (s: SpendingSummary) => s.vs_last_month.count_pct,
  },
  {
    key: 'avg' as const,
    label: 'Avg. per Purchase',
    icon: CalendarDays,
    getValue: (s: SpendingSummary) => formatCurrency(s.avg_per_purchase),
    getPct: (s: SpendingSummary) => s.vs_last_month.avg_pct,
  },
]

export function KpiCards({ summary }: { summary: SpendingSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        const pct = card.getPct(summary)
        const down = pct < 0
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
            className="card flex items-start gap-4 p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
                {card.getValue(summary)}
              </p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  down ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {formatPct(pct)}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
