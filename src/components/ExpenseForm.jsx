import { useState } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIES = {
  food: ['breakfast', 'lunch', 'dinner', 'snacks/misc'],
  conveyance: ['cab', 'rapido', 'train', 'auto', 'metro', 'other'],
  hotel: ['room charge', 'extra amenity'],
  other: ['misc'],
}

export default function ExpenseForm({ tripId, onClose, onCreated }) {
  const [form, setForm] = useState({
    category: 'food',
    subtype: CATEGORIES.food[0],
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    note: '',
  })
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setCategory = (category) => setForm({ ...form, category, subtype: CATEGORIES[category][0] })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let receipt_url = null
      if (receiptFile) {
        const path = `${tripId}/${Date.now()}_${receiptFile.name}`
        const { error: uploadErr } = await supabase.storage.from('receipts').upload(path, receiptFile)
        if (uploadErr) throw uploadErr
        const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(path)
        receipt_url = publicUrl.publicUrl
      }

      const { data, error: insertErr } = await supabase
        .from('expenses')
        .insert([{ ...form, amount: Number(form.amount), trip_id: tripId, receipt_url }])
        .select()
        .single()
      if (insertErr) throw insertErr

      onCreated(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-start justify-center p-4 overflow-y-auto z-50">
      <form onSubmit={submit} className="bg-paper rounded-2xl p-6 w-full max-w-md my-8 space-y-4">
        <h3 className="font-display text-2xl text-ink">Add expense</h3>

        <div className="flex gap-2">
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border ${
                form.category === cat ? 'bg-ink text-paper border-ink' : 'border-slate/30 text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          className="w-full px-3 py-2 rounded-lg border border-slate/30 capitalize"
          value={form.subtype}
          onChange={(e) => setForm({ ...form, subtype: e.target.value })}
        >
          {CATEGORIES[form.category].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input required type="number" step="0.01" placeholder="Amount (₹)"
            className="px-3 py-2 rounded-lg border border-slate/30"
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input required type="date"
            className="px-3 py-2 rounded-lg border border-slate/30"
            value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
        </div>

        <input placeholder="Note (optional)"
          className="w-full px-3 py-2 rounded-lg border border-slate/30"
          value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

        <div>
          <label className="text-xs text-slate">Receipt photo (optional)</label>
          <input type="file" accept="image/*,application/pdf" capture="environment"
            className="w-full text-sm"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
        </div>

        {form.category === 'food' && (
          <p className="text-xs text-slate">Daily food band: ₹750–₹850. You'll see the running total after saving.</p>
        )}

        {error && <p className="text-rust text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate/40 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-amber text-ink font-semibold">
            {saving ? 'Saving…' : 'Save expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
