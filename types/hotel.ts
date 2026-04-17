export type Hotel = {
  id:           string
  trip_id:      string
  country_code: string   // 2-letter ISO
  city:         string
  name:         string
  price_range:  string | null   // free-text: '€22–35/night'
  rating:       string | null   // free-text: '4.6★'
  notes:        string | null
  booking_url:  string | null
  selected:     boolean           // is this the chosen hotel for the city
  created_at:   string
}
