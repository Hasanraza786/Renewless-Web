import { useNavigate } from 'react-router-dom'
import { createSubscription } from '../api_services/subscriptions'
import { SubscriptionForm } from '../components/SubscriptionForm'
import { EMPTY_SUBSCRIPTION } from '../constants/subscriptions'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'

export default function AddSubscriptionPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  usePageChrome('Add subscription')

  return (
    <div className="page form-page">
      <SubscriptionForm
        initial={EMPTY_SUBSCRIPTION}
        submitLabel="Save"
        onSubmit={async values => {
          if (!session) return
          await createSubscription(session.token, values)
          navigate('/subscriptions')
        }}
      />
    </div>
  )
}
