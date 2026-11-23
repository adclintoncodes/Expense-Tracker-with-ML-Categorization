import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Palette, Shield, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition } from '../components/ui/PageTransition'
import { DEFAULT_CATEGORIES } from '../lib/categories'
import { formatCurrency } from '../lib/format'

export function Settings() {
  const { user, signOut } = useAuth()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [mlAuto, setMlAuto] = useState(true)
  const [currency, setCurrency] = useState('USD')

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Profile, preferences, and category budgets.
          </p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600" />
            <h2 className="font-display text-lg font-bold">Profile</h2>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">Name</dt>
              <dd className="font-semibold text-slate-900">{user?.full_name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="font-semibold text-slate-900">{user?.email}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={signOut}
            className="mt-5 rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            Sign Out
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card space-y-4 p-5 sm:p-6"
        >
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand-600" />
            <h2 className="font-display text-lg font-bold">Preferences</h2>
          </div>

          <Toggle
            label="Budget email alerts"
            description="Get notified when a category hits 80% of its limit."
            checked={emailAlerts}
            onChange={setEmailAlerts}
          />
          <Toggle
            label="ML auto-categorize"
            description="Suggest a category as you type expense descriptions."
            checked={mlAuto}
            onChange={setMlAuto}
          />

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Palette className="h-4 w-4 text-brand-600" />
              Display currency
            </span>
            <select
              className="input-field max-w-xs"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </label>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600" />
            <h2 className="font-display text-lg font-bold">Category budgets</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {DEFAULT_CATEGORIES.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
                <span className="font-semibold text-slate-600">
                  {c.budget_limit != null ? formatCurrency(c.budget_limit) : '—'}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            Budget editing will sync to the backend once the categories API supports PATCH.
          </p>
        </motion.section>
      </div>
    </PageTransition>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-brand-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
