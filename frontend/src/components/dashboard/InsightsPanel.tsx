import { Lightbulb, Star, TrendingDown } from 'lucide-react'
import type { SpendingSummary } from '../../types'
import { PiggyBank } from './PiggyBank'

export function InsightsPanel({ summary }: { summary: SpendingSummary }) {
  const saved = summary.vs_last_month.total_pct < 0
  const pct = Math.abs(Math.round(summary.vs_last_month.total_pct))
  const topCategory =
    [...summary.by_category].sort((a, b) => b.amount - a.amount)[0]?.category ??
    'Food & Dining'

  return (
    <section className="card relative h-full overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h2 className="font-display text-lg font-bold text-slate-900">Insights</h2>
      </div>

      <div className="relative z-10 max-w-[75%] space-y-4">
        <div
          className={`flex gap-3 rounded-xl px-3.5 py-3 ${
            saved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
          }`}
        >
          <TrendingDown
            className={`mt-0.5 h-5 w-5 shrink-0 ${saved ? 'text-emerald-600' : 'text-amber-600'}`}
          />
          <p className="text-sm font-medium leading-relaxed">
            {saved
              ? `You're spending ${pct}% less this month compared to last month!`
              : `You're spending ${pct}% more this month compared to last month.`}
          </p>
        </div>

        <div className="flex gap-2.5">
          <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">Tip:</span> Try cooking at
            home more often to save on {topCategory.toLowerCase()} costs.
          </p>
        </div>
      </div>

      <PiggyBank className="pointer-events-none absolute -bottom-2 -right-2 h-36 w-40 opacity-95 sm:h-40 sm:w-44" />
    </section>
  )
}
