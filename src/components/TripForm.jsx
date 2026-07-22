import { useState } from 'react'
import { supabase } from '../supabaseClient'

const emptyFlight = { airline: '', flight_number: '', pnr: '', from_city: '', to_city: '', departure_at: '', arrival_at: '' }
const emptyHotel = { name: '', address: '', booking_ref: '', checkin: '', checkout: '' }

async function uploadDoc(tripId, folder, file) {
  if (!file) return null
  const path = `${tripId}/${folder}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from('receipts').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('receipts').getPublicUrl(path)
  return data.publicUrl
}

export default function TripForm({ onClose, onCreated }) {
  const [trip, setTrip] = useState({ title: '', purpose: '', from_date: '', to_date: '', from_city: '', to_city: '', trip_type: 'one_way' })
  const [outbound, setOutbound] = useState(emptyFlight)
  const [outboundPass, setOutboundPass] = useState(null)
  const [returnFlight, setReturnFlight] = useState(emptyFlight)
  const [returnPass, setReturnPass] = useState(null)
  const [hotel, setHotel] = useState(emptyHotel)
  const [hotelDoc, setHotelDoc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isRoundTrip = trip.trip_type === 'round_trip'

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

      if (outbound.airline || outbound.flight_number) {
        const boarding_pass_url = await uploadDoc(tripRow.id, 'boarding-passes', outboundPass)
        const { error: flightErr } = await supabase
          .from('flights')
          .insert([{ ...outbound, leg: 'outbound', boarding_pass_url, trip_id: tripRow.id }])
        if (flightErr) throw flightErr
      }

      if (isRoundTrip && (returnFlight.airline || returnFlight.flight_number)) {
        const boarding_pass_url = await uploadDoc(tripRow.id, 'boarding-passes', returnPass)
        const { error: flightErr } = await supabase
          .from('flights')
          .insert([{ ...returnFlight, leg: 'return', boarding_pass_url, trip_id: tripRow.id }])
        if (flightErr) throw flightErr
      }

      if (hotel.name) {
        const reservation_url = await uploadDoc(tripRow.id, 'hotel-reservations', hotelDoc)
        const { error: hotelErr } = await supabase
          .from('hotels')
          .insert([{ ...hotel, reservation_url, trip_id: tripRow.id }])
        if (hotelErr) throw hotelErr
      }

      onCreated(tripRow)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const flightFields = (flight, setFlight, pass, setPass, label) => (
    <section className="space-y-2 border-t border-slate/20 pt-4">
      <p className="text-xs uppercase tracking-wider text-slate font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Airline" className="px-3 py-2 rounded-lg border border-slate/30"
          value={flight.airline} onChange={(e) => setFlight({ ...flight, airline: e.target.value })} />
        <input placeholder="Flight number" className="px-3 py-2 rounded-lg border border-slate/30"
          value={flight.flight_number} onChange={(e) => setFlight({ ...flight, flight_number: e.target.value })} />
      </div>
      <input placeholder="PNR" className="w-full px-3 py-2 rounded-lg border border-slate/30"
        value={flight.pnr} onChange={(e) => setFlight({ ...flight, pnr: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="From city" className="px-3 py-2 rounded-lg border border-slate/30"
          value={flight.from_city} onChange={(e) => setFlight({ ...flight, from_city: e.target.value })} />
        <input placeholder="To city" className="px-3 py-2 rounded-lg border border-slate/30"
          value={flight.to_city} onChange={(e) => setFlight({ ...flight, to_city: e.target.value })} />
      </div>
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
      <div>
        <label className="text-xs text-slate">Boarding pass (optional)</label>
        <input type="file" accept="image/*,application/pdf" className="w-full text-sm"
          onChange={(e) => setPass(e.target.files?.[0] || null)} />
      </div>
    </section>
  )

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
          <p className="text-xs uppercase tracking-wider text-slate font-semibold">Flight type</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTrip({ ...trip, trip_type: 'one_way' })}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                trip.trip_type === 'one_way' ? 'bg-ink text-paper border-ink' : 'border-slate/30 text-ink'
              }`}>
              One way
            </button>
            <button type="button" onClick={() => setTrip({ ...trip, trip_type: 'round_trip' })}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                trip.trip_type === 'round_trip' ? 'bg-ink text-paper border-ink' : 'border-slate/30 text-ink'
              }`}>
              Round trip
            </button>
          </div>
        </section>

        {flightFields(outbound, setOutbound, outboundPass, setOutboundPass, isRoundTrip ? 'Outbound flight' : 'Flight (optional)')}
        {isRoundTrip && flightFields(returnFlight, setReturnFlight, returnPass, setReturnPass, 'Return flight')}

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
          <div>
            <label className="text-xs text-slate">Reservation copy (optional)</label>
            <input type="file" accept="image/*,application/pdf" className="w-full text-sm"
              onChange={(e) => setHotelDoc(e.target.files?.[0] || null)} />
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
