import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AuthGate from './components/AuthGate'
import TripList from './components/TripList'
import TripForm from './components/TripForm'
import TripDetail from './components/TripDetail'

export default function App() {
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showTripForm, setShowTripForm] = useState(false)

  const loadTrips = async () => {
    const { data } = await supabase.from('trips').select('*').order('from_date', { ascending: false })
    setTrips(data || [])
  }

  useEffect(() => { loadTrips() }, [])

  return (
    <AuthGate>
      <div className="min-h-screen bg-ink px-4 py-8 md:px-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="font-display text-4xl text-paper tracking-wide">Tripline</h1>
            <p className="text-paper/50 text-sm">Plan the trip, log the spend, never backtrack again.</p>
          </header>

          {selectedTrip ? (
            <TripDetail trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
          ) : (
            <TripList
              trips={trips}
              onSelect={setSelectedTrip}
              onNewTrip={() => setShowTripForm(true)}
            />
          )}
        </div>
      </div>

      {showTripForm && (
        <TripForm
          onClose={() => setShowTripForm(false)}
          onCreated={(trip) => {
            setTrips((prev) => [trip, ...prev])
            setShowTripForm(false)
            setSelectedTrip(trip)
          }}
        />
      )}
    </AuthGate>
  )
}
