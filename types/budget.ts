export type BudgetCategory =
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'activities'
  | 'misc'

export type BudgetItem = {
  id: string
  trip_id: string
  category: BudgetCategory
  label: string
  amount_eur: number
  is_actual: boolean // false = estimate, true = actual spent
}

export type BudgetInsert = Omit<BudgetItem, 'id'>

// client-side computed summary — not stored in the database
export type BudgetSummary = {
  total_estimated: number
  total_actual: number
  by_category: Record<BudgetCategory, number>
}
