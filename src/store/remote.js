import { supabase } from '../lib/supabase.js'

/* ============================================================
   SUPABASE ADAPTER

   Everything that knows about table and column names lives here, so
   DataContext keeps working in the app's own vocabulary and the two
   naming schemes never leak into each other.

   The app says `date` and `at`; the database says `event_date` and
   `created_at`. Mapping both ways is this file's whole job.
   ============================================================ */

const rowToLead = (r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  date: r.event_date ?? '',
  message: r.message ?? '',
  status: r.status,
  at: new Date(r.created_at).getTime(),
})

const rowToBooking = (r) => ({
  id: r.id,
  date: r.event_date,
  client: r.client,
  phone: r.phone ?? '',
  status: r.status,
  guests: r.guests,
  contract: Number(r.contract),
  deposit: Number(r.deposit),
  hall: r.hall ?? '',
  note: r.note ?? '',
})

/** Both tables in one round trip. Called once when the panel unlocks. */
export async function fetchAll() {
  const [leads, bookings] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*').order('event_date', { ascending: true }),
  ])

  if (leads.error) throw leads.error
  if (bookings.error) throw bookings.error

  return {
    leads: leads.data.map(rowToLead),
    bookings: bookings.data.map(rowToBooking),
  }
}

/* Called by the PUBLIC form, with no session. The anon policy allows
   exactly this insert and nothing else — note there is no `.select()`
   chained on, because anon has no read permission and asking for the
   row back would fail the whole call. */
export async function insertLead(lead) {
  const { error } = await supabase.from('leads').insert({
    name: lead.name,
    phone: lead.phone,
    event_date: lead.date || null,
    message: lead.message || null,
    status: 'new',
  })
  if (error) throw error
}

export async function updateLeadStatus(id, status) {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id)
  if (error) throw error
}

export async function insertBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      event_date: booking.date,
      client: booking.client,
      phone: booking.phone || null,
      status: booking.status,
      guests: booking.guests ?? 0,
      contract: booking.contract ?? 0,
      deposit: booking.deposit ?? 0,
      hall: booking.hall || null,
      note: booking.note || null,
    })
    .select()
    .single()

  if (error) throw error
  return rowToBooking(data)
}

export async function patchBooking(id, patch) {
  const row = {}
  if ('date' in patch) row.event_date = patch.date
  if ('client' in patch) row.client = patch.client
  if ('phone' in patch) row.phone = patch.phone
  if ('status' in patch) row.status = patch.status
  if ('guests' in patch) row.guests = patch.guests
  if ('contract' in patch) row.contract = patch.contract
  if ('deposit' in patch) row.deposit = patch.deposit
  if ('hall' in patch) row.hall = patch.hall
  if ('note' in patch) row.note = patch.note

  const { error } = await supabase.from('bookings').update(row).eq('id', id)
  if (error) throw error
}
