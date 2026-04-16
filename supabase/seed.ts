import { createClient } from '@supabase/supabase-js'
import { getServerEnv, hasAdminApiKey } from '../lib/env'

const env = getServerEnv()

if (!hasAdminApiKey(env)) {
  throw new Error(
    'SUPABASE_SECRET_KEY is required to run the seed script. SUPABASE_SERVICE_ROLE_KEY remains supported as a temporary fallback.'
  )
}

const adminApiKey = env.SUPABASE_SECRET_KEY

if (!adminApiKey) {
  throw new Error(
    'SUPABASE_SECRET_KEY is required to run the seed script. SUPABASE_SERVICE_ROLE_KEY remains supported as a temporary fallback.'
  )
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  adminApiKey
)

async function seed() {
  console.log('Seeding database...')

  // ── 1. Insert trip ──────────────────────────────────────────────────────────
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      title: 'Germany & Eastern Europe 2026',
      destination: 'Munich → Prague → Vienna → Bratislava → Budapest → Cluj-Napoca → Bucharest',
      start_date: '2026-09-01',
      end_date: '2026-09-15',
      budget_eur: 1235,
      is_template: false,
    })
    .select('id')
    .single()

  if (tripError || !trip) {
    console.error('Trip insert failed:', tripError)
    process.exit(1)
  }

  const tripId = trip.id
  console.log('Trip created:', tripId)

  // ── 2. Insert days ──────────────────────────────────────────────────────────
  const days = [
    {
      day_number: 1, country_code: 'DE', city: 'Munich',
      transport: 'S-Bahn S1/S8 from MUC Airport — €13.40',
      stay: "Wombat's City Hostel Munich — Night 1",
      highlights: 'Arrive + Marienplatz walk, Viktualienmarkt dinner, easy first day setup.',
      cost_eur_min: 65, cost_eur_max: 95,
    },
    {
      day_number: 2, country_code: 'DE', city: 'Munich',
      transport: 'U-Bahn/Tram day pass ~€9.20',
      stay: "Wombat's City Hostel Munich — Night 2",
      highlights: 'Residenz area, Englischer Garten, BMW Welt (free), Hofbräuhaus evening.',
      cost_eur_min: 80, cost_eur_max: 115,
    },
    {
      day_number: 3, country_code: 'DE', city: 'Munich',
      transport: 'City transit + optional regional pass',
      stay: "Wombat's City Hostel Munich — Night 3",
      highlights: 'Final Munich day: museums/old town cafes, prep for Prague train.',
      cost_eur_min: 80, cost_eur_max: 120,
    },
    {
      day_number: 4, country_code: 'CZ', city: 'Prague',
      transport: 'Train ALEX/DB München HBF → Praha hl.n. ~5–6h | bahn.de €25–45',
      stay: 'Mosaic House Design Hostel — Night 4',
      highlights: 'Old Town Square, Astronomical Clock, Charles Bridge sunset.',
      cost_eur_min: 75, cost_eur_max: 110,
      book_by: 'Book 6–8 weeks before',
    },
    {
      day_number: 5, country_code: 'CZ', city: 'Prague',
      transport: 'Tram + Metro pass CZK 120/day or CZK 330/72h',
      stay: 'Mosaic House Design Hostel — Night 5',
      highlights: 'Prague Castle, St. Vitus, Lesser Town, river viewpoints.',
      cost_eur_min: 80, cost_eur_max: 120,
    },
    {
      day_number: 6, country_code: 'AT', city: 'Vienna',
      transport: 'Train RegioJet/ÖBB Prague → Vienna ~4h | €15–30',
      stay: "Wombat's City Hostel Vienna — Night 6",
      highlights: 'Stephansdom, Hofburg area, coffeehouse stop, early night for day trip.',
      cost_eur_min: 85, cost_eur_max: 120,
      book_by: 'Book 4–6 weeks before',
    },
    {
      day_number: 7, country_code: 'SK', city: 'Bratislava → Budapest',
      transport: 'Vienna → Bratislava train ~1h, then Bratislava → Budapest fast train ~2h20m',
      stay: 'Maverick City Lodge Budapest — Night 7',
      highlights: 'Bratislava Old Town + Castle photo points, then evening arrival in Budapest.',
      cost_eur_min: 85, cost_eur_max: 120,
      book_by: 'Book 2–3 weeks before',
      is_transfer: true,
    },
    {
      day_number: 8, country_code: 'HU', city: 'Budapest',
      transport: 'BKK 24h pass + Tram #2',
      stay: 'Maverick City Lodge — Night 8',
      highlights: 'Buda Castle side, Parliament riverbank, thermal bath or ruin bar.',
      cost_eur_min: 80, cost_eur_max: 120,
    },
    {
      day_number: 9, country_code: 'HU', city: 'Budapest',
      transport: 'City metro/tram + airport transfer prep',
      stay: 'Maverick City Lodge — Night 9',
      highlights: 'Second Budapest day: market hall, basilica, Danube sunset.',
      cost_eur_min: 80, cost_eur_max: 120,
    },
    {
      day_number: 10, country_code: 'RO', city: 'Cluj-Napoca',
      transport: 'Flight BUD → CLJ (fastest) ~1h20m | €30–85',
      stay: 'ZEN Hostel Cluj — Night 10',
      highlights: 'Piata Unirii, Central Park, local cafes. Currency: RON (Romanian Leu).',
      cost_eur_min: 80, cost_eur_max: 120,
      book_by: 'Book 4–8 weeks before',
      is_transfer: true,
    },
    {
      day_number: 11, country_code: 'RO', city: 'Bucharest',
      transport: 'Flight CLJ → OTP ~55m | €30–90',
      stay: 'Pura Vida Sky Bar & Hostel — Night 11',
      highlights: 'Lipscani Old Town, Stavropoleos, Calea Victoriei evening walk.',
      cost_eur_min: 85, cost_eur_max: 120,
      book_by: 'Book 2–6 weeks before',
      is_transfer: true,
    },
    {
      day_number: 12, country_code: 'RO', city: 'Bucharest',
      transport: 'Metro + bus + Bolt/Grab, local day pass options',
      stay: 'Pura Vida Sky Bar & Hostel — Night 12',
      highlights: 'Palace of Parliament tour, museums, neighborhood cafes, local food.',
      cost_eur_min: 80, cost_eur_max: 120,
    },
    {
      day_number: 13, country_code: 'RO', city: 'Bucharest (Flex)',
      transport: 'Optional rail/bus day trip to Sinaia or local transit only',
      stay: 'Plan flex night based on flight timing',
      highlights: 'Buffer day for weather, delayed connections, or optional day trip.',
      cost_eur_min: 70, cost_eur_max: 110,
    },
    {
      day_number: 14, country_code: 'RO', city: 'Bucharest (Flex)',
      transport: 'Airport transfer planning + local transit',
      stay: 'Plan flex night based on flight timing',
      highlights: 'Shopping, laundry, repacking, emergency spare day before departure.',
      cost_eur_min: 60, cost_eur_max: 100,
    },
    {
      day_number: 15, country_code: 'RO', city: 'Departure',
      transport: 'OTP airport transfer by train/bus/taxi, arrive 3h early',
      stay: '—',
      highlights: 'Departure day. Keep documents, tax receipts, and insurance details ready.',
      cost_eur_min: 20, cost_eur_max: 40,
    },
  ]

  const { error: daysError } = await supabase
    .from('days')
    .insert(days.map(d => ({ ...d, trip_id: tripId })))

  if (daysError) {
    console.error('Days insert failed:', daysError)
    process.exit(1)
  }
  console.log(`Inserted ${days.length} days`)

  // ── 3. Insert hotels ────────────────────────────────────────────────────────
  const hotels = [
    {
      country_code: 'DE', city: 'Munich',
      name: "Wombat's City Hostel Munich",
      price_min: 22, price_max: 35, rating: 4.6,
      notes: '2 min walk to HBF. Free WiFi, bar, lockers.',
      book_url: 'https://www.wombats-hostels.com/munich',
      is_selected: true,
    },
    {
      country_code: 'DE', city: 'Munich',
      name: 'Meininger Hotel Munich Central',
      price_min: 25, price_max: 40, rating: 4.5,
      notes: 'Sendlinger Tor — U-Bahn 2 stops to HBF. Kitchen available.',
      book_url: 'https://www.meininger-hotels.com',
      is_selected: false,
    },
    {
      country_code: 'CZ', city: 'Prague',
      name: 'Mosaic House Design Hostel',
      price_min: 18, price_max: 30, rating: 4.7,
      notes: 'Smichov — 15 min metro to Old Town. Eco-certified.',
      book_url: 'https://www.mosaichouse.com',
      is_selected: true,
    },
    {
      country_code: 'CZ', city: 'Prague',
      name: 'Hostel One Home',
      price_min: 16, price_max: 28, rating: 4.8,
      notes: 'Near Florenc bus station — best for connections.',
      book_url: 'https://www.hostelone.com/prague',
      is_selected: false,
    },
    {
      country_code: 'AT', city: 'Vienna',
      name: "Wombat's City Hostel Vienna",
      price_min: 24, price_max: 38, rating: 4.5,
      notes: 'Near Naschmarkt — U4 line, 10 min to center.',
      book_url: 'https://www.wombats-hostels.com/vienna',
      is_selected: false,
    },
    {
      country_code: 'AT', city: 'Vienna',
      name: 'do step inn Central Hostel',
      price_min: 22, price_max: 35, rating: 4.4,
      notes: 'Mariahilf — U3/U6 access, near museums.',
      book_url: 'https://www.dostepinn.com',
      is_selected: false,
    },
    {
      country_code: 'HU', city: 'Budapest',
      name: 'Maverick City Lodge',
      price_min: 18, price_max: 30, rating: 4.6,
      notes: 'Pest center — walk to Parliament + Chain Bridge. Very safe.',
      book_url: 'https://www.maverickbudapest.com',
      is_selected: true,
    },
    {
      country_code: 'HU', city: 'Budapest',
      name: 'Retox Party Hostel',
      price_min: 14, price_max: 25, rating: 4.3,
      notes: 'District VII — Ruin Bar zone. Social atmosphere.',
      book_url: 'https://www.retoxhostel.com',
      is_selected: false,
    },
    {
      country_code: 'RO', city: 'Cluj-Napoca',
      name: 'ZEN Hostel Cluj',
      price_min: 14, price_max: 24, rating: 4.5,
      notes: 'Central location near Piata Unirii, easy airport bus access.',
      book_url: 'https://www.booking.com/city/ro/cluj-napoca.html',
      is_selected: false,
    },
    {
      country_code: 'RO', city: 'Bucharest',
      name: 'Pura Vida Sky Bar & Hostel',
      price_min: 12, price_max: 20, rating: 4.6,
      notes: 'Old Town (Lipscani) — rooftop bar, excellent reviews.',
      book_url: 'https://www.puravida-hostel.com',
      is_selected: true,
    },
  ]

  const { error: hotelsError } = await supabase
    .from('hotels')
    .insert(hotels.map(h => ({ ...h, trip_id: tripId })))

  if (hotelsError) {
    console.error('Hotels insert failed:', hotelsError)
    process.exit(1)
  }
  console.log(`Inserted ${hotels.length} hotels`)

  // ── 4. Insert budget items ──────────────────────────────────────────────────
  const budgetItems = [
    { category: 'accommodation', label: 'Hostels (avg €22/night × 14)', amount_eur: 308, is_actual: false },
    { category: 'transport',     label: 'Intercity trains & buses',      amount_eur: 180, is_actual: false },
    { category: 'transport',     label: 'Flights within Europe',         amount_eur: 160, is_actual: false },
    { category: 'transport',     label: 'Local transit (daily passes)',   amount_eur: 85,  is_actual: false },
    { category: 'food',          label: 'Food & drinks (avg €25/day)',    amount_eur: 375, is_actual: false },
    { category: 'activities',    label: 'Museums & attractions',          amount_eur: 80,  is_actual: false },
    { category: 'misc',          label: 'SIM card & data',                amount_eur: 20,  is_actual: false },
    { category: 'misc',          label: 'Visa fee (Schengen)',            amount_eur: 90,  is_actual: false },
    { category: 'misc',          label: 'Emergency buffer',               amount_eur: 150, is_actual: false },
  ]

  const { error: budgetError } = await supabase
    .from('budget_items')
    .insert(budgetItems.map(b => ({ ...b, trip_id: tripId })))

  if (budgetError) {
    console.error('Budget insert failed:', budgetError)
    process.exit(1)
  }
  console.log(`Inserted ${budgetItems.length} budget items`)
  console.log('Seed complete! Trip ID:', tripId)
}

seed()
