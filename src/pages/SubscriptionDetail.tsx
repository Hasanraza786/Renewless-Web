import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteSubscription, getSubscription } from '../api_services/subscriptions'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorState, LoadingState } from '../components/States'
import { CYCLES } from '../constants/subscriptions'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { Subscription } from '../types'
import { formatDate } from '../util/dates'
import { formatMoney } from '../util/money'
import { errorMessage } from '../util/values'

export default function SubscriptionDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const [item, setItem] = useState<Subscription | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  usePageChrome('Subscription')

  const load = useCallback(async () => {
    if (!session || !id) return
    setStatus('loading')
    setMessage('')
    try {
      setItem(await getSubscription(session.token, id))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [id, session])

  useEffect(() => {
    void load()
  }, [load])

  async function onDelete() {
    if (!session || !item) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteSubscription(session.token, item.id)
      navigate('/subscriptions', { replace: true })
    } catch (error) {
      setDeleteError(errorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  const cycle = item ? CYCLES.find(option => option.value === item.cycle)?.label ?? item.cycle : ''

  return (
    <div className="page">
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && item ? (
        <section className="detail-panel">
          <div className="detail-actions">
            <Link className="btn btn-small" to={`/subscriptions/${item.id}/edit`}>Edit</Link>
            <button className="btn btn-small btn-danger" type="button" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </div>
          <dl className="facts">
            <div>
              <dt>Company</dt>
              <dd>{item.name}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{formatMoney(item.price, item.currency)}</dd>
            </div>
            <div>
              <dt>Cycle</dt>
              <dd>{cycle}</dd>
            </div>
            <div>
              <dt>Start date</dt>
              <dd>{formatDate(item.startDate) || 'Not set'}</dd>
            </div>
            <div>
              <dt>Renew date</dt>
              <dd>
                {formatDate(item.nextRenewal) || 'Not set'}
                {item.renewalSource === 'predicted' ? <span className="estimated">Estimated</span> : null}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd><StatusBadge status={item.status} /></dd>
            </div>
            {item.note.trim() ? (
              <div className="span-all">
                <dt>Note</dt>
                <dd>{item.note}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}
      {confirming && item ? (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={event => event.stopPropagation()}
          >
            <h2 id="delete-title">Delete {item.name}?</h2>
            <p>This removes the subscription from your list.</p>
            <div className="form-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className="btn btn-danger-solid" type="button" onClick={onDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
            {deleteError ? <p className="form-error" role="alert">{deleteError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
