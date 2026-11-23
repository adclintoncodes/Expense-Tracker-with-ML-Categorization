export function formatCurrency(amount: number, signed = false): string {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(abs)

  if (!signed) return formatted
  if (amount === 0) return formatted
  return amount < 0 || signed ? `-${formatted}` : formatted
}

export function formatNegativeExpense(amount: number): string {
  const value = Math.abs(amount)
  return `-${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)}`
}

export function formatPct(pct: number): string {
  const arrow = pct < 0 ? '↓' : '↑'
  return `${arrow} ${Math.abs(Math.round(pct))}% vs last month`
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'there'
}

export function initial(fullName: string): string {
  return (fullName.trim()[0] || '?').toUpperCase()
}
