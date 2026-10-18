import { useCallback, useEffect, useState } from 'react'
import { listNotifications } from '../api_services/notifications'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { RenewalNotice } from '../types'
import { formatDate } from '../util/dates'
import { errorMessage } from '../util/values'

export default function NotificationsPage() {
  const { session } = useSession()
  const [items, setItems] = useState<RenewalNotice[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  usePageChrome('Notifications')

  const load = useCallback(async () => {
    if (!session) return
    setStatus('loading')
    setMessage('')
    try {
      setItems(await listNotifications(session.token))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [session])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="page">
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && items.length === 0 ? <EmptyState>No renewal notices.</EmptyState> : null}
      {status === 'ready' && items.length > 0 ? (
        <ul className="notice-list">
          {items.map(item => (
            <li key={item.id}>
              <strong>{item.name}</strong>
              <span>{formatDate(item.date) || item.date}</span>
              <span className={item.estimated ? 'estimated' : 'confirmed'}>
                {item.estimated ? 'Estimated' : 'Confirmed'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
