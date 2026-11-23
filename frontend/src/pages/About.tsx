import { motion } from 'framer-motion'
import { Brain, PieChart, ShieldCheck, Sparkles } from 'lucide-react'
import { PageTransition } from '../components/ui/PageTransition'

const features = [
  {
    icon: Brain,
    title: 'ML categorization',
    body: 'Descriptions are classified into Food, Shopping, Groceries, Transit, and more — with confidence scores you can override.',
  },
  {
    icon: PieChart,
    title: 'Clear visuals',
    body: 'Donut breakdowns, budget bars, and monthly trends keep spending patterns obvious at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, locked down',
    body: 'JWT-protected routes keep the dashboard private. Sign out anytime from the sidebar or Settings.',
  },
]

export function About() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Expense Tracker
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            About
          </h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            Expense Tracker helps you record purchases, auto-categorize them with machine
            learning, and understand where money goes — without spreadsheet chaos.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className="card p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-base font-bold text-slate-900">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.body}</p>
              </motion.article>
            )
          })}
        </div>

        <section className="card overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:p-8">
          <h2 className="font-display text-xl font-bold">Track smart. Spend better.</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
            Built with React, Vite, Tailwind, Recharts, and a FastAPI + PostgreSQL backend.
            Category predictions call <code className="rounded bg-white/15 px-1.5 py-0.5 text-xs">POST /api/predict</code>{' '}
            as you type.
          </p>
        </section>
      </div>
    </PageTransition>
  )
}
