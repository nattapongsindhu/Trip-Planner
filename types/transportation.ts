export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'other'

export type Transportation = {
  id: string
  trip_id: string
  type: TransportType
  from_location: string
  to_location: string
  date: string | null
  cost_usd: number | null
  notes: string | null
  created_at: string
}

export type TransportationInsert = Omit<Transportation, 'id' | 'created_at'>
export type TransportationUpdate = Pick<Transportation, 'id'> & Partial<Omit<Transportation, 'id' | 'trip_id' | 'created_at'>>
