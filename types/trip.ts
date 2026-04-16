export type Trip = {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  budget_eur: number
  is_template: boolean
  created_at: string
}

// used for the create form — omits server-generated fields
export type TripInsert = Omit<Trip, 'id' | 'created_at'>

// used for update — all fields optional except id
export type TripUpdate = Partial<TripInsert>
