import { describe, expect, it } from 'vitest'
import {
  calcBudgetSummary,
  calcProgress,
  countryFlag,
  formatCostRange,
  formatDate,
  formatEur,
  tripDuration,
} from './formatters'

describe('formatEur', () => {
  it('formats a whole number correctly', () => {
    expect(formatEur(1235)).toContain('1,235')
  })

  it('formats zero', () => {
    expect(formatEur(0)).toContain('0')
  })
})

describe('formatCostRange', () => {
  it('shows a range when min and max differ', () => {
    expect(formatCostRange(65, 95)).toBe('EUR 65-95')
  })

  it('shows a single value when min equals max', () => {
    expect(formatCostRange(80, 80)).toContain('80')
  })

  it('returns a placeholder when both values are missing', () => {
    expect(formatCostRange(null, undefined)).toBe('-')
  })
})

describe('tripDuration', () => {
  it('returns 14 for a 15-day trip', () => {
    expect(tripDuration('2026-09-01', '2026-09-15')).toBe(14)
  })

  it('returns 0 when dates are null', () => {
    expect(tripDuration(null, null)).toBe(0)
  })
})

describe('formatDate', () => {
  it('formats an ISO date string for display without timezone drift', () => {
    expect(formatDate('2026-09-01')).toBe('1 Sept 2026')
  })

  it('returns a placeholder when the date is missing', () => {
    expect(formatDate(null)).toBe('-')
  })
})

describe('countryFlag', () => {
  it('converts DE to the German flag emoji', () => {
    expect(countryFlag('DE')).toBe('🇩🇪')
  })

  it('converts TH to the Thai flag emoji', () => {
    expect(countryFlag('TH')).toBe('🇹🇭')
  })

  it('falls back when the code is missing', () => {
    expect(countryFlag(null)).toBe('??')
  })
})

describe('calcBudgetSummary', () => {
  const items = [
    {
      id: '1',
      trip_id: 't1',
      category: 'accommodation' as const,
      label: 'Hostel',
      amount_eur: 308,
      is_actual: false,
    },
    {
      id: '2',
      trip_id: 't1',
      category: 'transport' as const,
      label: 'Train',
      amount_eur: 180,
      is_actual: false,
    },
    {
      id: '3',
      trip_id: 't1',
      category: 'food' as const,
      label: 'Food',
      amount_eur: 100,
      is_actual: true,
    },
  ]

  it('sums estimated items correctly', () => {
    expect(calcBudgetSummary(items).total_estimated).toBe(488)
  })

  it('sums actual items correctly', () => {
    expect(calcBudgetSummary(items).total_actual).toBe(100)
  })

  it('groups amounts by category', () => {
    expect(calcBudgetSummary(items).by_category.accommodation).toBe(308)
  })
})

describe('calcProgress', () => {
  it('returns 0 when no days are done', () => {
    expect(calcProgress([{ is_done: false }, { is_done: false }])).toBe(0)
  })

  it('returns 100 when all days are done', () => {
    expect(calcProgress([{ is_done: true }, { is_done: true }])).toBe(100)
  })

  it('returns 50 when half the days are done', () => {
    expect(calcProgress([{ is_done: true }, { is_done: false }])).toBe(50)
  })

  it('returns 0 for an empty array', () => {
    expect(calcProgress([])).toBe(0)
  })
})
