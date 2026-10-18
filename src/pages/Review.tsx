import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { addReviewItem, dismissReviewItem, listReview } from '../api_services/connectors'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { ReviewItem } from '../types'
import { formatDate } from '../util/dates'
import { formatMoney } from '../util/money'
import { errorMessage } from '../util/values'

export default function ReviewPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email || ''
  const { session } = useSession()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [pendingId, setPendingId] = useState('')
  usePageChrome('Review')

  const load = useCallback(async () => {
    if (!session || !id) return
    setStatus('loading')
    setMessage('')
    try {
      setItems(await listReview(session.token, id))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [id, session])

  useEffect(() => {
    void load()
  }, [load])

  async function act(itemId: string, kind: 'add' | 'dismiss') {
    if (!session) return
    setPendingId(itemId)
    setMessage('')
    try {
      if (kind === 'add') await addReviewItem(session.token, itemId)
      else await dismissReviewItem(session.token, itemId)
      setItems(current => current.filter(item => item.id !== itemId))
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setPendingId('')
    }
  }

  return (
    <div className="page">
      <p className="support">
        {email ? `Subscriptions found for ${email}.` : 'Subscriptions found for this account.'}
      </p>
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && message ? <p className="form-error" role="alert">{message}</p> : null}
      {status === 'ready' && items.length === 0 ? <EmptyState>Nothing is waiting for review.</EmptyState> : null}
      {status === 'ready' && items.length > 0 ? (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Renew date</th>
                  <th scope="col">Add</th>
                  <th scope="col">Dismiss</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{formatMoney(item.price, item.currency)}</td>
                    <td>{formatDate(item.nextRenewal)}</td>
                    <td>
                      <button className="btn btn-small" type="button" disabled={pendingId === item.id} onClick={() => act(item.id, 'add')}>
                        Add
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-small btn-secondary" type="button" disabled={pendingId === item.id} onClick={() => act(item.id, 'dismiss')}>
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stack-list">
            {items.map(item => (
              <article className="stack-card" key={item.id}>
                <strong>{item.name}</strong>
                <span>{formatMoney(item.price, item.currency)}</span>
                <span>{formatDate(item.nextRenewal) || 'Date needed'}</span>
                <div className="form-actions">
                  <button className="btn btn-small" type="button" disabled={pendingId === item.id} onClick={() => act(item.id, 'add')}>
                    Add
                  </button>
                  <button className="btn btn-small btn-secondary" type="button" disabled={pendingId === item.id} onClick={() => act(item.id, 'dismiss')}>
                    Dismiss
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
