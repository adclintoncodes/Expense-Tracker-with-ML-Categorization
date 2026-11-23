import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { api } from '../../lib/api'
import { getCategoryMeta } from '../../lib/categories'
import { todayISO } from '../../lib/format'
import { useDebounce } from '../../hooks/useDebounce'
import type { Category } from '../../types'

interface Props {
  categories: Category[]
  onCreated: () => void
}

export function AddExpenseForm({ categories, onCreated }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 1)
  const [date, setDate] = useState(todayISO())
  const [submitting, setSubmitting] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [mlMeta, setMlMeta] = useState<{ confidence: number | null; predicted: boolean }>({
    confidence: null,
    predicted: false,
  })
  const [error, setError] = useState<string | null>(null)

  const debouncedDescription = useDebounce(description.trim(), 450)

  useEffect(() => {
    if (categories.length && !categories.find((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (debouncedDescription.length < 2) {
        setMlMeta({ confidence: null, predicted: false })
        return
      }
      setPredicting(true)
      try {
        const res = await api.predict(debouncedDescription)
        if (cancelled) return
        const match =
          categories.find(
            (c) =>
              c.name.toLowerCase() === res.category.toLowerCase() ||
              c.id === res.category_id,
          ) ?? categories.find((c) => c.name === res.category)
        if (match) setCategoryId(match.id)
        setMlMeta({ confidence: res.confidence, predicted: true })
      } catch {
        if (!cancelled) setMlMeta({ confidence: null, predicted: false })
      } finally {
        if (!cancelled) setPredicting(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [debouncedDescription, categories])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = Number.parseFloat(amount)
    if (!description.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setError('Enter a description and a valid amount.')
      return
    }
    setSubmitting(true)
    try {
      await api.createTransaction({
        description: description.trim(),
        amount: parsed,
        category_id: categoryId,
        date,
        ml_predicted: mlMeta.predicted,
        confidence: mlMeta.confidence,
      })
      setDescription('')
      setAmount('')
      setDate(todayISO())
      setMlMeta({ confidence: null, predicted: false })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  const selected = categories.find((c) => c.id === categoryId)

  return (
    <section className="card h-full p-5 sm:p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-slate-900">+ Add Expense</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">Description</span>
          <div className="relative">
            <input
              className="input-field pr-10"
              placeholder="e.g. Starbucks, Amazon..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {(predicting || mlMeta.predicted) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500">
                {predicting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
          {mlMeta.predicted && mlMeta.confidence != null && (
            <p className="mt-1 text-[11px] font-medium text-brand-600">
              ML suggested {selected?.name} ({Math.round(mlMeta.confidence * 100)}% confidence)
            </p>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">Amount ($)</span>
          <input
            className="input-field"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">Category</span>
          <select
            className="input-field"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(Number(e.target.value))
              setMlMeta((m) => ({ ...m, predicted: false }))
            }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {selected && (
            <span
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: getCategoryMeta(selected.name).soft,
                color: getCategoryMeta(selected.name).color,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getCategoryMeta(selected.name).color }}
              />
              {selected.name}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">Date</span>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <button type="submit" className="btn-primary mt-1" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Add Expense
        </button>
      </form>
    </section>
  )
}
