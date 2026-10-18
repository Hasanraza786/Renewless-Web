import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listConnectors } from '../api_services/connectors'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { Connector } from '../types'
import { formatWhen } from '../util/dates'
import { errorMessage } from '../util/values'

function statusLabel(value: string) {
  if (!value) return 'Not available'
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export default function ConnectorsPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [items, setItems] = useState<Connector[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  usePageChrome('Connectors', 'add-connector')

  const load = useCallback(async () => {
    if (!session) return
    setStatus('loading')
    setMessage('')
    try {
      setItems(await listConnectors(session.token))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [session])

  useEffect(() => {
    void load()
  }, [load])

  function open(item: Connector) {
    navigate(`/connectors/${item.id}/review`, { state: { email: item.email } })
  }

  return (
    <div className="page">
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && items.length === 0 ? <EmptyState>No Gmail account is connected.</EmptyState> : null}
      {status === 'ready' && items.length > 0 ? (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last sync</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    className="click-row"
                    tabIndex={0}
                    onClick={() => open(item)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        open(item)
                      }
                    }}
                  >
                    <td>{item.email}</td>
                    <td>{statusLabel(item.status)}</td>
                    <td>{formatWhen(item.lastSync)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stack-list">
            {items.map(item => (
              <button key={item.id} type="button" className="stack-card" onClick={() => open(item)}>
                <strong>{item.email}</strong>
                <span>{statusLabel(item.status)}</span>
                <span>Last sync {formatWhen(item.lastSync)}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
