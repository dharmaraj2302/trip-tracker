import { dailyFoodSummary, statusColor, statusLabel, FOOD_MIN, FOOD_MAX } from '../lib/budget'

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function BudgetStrip({ expenses }) {
  const days = dailyFoodSummary(expenses)
  if (days.length === 0) return null

  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-wider text-paper/60 font-semibold mb-2">
        Food spend vs ₹{FOOD_MIN}–₹{FOOD_MAX}/day band
      </p>
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <div
            key={d.date}
            className={`bg-paper rounded-lg px-3 py-2 border-l-4 ${statusColor(d.status)}`}
          >
            <p className="ticket-code text-xs text-slate">{fmtDate(d.date)}</p>
            <p className="font-semibold text-ink">₹{d.total.toFixed(0)}</p>
            <p className={`text-[11px] font-semibold ${statusColor(d.status).split(' ')[0]}`}>
              {statusLabel(d.status)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
