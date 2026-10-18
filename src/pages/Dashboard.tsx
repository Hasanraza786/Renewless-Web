import { useCallback, useEffect, useState } from 'react'
import { getDashboard } from '../api_services/dashboard'
import { SubscriptionCard } from '../components/SubscriptionCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { DashboardData } from '../types'
import { errorMessage } from '../util/values'

export default function DashboardPage() {
  const { session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  usePageChrome('Dashboard')

  const load = useCallback(async () => {
    if (!session) return
    setStatus('loading')
    setMessage('')
    try {
      setData(await getDashboard(session.token))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [session])

  useEffect(() => {
    void load()
  }, [load])

  const counts = [
    { label: 'Active subscriptions', value: data ? String(data.active) : '' },
    { label: 'Renewing in the next 7 days', value: data ? String(data.renewingIn7Days) : '' },
    { label: "This month's total", value: data?.monthTotal ?? '' },
    { label: 'Expired', value: data ? String(data.expired) : '' },
  ]

  return (
    <div className="page">
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && data ? (
        <>
          <section className="counts" aria-label="Counts">
            {counts.map(count => (
              <article className="count-card" key={count.label}>
                <p>{count.label}</p>
                <strong>{count.value}</strong>
              </article>
            ))}
          </section>
          <h2 className="section-title">Upcoming</h2>
          {data.upcoming.length === 0 ? (
            <EmptyState>Nothing renews soon.</EmptyState>
          ) : (
            <div className="upcoming-row">
              {data.upcoming.map(item => (
                <SubscriptionCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
