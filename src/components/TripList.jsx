const statusStyle = {
  planned: 'bg-slate/20 text-ink',
  ongoing: 'bg-amber/30 text-ink',
  completed: 'bg-teal/20 text-teal',
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function TripList({ trips, onSelect, onNewTrip }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl tracking-wide text-paper">Your trips</h2>
        <button
          onClick={onNewTrip}
          className="bg-amber text-ink font-semibold px-4 py-2 rounded-lg hover:opacity-90 font-body text-sm"
        >
          + Plan a trip
        </button>
      </div>

      {trips.length === 0 && (
        <div className="text-paper/60 font-body text-sm border border-dashed border-paper/30 rounded-xl p-8 text-center">
          No trips yet. Add flight and hotel dates before you travel — expenses live under each trip.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => onSelect(trip)}
            className="text-left bg-paper rounded-2xl overflow-hidden flex shadow-lg hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex-1 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${statusStyle[trip.status]}`}>
                  {trip.status}
                </span>
                <span className="ticket-code text-xs text-slate">
                  {fmtDate(trip.from_date)} – {fmtDate(trip.to_date)}
                </span>
              </div>
              <h3 className="font-display text-2xl text-ink leading-none mb-1">{trip.title}</h3>
              {trip.purpose && <p className="text-slate text-sm">{trip.purpose}</p>}
              <div className="flex items-center gap-2 mt-4 ticket-code text-ink font-semibold text-lg">
                <span>{trip.from_city || '—'}</span>
                <span className="text-amber">✈</span>
                <span>{trip.to_city || '—'}</span>
              </div>
            </div>
            <div className="w-20 stub-divider flex items-center justify-center bg-ink">
              <span className="ticket-code text-paper text-xs -rotate-90 whitespace-nowrap">
                VIEW TRIP
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
