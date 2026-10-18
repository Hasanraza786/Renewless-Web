import type { Cycle, Gender, RenewalSource, Subscription, SubscriptionStatus, User } from '../types'
import { splitInternationalPhone } from '../constants/countries'
import { formatMoney } from './money'
import { isIsoDate, localToday, statusFor } from './dates'
import { asRecord, digitsOnly, firstArray, firstNumber, firstString, readString } from './values'

function readCycle(value: unknown): Cycle {
  const raw = readString(value).toLowerCase()
  if (raw === 'weekly' || raw === 'monthly' || raw === 'yearly' || raw === 'custom') return raw
  return 'monthly'
}

function readSource(value: unknown): RenewalSource {
  const raw = readString(value).toLowerCase()
  if (raw === 'predicted' || raw === 'estimated') return 'predicted'
  if (raw === 'confirmed') return 'confirmed'
  return 'user'
}

function readStatus(value: unknown, nextRenewal: string): SubscriptionStatus {
  const raw = readString(value).toLowerCase().replace(/[\s-]/g, '_')
  if (raw === 'expired') return 'expired'
  if (raw === 'in_progress' || raw === 'inprogress') return 'in_progress'
  if (raw === 'upcoming') return 'upcoming'
  return statusFor(nextRenewal, localToday())
}

function readPrice(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round((value + Number.EPSILON) * 100) / 100
  }
  const number = Number(readString(value).replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(number)) return 0
  return Math.round((number + Number.EPSILON) * 100) / 100
}

function readGender(value: unknown): Gender | null {
  const raw = readString(value).toLowerCase()
  if (raw === 'male' || raw === 'female' || raw === 'other') return raw
  return null
}

function readDate(value: unknown) {
  const raw = readString(value).slice(0, 10)
  return isIsoDate(raw) ? raw : null
}

function readDial(source: Record<string, unknown>) {
  const direct = firstString(source, ['dialCode', 'callingCode', 'phoneCode', 'countryDialCode'])
  if (direct) return digitsOnly(direct)
  const countryCode = readString(source.countryCode)
  if (/^\d+$/.test(countryCode)) return countryCode
  return ''
}

function readIso(source: Record<string, unknown>) {
  const candidates = [source.countryCode, source.country, source.countryIso, source.iso2]
  for (const value of candidates) {
    const raw = readString(value).toUpperCase()
    if (/^[A-Z]{2}$/.test(raw)) return raw
  }
  return ''
}

export function normalizeSubscription(raw: unknown, index = 0): Subscription {
  const source = asRecord(raw)
  const name = firstString(source, ['name', 'company', 'subscriptionName'])
  const nextRenewal = firstString(source, ['nextRenewal', 'renewDate', 'renewalDate', 'date']).slice(0, 10)
  return {
    id: firstString(source, ['id', '_id']) || `subscription-${index}`,
    name,
    price: readPrice(source.price ?? source.amount),
    currency: (firstString(source, ['currency']) || 'USD').toUpperCase(),
    cycle: readCycle(source.cycle),
    startDate: firstString(source, ['startDate', 'start']).slice(0, 10),
    nextRenewal: isIsoDate(nextRenewal) ? nextRenewal : nextRenewal,
    renewalSource: readSource(source.renewalSource ?? source.dateStatus),
    status: readStatus(source.status, nextRenewal),
    note: firstString(source, ['note', 'notes']),
  }
}

export function normalizeSubscriptionList(data: unknown) {
  if (Array.isArray(data)) return data.map((item, index) => normalizeSubscription(item, index))
  const source = asRecord(data)
  const nested = asRecord(source.subscription)
  if (Object.keys(nested).length > 0 && !Array.isArray(source.subscriptions)) {
    return [normalizeSubscription(nested)]
  }
  return firstArray([source], ['subscriptions', 'items']).map((item, index) => normalizeSubscription(item, index))
}

export function normalizeSubscriptionOne(data: unknown) {
  const source = asRecord(data)
  const nested = asRecord(source.subscription)
  const record = Object.keys(nested).length > 0 ? nested : source
  return normalizeSubscription(record)
}

export function normalizeUser(raw: unknown, fallbackEmail = ''): User {
  const outer = asRecord(raw)
  const nested = asRecord(outer.user)
  const source = Object.keys(nested).length > 0 ? nested : outer
  const rawPhone = firstString(source, ['phone', 'phoneNumber', 'nationalNumber'])
  const split = splitInternationalPhone(rawPhone)
  return {
    id: firstString(source, ['id', '_id']),
    name: firstString(source, ['name']),
    email: firstString(source, ['email']) || fallbackEmail,
    phone: split ? split.phone : digitsOnly(rawPhone),
    dialCode: readDial(source) || split?.dialCode || '',
    countryCode: readIso(source),
    dateOfBirth: readDate(source.dateOfBirth ?? source.dob),
    gender: readGender(source.gender),
  }
}

export function formatMonthTotal(value: unknown, currencyHint = 'USD'): string {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return formatMoney(value, currencyHint)
  if (Array.isArray(value)) {
    const parts = value.map(item => formatMonthTotal(item, currencyHint)).filter(Boolean)
    return parts.join(' + ') || formatMoney(0, currencyHint)
  }
  if (value && typeof value === 'object') {
    const record = asRecord(value)
    if ('amount' in record || 'total' in record || 'value' in record) {
      const amount = record.amount ?? record.total ?? record.value
      const currency = readString(record.currency) || currencyHint
      return formatMoney(typeof amount === 'number' ? amount : Number(amount) || 0, currency)
    }
    const entries = Object.entries(record).filter(
      (entry): entry is [string, number] => /^[A-Za-z]{3}$/.test(entry[0]) && typeof entry[1] === 'number',
    )
    if (entries.length) {
      return entries.map(([currency, amount]) => formatMoney(amount, currency.toUpperCase())).join(' + ')
    }
  }
  return formatMoney(0, currencyHint)
}

export function normalizeDashboard(data: unknown) {
  const root = asRecord(data)
  const counts = asRecord(root.counts)
  const stats = asRecord(root.stats)
  const sources = [counts, stats, root]
  const currency = firstString(root, ['currency']) || firstString(counts, ['currency']) || 'USD'
  const monthValue = ['thisMonth', 'monthTotal', 'thisMonthTotal', 'monthlyTotal'].reduce<unknown>(
    (found, key) => found ?? counts[key] ?? stats[key] ?? root[key],
    undefined,
  )
  const upcoming = firstArray(sources, ['upcoming', 'upcomingSubscriptions', 'next']).map((item, index) =>
    normalizeSubscription(item, index),
  )
  upcoming.sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal))
  return {
    active: firstNumber(sources, ['active', 'activeSubscriptions', 'activeCount']),
    renewingIn7Days: firstNumber(sources, ['renewingIn7Days', 'renewingInNext7Days', 'renewingSoon', 'dueSoon']),
    monthTotal: formatMonthTotal(monthValue, currency),
    expired: firstNumber(sources, ['expired', 'expiredCount']),
    upcoming: upcoming.slice(0, 3),
  }
}

export function normalizeNotices(data: unknown) {
  const source = Array.isArray(data) ? { notifications: data } : asRecord(data)
  return firstArray([source], ['notifications', 'items']).map((item, index) => {
    const record = asRecord(item)
    const renewalSource = readString(record.renewalSource || record.dateStatus).toLowerCase()
    const estimated =
      record.estimated === true || renewalSource === 'predicted' || renewalSource === 'estimated'
    return {
      id: firstString(record, ['id', '_id']) || `notice-${index}`,
      name: firstString(record, ['name', 'subscriptionName', 'company']),
      date: firstString(record, ['date', 'renewDate', 'nextRenewal', 'renewalDate']).slice(0, 10),
      estimated,
    }
  })
}

export function normalizeConnectors(data: unknown) {
  const source = Array.isArray(data) ? { connectors: data } : asRecord(data)
  return firstArray([source], ['connectors', 'accounts', 'items']).map((item, index) => {
    const record = asRecord(item)
    const lastSync = firstString(record, ['lastSync', 'lastSyncedAt', 'syncedAt'])
    return {
      id: firstString(record, ['id', '_id']) || `connector-${index}`,
      email: firstString(record, ['email', 'address']),
      status: firstString(record, ['status']),
      lastSync: lastSync || null,
    }
  })
}

export function normalizeReview(data: unknown) {
  const source = Array.isArray(data) ? { items: data } : asRecord(data)
  return firstArray([source], ['items', 'subscriptions', 'review']).map((item, index) => {
    const record = asRecord(item)
    const nextRenewal = firstString(record, ['nextRenewal', 'renewDate', 'renewalDate', 'date']).slice(0, 10)
    return {
      id: firstString(record, ['id', '_id', 'itemId']) || `review-${index}`,
      name: firstString(record, ['name', 'company']),
      price: readPrice(record.price ?? record.amount),
      currency: (firstString(record, ['currency']) || 'USD').toUpperCase(),
      nextRenewal,
    }
  })
}
