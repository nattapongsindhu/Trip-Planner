export type BudgetItem = {
  id:           string
  trip_id:      string
  category:     string            // 'Transport', 'Food & drinks', etc.
  label:        string
  estimate_eur: number | null
  actual_eur:   number | null
  created_at:   string
}
