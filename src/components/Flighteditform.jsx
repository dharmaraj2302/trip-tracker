import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function FlightEditForm({ flight, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    airline: flight.airline || '',
    flight_number: flight.flight_number || '',
    pnr: flight.pnr || '',
    from_city: flight.from_city || '',
    to_city: flight.to_city || '',
    departure_at: flight.departure_at ? flight.departure_at.slice(0, 16) : '',
    arrival_at: flight.arrival_at ? flight.arrival_at.slice(0, 16) : '',
  })
  const [passFile, setPassFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let boarding_pass_url = flight.boarding_pass_url || null
      if (passFile) {
        const path = `${flight.trip_id}/boarding-passes/${Date.now()}_${passFile.name}`
        const { error: upErr } = await supabase.storage.from('receipts').upload(path, passFile)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('receipts').getPublicUrl(path)
        boarding_pass_url = data.publicUrl
      }
      const { data, error: updErr } = await supabase
        .from('flights').update({ ...form, boarding_pass_url }).eq('id', flight.id).select().single()
      if (updErr) throw updErr
      onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this flight?')) return
    setDeleting(true)
    setError(null)
    try {
      const { error: delErr } = await supabase.from('flights').delete().eq('id', flight.id)
      if (delErr) throw delErr
      onDeleted(flight.id)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-start justify-center p-4 overflow-y-auto z-50">
      <form onSubmit={submit} className="bg-paper rounded-2xl p-6 w-full max-w-md my-8 space-y-4">
        <h3 className="font-display text-2xl text-ink capitalize">Edit {flight.leg} flight</h3>

        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Airline" className="px-3 py-2 rounded-lg border border-slate/30"
            value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} />
          <input placeholder="Flight number" className="px-3 py-2 rounded-lg border border-slate/30"
            value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} />
        </div>
        <input placeholder="PNR" className="w-full px-3 py-2 rounded-lg border border-slate/30"
          value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="From city" className="px-3 py-2 rounded-lg border border-slate/30"
            value={form.from_city} onChange={(e) => setForm({ ...form, from_city: e.target.value })} />
          <input placeholder="To city" className="px-3 py-2 rounded-lg border border-slate/30"
            value={form.to_city} onChange={(e) => setForm({ ...form, to_city: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate">Departure</label>
            <input type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-slate/30"
              value={form.departure_at} onChange={(e) => setForm({ ...form, departure_at: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate">Arrival</label>
            <input type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-slate/30"
              value={form.arrival_at} onChange={(e) => setForm({ ...form, arrival_at: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate">
            Boarding pass {flight.boarding_pass_url ? '(replace)' : '(optional)'}
          </label>
          <input type="file" accept="image/*,application/pdf" className="w-full text-sm"
            onChange={(e) => setPassFile(e.target.files?.[0] || null)} />
          {flight.boarding_pass_url && !passFile && (
            <a href={flight.boarding_pass_url} target="_blank" rel="noreferrer" className="text-xs text-teal underline">
              view current boarding pass
            </a>
          )}
        </div>

        {error && <p className="text-rust text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate/40 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={saving || deleting} className="flex-1 py-2 rounded-lg bg-amber text-ink font-semibold">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
        <button type="button" onClick={remove} disabled={saving || deleting}
          className="w-full py-2 rounded-lg border border-rust text-rust text-sm font-semibold">
          {deleting ? 'Deleting…' : 'Delete flight'}
        </button>
      </form>
    </div>
  )
}
