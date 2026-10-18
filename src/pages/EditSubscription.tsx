import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSubscription, updateSubscription } from '../api_services/subscriptions'
import { SubscriptionForm } from '../components/SubscriptionForm'
import { ErrorState, LoadingState } from '../components/States'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { SubscriptionFormValues } from '../types'
import { errorMessage } from '../util/values'

export default function EditSubscriptionPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const [initial, setInitial] = useState<SubscriptionFormValues | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  usePageChrome('Edit subscription')

  const load = useCallback(async () => {
    if (!session || !id) return
    setStatus('loading')
    setMessage('')
    try {
      const item = await getSubscription(session.token, id)
      setInitial({
        name: item.name,
        price: String(item.price),
        currency: item.currency,
        cycle: item.cycle,
        startDate: item.startDate,
        nextRenewal: item.nextRenewal,
        note: item.note,
      })
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(errorMessage(error))
    }
  }, [id, session])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="page form-page">
      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState message={message} onRetry={load} /> : null}
      {status === 'ready' && initial ? (
        <SubscriptionForm
          key={id}
          initial={initial}
          submitLabel="Save"
          onSubmit={async values => {
            if (!session) return
            await updateSubscription(session.token, id, values)
            navigate(`/subscriptions/${id}`)
          }}
        />
      ) : null}
    </div>
  )
}
