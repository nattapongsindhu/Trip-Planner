// Day record — matches supabase `days` table after migration 004
// All fields editable. country_code is 2-letter ISO (e.g. 'DE', 'CZ')
export type Day = {
  id:           string
  trip_id:      string
  day_number:   number         // 1, 2, 3... (display order)
  country_code: string         // 'DE', 'CZ' etc.
  city:         string
  stay:         string | null  // hotel name or 'Wombat's Munich — Night 1'
  transport:    string | null  // how to get here
  highlights:   string | null  // what to do
  cost_range:   string | null  // '€65–95' (free-text, not strict)
  notes:        string | null  // private notes
  done:         boolean
  created_at:   string
}

export type DayInsert = Omit<Day, 'id' | 'created_at' | 'done'> & { done?: boolean }
export type DayUpdate = Partial<Omit<Day, 'id' | 'trip_id' | 'created_at'>>
