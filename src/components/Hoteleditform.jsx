import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function HotelEditForm({ hotel, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    name: hotel.name || '',
    address: hotel.address || '',
    booking_ref: hotel.booking_ref || '',
    checkin: hotel.checkin || '',
    checkout: hotel.checkout || '',
  })
  const [docFile, setDocFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let reservation_url = hotel.reservation_url || null
      if (docFile) {
        const path = `${hotel.trip_id}/hotel-reservations/${Date.now()}_${docFile.name}`
        const { error: upErr } = await supabase.storage.from('receipts').upload(path, docFile)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('receipts').getPublicUrl(path)
        reservation_url = data.publicUrl
      }
      const { data, error: updErr } = await supabase
        .from('hotels').update({ ...form, reservation_url }).eq('id', hotel.id).select().single()
      if (updErr) throw updErr
      onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this hotel entry?')) return
    setDeleting(true)
    setError(null)
    try {
      const { error: delErr } = await supabase.from('hotels').delete().eq('id', hotel.id)
      if (delErr) throw delErr
      onDeleted(hotel.id)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-start justify-center p-4 overflow-y-auto z-50">
      <form onSubmit={submit} className="bg-paper rounded-2xl p-6 w-full max-w-md my-8 space-y-4">
        <h3 className="font-display text-2xl text-ink">Edit hotel</h3>

        <input placeholder="Hotel name" className="w-full px-3 py-2 rounded-lg border border-slate/30"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Address" className="w-full px-3 py-2 rounded-lg border border-slate/30"
          value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Booking reference" className="w-full px-3 py-2 rounded-lg border border-slate/30"
          value={form.booking_ref} onChange={(e) => setForm({ ...form, booking_ref: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate">Check-in</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate/30"
              value={form.checkin} onChange={(e) => setForm({ ...form, checkin: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate">Check-out</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate/30"
              value={form.checkout} onChange={(e) => setForm({ ...form, checkout: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate">
            Reservation copy {hotel.reservation_url ? '(replace)' : '(optional)'}
          </label>
          <input type="file" accept="image/*,application/pdf" className="w-full text-sm"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
          {hotel.reservation_url && !docFile && (
            <a href={hotel.reservation_url} target="_blank" rel="noreferrer" className="text-xs text-teal underline">
              view current reservation copy
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
          {deleting ? 'Deleting…' : 'Delete hotel'}
        </button>
      </form>
    </div>
  )
}
