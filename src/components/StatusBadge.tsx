import { statusColors } from '../constants/statusColors'
import { STATUS_LABELS } from '../constants/subscriptions'
import type { SubscriptionStatus } from '../types'

function colorKey(status: SubscriptionStatus) {
  if (status === 'in_progress') return 'inProgress'
  if (status === 'expired') return 'expired'
  return 'upcoming'
}

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const colors = statusColors[colorKey(status)]
  return (
    <span className="status-badge" style={{ background: colors.background, color: colors.text }}>
      {STATUS_LABELS[status]}
    </span>
  )
}
