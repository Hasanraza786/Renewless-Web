import { countryForDial, findCountry } from '../constants/countries'
import type { AccountValues, Session, User } from '../types'
import { normalizeUser } from '../util/normalize'
import { asRecord, digitsOnly, firstString } from '../util/values'
import { profileBody } from '../validations_schemas/account'
import { ApiError, request } from './http'

function readToken(data: unknown) {
  const record = asRecord(data)
  return firstString(record, ['token', 'accessToken'])
}

export function sessionFromAuth(data: unknown, fallback: Partial<AccountValues> & { email: string }): Session {
  const token = readToken(data)
  if (!token) throw new ApiError(0, 'Sign in failed')
  const normalized = normalizeUser(data, fallback.email)
  const dialCode = normalized.dialCode || digitsOnly(fallback.dialCode || '') || '1'
  const preferred = (normalized.countryCode || fallback.countryCode || '').toUpperCase()
  const preferredCountry = preferred ? findCountry(preferred) : null
  const countryCode =
    preferredCountry && preferredCountry.dial === dialCode
      ? preferredCountry.code
      : countryForDial(dialCode).code
  return {
    token,
    user: {
      id: normalized.id,
      name: normalized.name || fallback.name || '',
      email: normalized.email || fallback.email,
      phone: normalized.phone || digitsOnly(fallback.phone || ''),
      dialCode,
      countryCode,
      dateOfBirth: normalized.dateOfBirth ?? (fallback.dateOfBirth || null),
      gender: normalized.gender ?? (fallback.gender || null),
    },
  }
}

export function login(email: string, password: string) {
  return request<unknown>('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  }).then(data => sessionFromAuth(data, { email: email.trim().toLowerCase() }))
}

export function signup(input: AccountValues & { password: string }) {
  const body = { ...profileBody(input), password: input.password }
  return request<unknown>('/auth/signup', { method: 'POST', body }).then(data =>
    sessionFromAuth(data, { ...input, email: body.email }),
  )
}

export function forgotPassword(email: string) {
  return request<unknown>('/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  })
}

export function verifyOtp(email: string, code: string) {
  return request<unknown>('/auth/verify-otp', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), code },
  }).then(data => {
    const record = asRecord(data)
    const named = firstString(record, ['resetToken', 'reset_token'])
    if (named) return named
    if (!record.user) return firstString(record, ['token'])
    return ''
  })
}

export function resetPassword(input: { email: string; code: string; password: string; resetToken: string }) {
  return request<unknown>('/auth/reset-password', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  })
}

export function changePassword(token: string, currentPassword: string, newPassword: string) {
  return request<unknown>('/auth/change-password', {
    method: 'POST',
    body: { currentPassword, password: newPassword },
    token,
  })
}

export function updateProfile(token: string, input: AccountValues, current: User) {
  return request<unknown>('/auth/profile', {
    method: 'PATCH',
    body: profileBody(input),
    token,
  }).then(data => {
    const normalized = normalizeUser(data, current.email)
    const useful = Boolean(normalized.email || normalized.name || normalized.phone)
    const base = useful ? { ...current, ...normalized, id: normalized.id || current.id } : current
    const saved = profileBody(input)
    return {
      ...base,
      name: saved.name,
      email: saved.email,
      phone: digitsOnly(input.phone),
      dialCode: digitsOnly(input.dialCode) || '1',
      countryCode: (input.countryCode || current.countryCode || 'US').toUpperCase(),
      dateOfBirth: saved.dateOfBirth,
      gender: saved.gender,
    }
  })
}

export function logout(token: string) {
  return request<unknown>('/auth/logout', { method: 'POST', token })
}
