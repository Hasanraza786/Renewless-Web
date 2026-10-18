import { Link } from 'react-router-dom'
import type { Subscription } from '../types'
import { formatDate } from '../util/dates'
import { formatMoney } from '../util/money'
import { StatusBadge } from './StatusBadge'

export function SubscriptionCard({ item }: { item: Subscription }) {
  return (
    <Link className="sub-card" to={`/subscriptions/${item.id}`}>
      <div className="sub-card-top">
        <strong>{item.name}</strong>
        <span>{formatMoney(item.price, item.currency)}</span>
      </div>
      <p>
        Renews {formatDate(item.nextRenewal) || 'Date needed'}
        {item.renewalSource === 'predicted' ? <span className="estimated">Estimated</span> : null}
      </p>
      <p>Starts {formatDate(item.startDate) || 'Not set'}</p>
      <StatusBadge status={item.status} />
      {item.note.trim() ? <p className="note">{item.note}</p> : null}
    </Link>
  )
}
