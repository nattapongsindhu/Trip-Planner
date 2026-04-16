import type { BudgetCategory, BudgetItem, BudgetSummary } from '@/types'

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export function formatEur(amount: unknown): string {
  const safeAmount = toFiniteNumber(amount) ?? 0

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount)
}

export function formatCostRange(min: unknown, max: unknown): string {
  const safeMin = toFiniteNumber(min)
  const safeMax = toFiniteNumber(max)

  if (safeMin == null && safeMax == null) return '-'
  if (safeMin != null && safeMax == null) return formatEur(safeMin)
  if (safeMin == null && safeMax != null) return formatEur(safeMax)
  if (safeMin === safeMax) return formatEur(safeMin)

  return `EUR ${safeMin}-${safeMax}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'

  const date = new Date(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function tripDuration(start: string | null, end: string | null): number {
  if (!start || !end) return 0

  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 0

  const diff = endTime - startTime
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function countryFlag(code: string | null | undefined): string {
  if (typeof code !== 'string') return '??'

  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return '??'

  return normalized
    .split('')
    .map(char => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('')
}

export function calcBudgetSummary(items: BudgetItem[]): BudgetSummary {
  const byCategory = {} as Record<BudgetCategory, number>

  let total_estimated = 0
  let total_actual = 0

  for (const item of items) {
    const amount = toFiniteNumber(item.amount_eur) ?? 0

    byCategory[item.category] = (byCategory[item.category] ?? 0) + amount

    if (item.is_actual) {
      total_actual += amount
    } else {
      total_estimated += amount
    }
  }

  return { total_estimated, total_actual, by_category: byCategory }
}

export function calcProgress(days: { is_done: boolean }[]): number {
  if (days.length === 0) return 0
  const done = days.filter(day => day.is_done).length
  return Math.round((done / days.length) * 100)
}
