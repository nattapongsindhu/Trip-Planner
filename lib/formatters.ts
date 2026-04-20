// Pure utility functions — all testable with Vitest, no side effects

// Formats a number as a USD currency string
// formatUsd(1235) → "$1,235"
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Displays a daily cost as a range string
// formatCostRange(65, 95) → "$65–$95"
export function formatCostRange(min: number, max: number): string {
  if (min === max) return formatUsd(min)
  return formatUsd(min)+'–'+formatUsd(max)
}

// Formats an ISO date string into a human-readable label
// formatDate("2026-09-01") → "1 Sep 2026"
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Returns the number of calendar days between two date strings
// tripDuration("2026-09-01", "2026-09-15") → 14
export function tripDuration(start: string | null, end: string | null): number {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

// Converts a 2-letter ISO country code to a flag emoji
// countryFlag("DE") → "🇩🇪"
export function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

// Aggregates budget items into a summary object
// Groups by category and separates estimated vs actual totals
import type { BudgetItem, BudgetSummary, BudgetCategory } from '@/types'

export function calcBudgetSummary(items: BudgetItem[]): BudgetSummary {
  const byCategory = {} as Record<BudgetCategory, number>

  let total_estimated = 0
  let total_actual = 0

  for (const item of items) {
    // accumulate per category using the item amount
    byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount_eur

    if (item.is_actual) {
      total_actual += item.amount_eur
    } else {
      total_estimated += item.amount_eur
    }
  }

  return { total_estimated, total_actual, by_category: byCategory }
}

// Returns trip completion as a percentage between 0 and 100
// calcProgress([{ is_done: true }, { is_done: false }]) → 50
export function calcProgress(days: { is_done: boolean }[]): number {
  if (days.length === 0) return 0
  const done = days.filter(d => d.is_done).length
  return Math.round((done / days.length) * 100)
}
