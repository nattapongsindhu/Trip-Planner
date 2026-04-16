export type Day = {
  id: string
  trip_id: string
  day_number: number
  city: string
  country_code: string
  highlights: string | null
  transport: string | null
  stay: string | null
  cost_eur_min: number
  cost_eur_max: number
  note: string | null
  is_done: boolean
  book_by: string | null
  is_transfer: boolean
}

// partial update type — id is required, everything else optional
export type DayUpdate = Pick<Day, 'id'> &
  Partial<Pick<Day, 'note' | 'is_done' | 'city' | 'highlights' | 'transport' | 'stay'>>
