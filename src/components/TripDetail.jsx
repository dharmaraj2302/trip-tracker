import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ExpenseForm from './ExpenseForm'
import BudgetStrip from './BudgetStrip'
import { exportTripToExcel } from '../lib/excelExport'

export default function TripDetail({ trip, onBack }) {
  const [flights, setFlights] = useState([])
  const [hotels, setHotels] = useState([])
  const [expenses, setExpenses] = useState([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const loadAll = async () => {
    const [{ data: f }, { data: h }, { data: e }] = await Promise.all([
      supabase.from('flights').select('*').eq('trip_id', trip.id),
      supabase.from('hotels').select('*').eq('trip_id', trip.id),
      supabase.from('expenses').select('*').eq('trip_id', trip.id).order('expense_date', { ascending: false }),
    ])
    setFlights(f || [])
    setHotels(h || [])
    setExpenses(e || [])
  }

  useEffect(() => { loadAll() }, [trip.id])

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div>
      <button onClick={onBack} className="text-paper/70 text-sm mb-4">&larr; All trips</button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-3xl text-paper">{trip.title}</h2>
          <p className="ticket-code text-paper/60 text-sm">
            {trip.from_date} → {trip.to_date} · {trip.from_city} ✈ {trip.to_city}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportTripToExcel(trip, expenses)}
            className="bg-teal text-paper font-semibold px-4 py-2 rounded-lg text-sm"
          >
            Export to Excel
          </button>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-amber text-ink font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Add expense
          </button>
        </div>
      </div>

      {(flights.length > 0 || hotels.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {flights.map((f) => (
            <div key={f.id} className="bg-paper rounded-xl p-4">
              <p className="text-xs uppercase tracking-wider text-slate font-semibold mb-1">Flight</p>
              <p className="font-display text-xl text-ink">{f.airline} {f.flight_number}</p>
              <p className="ticket-code text-sm text-slate">PNR {f.pnr || '—'}</p>
              <p className="text-sm text-ink mt-1">{f.from_city} → {f.to_city}</p>
            </div>
          ))}
          {hotels.map((h) => (
            <div key={h.id} className="bg-paper rounded-xl p-4">
              <p className="text-xs uppercase tracking-wider text-slate font-semibold mb-1">Hotel</p>
              <p className="font-display text-xl text-ink">{h.name}</p>
              <p className="text-sm text-slate">{h.checkin} → {h.checkout}</p>
              <p className="ticket-code text-sm text-slate">Ref {h.booking_ref || '—'}</p>
            </div>
          ))}
        </div>
      )}

      <BudgetStrip expenses={expenses} />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl text-paper">Expenses</h3>
        <p className="ticket-code text-paper font-semibold">Total ₹{total.toFixed(0)}</p>
      </div>

      <div className="bg-paper rounded-xl divide-y divide-slate/15 overflow-hidden">
        {expenses.length === 0 && (
          <p className="p-4 text-slate text-sm">No expenses logged yet.</p>
        )}
        {expenses.map((e) => (
          <div key={e.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink capitalize">{e.subtype || e.category}</p>
              <p className="text-xs text-slate">{e.expense_date} · {e.category}{e.note ? ` · ${e.note}` : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              {e.receipt_url && (
                <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-teal underline">
                  receipt
                </a>
              )}
              <p className="ticket-code font-semibold text-ink">₹{Number(e.amount).toFixed(0)}</p>
            </div>
          </div>
        ))}
      </div>

      {showExpenseForm && (
        <ExpenseForm
          tripId={trip.id}
          onClose={() => setShowExpenseForm(false)}
          onCreated={(newExpense) => {
            setExpenses((prev) => [newExpense, ...prev])
            setShowExpenseForm(false)
          }}
        />
      )}
    </div>
  )
}
