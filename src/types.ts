export type Cycle = 'weekly' | 'monthly' | 'yearly' | 'custom'
export type RenewalSource = 'confirmed' | 'predicted' | 'user'
export type SubscriptionStatus = 'upcoming' | 'in_progress' | 'expired'
export type Gender = 'male' | 'female' | 'other'
export type PageAction = 'add-subscription' | 'add-connector' | null

export type Subscription = {
  id: string
  name: string
  price: number
  currency: string
  cycle: Cycle
  startDate: string
  nextRenewal: string
  renewalSource: RenewalSource
  status: SubscriptionStatus
  note: string
}

export type SubscriptionFormValues = {
  name: string
  price: string
  currency: string
  cycle: Cycle
  startDate: string
  nextRenewal: string
  note: string
}

export type User = {
  id: string
  name: string
  email: string
  phone: string
  dialCode: string
  countryCode: string
  dateOfBirth: string | null
  gender: Gender | null
}

export type Session = {
  token: string
  user: User
}

export type AccountValues = {
  name: string
  email: string
  phone: string
  dialCode: string
  countryCode: string
  dateOfBirth: string
  gender: '' | Gender
}

export type DashboardData = {
  active: number
  renewingIn7Days: number
  monthTotal: string
  expired: number
  upcoming: Subscription[]
}

export type RenewalNotice = {
  id: string
  name: string
  date: string
  estimated: boolean
}

export type Connector = {
  id: string
  email: string
  status: string
  lastSync: string | null
}

export type ReviewItem = {
  id: string
  name: string
  price: number
  currency: string
  nextRenewal: string
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>
