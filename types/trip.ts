export type Trip = {
  id: string
  user_id: string | null
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  budget_usd: number
  is_template: boolean
  is_public: boolean
  note: string | null
  created_at: string
}

// used for the create form — omits server-generated fields and user_id (stamped server-side)
export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'user_id'>

// used for update — all fields optional except id
export type TripUpdate = Partial<TripInsert>
