import type { BudgetCategory, BudgetItem, BudgetSummary } from '@/types'

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCostRange(min: number, max: number): string {
  if (min === max) return formatEur(min)
  return `€${min}–${max}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`))
}

export function tripDuration(start: string | null, end: string | null): number {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('')
}

export function calcBudgetSummary(items: BudgetItem[]): BudgetSummary {
  const byCategory = {} as Record<BudgetCategory, number>

  let total_estimated = 0
  let total_actual = 0

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount_eur

    if (item.is_actual) {
      total_actual += item.amount_eur
    } else {
      total_estimated += item.amount_eur
    }
  }

  return { total_estimated, total_actual, by_category: byCategory }
}

export function calcProgress(days: { is_done: boolean }[]): number {
  if (days.length === 0) return 0
  const done = days.filter(day => day.is_done).length
  return Math.round((done / days.length) * 100)
}
