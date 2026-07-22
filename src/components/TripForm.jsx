import { useState } from 'react'
import { supabase } from '../supabaseClient'

const emptyFlight = { airline: '', flight_number: '', pnr: '', from_city: '', to_city: '', departure_at: '', arrival_at: '' }
const emptyHotel = { name: '', address: '', booking_ref: '', checkin: '', checkout: '' }

export default function TripForm({ onClose, onCreated }) {
  const [trip, setTrip] = useState({ title: '', purpose: '', from_date: '', to_date: '', from_city: '', to_city: '' })
  const [flight, setFlight] = useState(emptyFlight)
  const [hotel, setHotel] = useState(emptyHotel)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data: tripRow, error: tripErr } = await supabase
        .from('trips')
        .insert([{ ...trip, status: 'planned' }])
        .select()
        .single()
      if (tripErr) throw tripErr

      if (flight.airline || flight.flight_number) {
        const { error: flightErr } = await supabase.from('flights').insert([{ ...flight, trip_id: tripRow.id }])
        if (flightErr) throw flightErr
      }
      if (hotel.name) {
        const { error: hotelErr } = await supabase.from('hotels').insert([{ ...hotel, trip_id: tripRow.id }])
        if (hotelErr) throw hotelErr
      }
      onCreated(tripRow)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-start md:items-center justify-center p-4 overflow-y-auto z-50">
      <form onSubmit={submit} className="bg-paper rounded-2xl p-6 w-full max-w-lg my-8 space-y-5">
        <h3 className="font-display text-2xl text-ink">Plan a trip</h3>

        <section className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate font-semibold">Trip</p>
          <input required placeholder="Trip title (e.g. Bangalore — Client QBR)"
            className="w-full px-3 py-2 rounded-lg border border-slate/30"
            value={trip.title} onChange={(e) => setTrip({ ...trip, title: e.target.value })} />
          <input placeholder="Purpose"
            className="w-full px-3 py-2 rounded-lg border border-slate/30"
            value={trip.purpose} onChange={(e) => setTrip({ ...trip, purpose: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate">From date</label>
              <input required type="date" className="w-full px-3 py-2 rounded-lg border border-slate/30"
                value={trip.from_date} onChange={(e) => setTrip({ ...trip, from_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate">To date</label>
              <input required type="date" className="w-full px-3 py-2 rounded-lg border border-slate/30"
                value={trip.to_date} onChange={(e) => setTrip({ ...trip, to_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="From city" className="w-full px-3 py-2 rounded-lg border border-slate/30"
              value={trip.from_city} onChange={(e) => setTrip({ ...trip, from_city: e.target.value })} />
            <input placeholder="To city" className="w-full px-3 py-2 rounded-lg border border-slate/30"
              value={trip.to_city} onChange={(e) => setTrip({ ...trip, to_city: e.target.value })} />
          </div>
        </section>

        <section className="space-y-2 border-t border-slate/20 pt-4">
          <p className="text-xs uppercase tracking-wider text-slate font-semibold">Flight (optional)</p>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Airline" className="px-3 py-2 rounded-lg border border-slate/30"
              value={flight.airline} onChange={(e) => setFlight({ ...flight, airline: e.target.value })} />
            <input placeholder="Flight number" className="px-3 py-2 rounded-lg border border-slate/30"
              value={flight.flight_number} onChange={(e) => setFlight({ ...flight, flight_number: e.target.value })} />
          </div>
          <input placeholder="PNR" className="w-full px-3 py-2 rounded-lg border border-slate/30"
            value={flight.pnr} onChange={(e) => setFlight({ ...flight, pnr: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate">Departure</label>
              <input type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-slate/30"
                value={flight.departure_at} onChange={(e) => setFlight({ ...flight, departure_at: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate">Arrival</label>
              <input type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-slate/30"
                value={flight.arrival_at} onChange={(e) => setFlight({ ...flight, arrival_at: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="space-y-2 border-t border-slate/20 pt-4">
          <p className="text-xs uppercase tracking-wider text-slate font-semibold">Hotel (optional)</p>
          <input placeholder="Hotel name" className="w-full px-3 py-2 rounded-lg border border-slate/30"
            value={hotel.name} onChange={(e) => setHotel({ ...hotel, name: e.target.value })} />
          <input placeholder="Booking reference" className="w-full px-3 py-2 rounded-lg border border-slate/30"
            value={hotel.booking_ref} onChange={(e) => setHotel({ ...hotel, booking_ref: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate">Check-in</label>
              <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate/30"
                value={hotel.checkin} onChange={(e) => setHotel({ ...hotel, checkin: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate">Check-out</label>
              <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate/30"
                value={hotel.checkout} onChange={(e) => setHotel({ ...hotel, checkout: e.target.value })} />
            </div>
          </div>
        </section>

        {error && <p className="text-rust text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate/40 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-amber text-ink font-semibold">
            {saving ? 'Saving…' : 'Create trip'}
          </button>
        </div>
      </form>
    </div>
  )
}
