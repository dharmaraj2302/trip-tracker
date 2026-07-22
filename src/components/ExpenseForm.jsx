import { useState } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIES = {
  food: ['breakfast', 'lunch', 'dinner', 'snacks/misc'],
  conveyance: ['cab', 'rapido', 'train', 'auto', 'metro', 'other'],
  hotel: ['room charge', 'extra amenity'],
  other: ['misc'],
}

export default function ExpenseForm({ tripId, expense, onClose, onSaved, onDeleted }) {
  const isEdit = !!expense
  const [form, setForm] = useState({
    category: expense?.category || 'food',
    subtype: expense?.subtype || CATEGORIES.food[0],
    amount: expense?.amount ?? '',
    expense_date: expense?.expense_date || new Date().toISOString().slice(0, 10),
    note: expense?.note || '',
  })
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const setCategory = (category) => setForm({ ...form, category, subtype: CATEGORIES[category][0] })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let receipt_url = expense?.receipt_url || null
      if (receiptFile) {
        const path = `${tripId}/${Date.now()}_${receiptFile.name}`
        const { error: uploadErr } = await supabase.storage.from('receipts').upload(path, receiptFile)
        if (uploadErr) throw uploadErr
        const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(path)
        receipt_url = publicUrl.publicUrl
      }

      const payload = { ...form, amount: Number(form.amount), receipt_url }

      if (isEdit) {
        const { data, error: updErr } = await supabase
          .from('expenses').update(payload).eq('id', expense.id).select().single()
        if (updErr) throw updErr
        onSaved(data)
      } else {
        const { data, error: insertErr } = await supabase
          .from('expenses').insert([{ ...payload, trip_id: tripId }]).select().single()
        if (insertErr) throw insertErr
        onSaved(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this expense?')) return
    setDeleting(true)
    setError(null)
    try {
      const { error: delErr } = await supabase.from('expenses').delete().eq('id', expense.id)
      if (delErr) throw delErr
      onDeleted(expense.id)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-start justify-center p-4 overflow-y-auto z-50">
      <form onSubmit={submit} className="bg-paper rounded-2xl p-6 w-full max-w-md my-8 space-y-4">
        <h3 className="font-display text-2xl text-ink">{isEdit ? 'Edit expense' : 'Add expense'}</h3>

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
          <label className="text-xs text-slate">
            Receipt photo {isEdit && expense.receipt_url ? '(replace)' : '(optional)'}
          </label>
          <input type="file" accept="image/*,application/pdf" capture="environment"
            className="w-full text-sm"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
          {isEdit && expense.receipt_url && !receiptFile && (
            <a href={expense.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-teal underline">
              view current receipt
            </a>
          )}
        </div>

        {form.category === 'food' && (
          <p className="text-xs text-slate">Daily food band: ₹750–₹850. You'll see the running total after saving.</p>
        )}

        {error && <p className="text-rust text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate/40 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={saving || deleting} className="flex-1 py-2 rounded-lg bg-amber text-ink font-semibold">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save expense'}
          </button>
        </div>
        {isEdit && (
          <button type="button" onClick={remove} disabled={saving || deleting}
            className="w-full py-2 rounded-lg border border-rust text-rust text-sm font-semibold">
            {deleting ? 'Deleting…' : 'Delete expense'}
          </button>
        )}
      </form>
    </div>
  )
}
