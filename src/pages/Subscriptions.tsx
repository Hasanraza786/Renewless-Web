import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSubscriptions } from '../api_services/subscriptions'
import { StatusBadge } from '../components/StatusBadge'
import { SubscriptionCard } from '../components/SubscriptionCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { FILTERS } from '../constants/subscriptions'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { Subscription, SubscriptionStatus } from '../types'
import { formatDate } from '../util/dates'
import { formatMoney } from '../util/money'
import { errorMessage } from '../util/values'

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [items, setItems] = useState<Subscription[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SubscriptionStatus>('upcoming')
  usePageChrome('Subscriptions', 'add-subscription')

  const load = useCallback(async () => {
    if (!session) return
    setStatus('loading')
    setMessage('')
    try {
      setItems(await listSubscriptions(session.token))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [session])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter(item => {
      if (item.status !== filter) return false
      if (!needle) return true
      return item.name.toLowerCase().includes(needle) || item.note.toLowerCase().includes(needle)
    })
  }, [filter, items, query])

  function open(id: string) {
    navigate(`/subscriptions/${id}`)
  }

  return (
    <div className="page">
      <div className="toolbar">
        <input
          className="search"
          type="search"
          value={query}
          placeholder="Search"
          aria-label="Search subscriptions"
          onChange={event => setQuery(event.target.value)}
        />
        <div className="filters" role="group" aria-label="Filters">
          {FILTERS.map(option => (
            <button
              key={option.value}
              type="button"
              className={option.value === filter ? 'chip on' : 'chip'}
              aria-pressed={option.value === filter}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && items.length === 0 ? <EmptyState>No subscriptions yet.</EmptyState> : null}
      {status === 'ready' && items.length > 0 && visible.length === 0 ? (
        <EmptyState>{query.trim() ? 'No subscriptions match that search.' : 'Nothing in this filter.'}</EmptyState>
      ) : null}
      {status === 'ready' && visible.length > 0 ? (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Company</th>
                  <th scope="col">Price</th>
                  <th scope="col">Start date</th>
                  <th scope="col">Renew date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(item => (
                  <tr
                    key={item.id}
                    className="click-row"
                    tabIndex={0}
                    onClick={() => open(item.id)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        open(item.id)
                      }
                    }}
                  >
                    <td>{item.name}</td>
                    <td>{formatMoney(item.price, item.currency)}</td>
                    <td>{formatDate(item.startDate)}</td>
                    <td>
                      {formatDate(item.nextRenewal)}
                      {item.renewalSource === 'predicted' ? <span className="estimated">Estimated</span> : null}
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stack-list">
            {visible.map(item => (
              <SubscriptionCard key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
