import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart as PieIcon } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { SpendingSummary } from '../../types'
import { formatCurrency } from '../../lib/format'

export function SpendingBreakdown({ summary }: { summary: SpendingSummary }) {
  const [period, setPeriod] = useState('This Month')
  const data = useMemo(
    () =>
      summary.by_category.map((c) => ({
        name: c.category,
        value: c.amount,
        percentage: c.percentage,
        color: c.color,
      })),
    [summary],
  )

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="card h-full p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            Spending Breakdown
          </h2>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-brand-300"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
        <div className="relative h-52 w-52 shrink-0 sm:h-56 sm:w-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={3}
                strokeWidth={0}
                animationBegin={100}
                animationDuration={900}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-xl font-bold text-slate-900">
              {formatCurrency(summary.total_spent)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Total Spent
            </p>
          </div>
        </div>

        <ul className="w-full flex-1 space-y-3">
          {data.map((item) => (
            <li key={item.name} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 font-medium text-slate-700">{item.name}</span>
              <span className="w-10 text-right text-slate-400">{item.percentage}%</span>
              <span className="w-16 text-right font-semibold text-slate-800">
                {formatCurrency(item.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
