import type { Cycle, Gender, SubscriptionFormValues, SubscriptionStatus } from '../types'

export const CYCLES: { value: Cycle; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY']

export const FILTERS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'expired', label: 'Expired' },
]

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In progress',
  expired: 'Expired',
}

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

export const EMPTY_SUBSCRIPTION: SubscriptionFormValues = {
  name: '',
  price: '',
  currency: 'USD',
  cycle: 'monthly',
  startDate: '',
  nextRenewal: '',
  note: '',
}
