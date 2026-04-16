export type Hotel = {
  id: string
  trip_id: string
  city: string
  country_code: string
  name: string
  price_min: number | null
  price_max: number | null
  rating: number | null
  notes: string | null
  book_url: string | null
  is_selected: boolean
}

export type HotelInsert = Omit<Hotel, 'id'>
export type HotelUpdate = Pick<Hotel, 'id'> & Partial<Omit<Hotel, 'id' | 'trip_id'>>
