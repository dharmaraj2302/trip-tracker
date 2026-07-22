import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const sendLink = async (e) => {
    e.preventDefault()
    await supabase.auth.signInWithOtp({
     email,
     options: { emailRedirectTo: window.location.href }
   })
    setSent(true)
  }

  if (loading) return null

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="bg-paper rounded-2xl p-8 max-w-sm w-full">
          <h1 className="font-display text-3xl text-ink mb-1">Tripline</h1>
          <p className="text-slate text-sm mb-6">Sign in to track your trips and expenses.</p>
          {sent ? (
            <p className="text-teal text-sm">Check your email for a sign-in link.</p>
          ) : (
            <form onSubmit={sendLink} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate/30 bg-white text-ink"
              />
              <button
                type="submit"
                className="w-full bg-amber text-ink font-semibold py-2 rounded-lg hover:opacity-90"
              >
                Send sign-in link
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return children
}
