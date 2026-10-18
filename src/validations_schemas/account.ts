import type { AccountValues, FieldErrors, Gender, SubscriptionFormValues } from '../types'
import { DEFAULT_DIAL_CODE } from '../constants/countries'
import { isIsoDate, localToday } from '../util/dates'
import { digitsOnly } from '../util/values'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function accountErrors(input: AccountValues) {
  const errors: FieldErrors<'name' | 'email' | 'phone' | 'dialCode' | 'dateOfBirth' | 'gender'> = {}
  if (!input.name.trim()) errors.name = 'Name is required'
  if (!EMAIL.test(input.email.trim().toLowerCase())) errors.email = 'Enter a valid email'
  const phone = digitsOnly(input.phone)
  const dialCode = digitsOnly(input.dialCode) || DEFAULT_DIAL_CODE
  if (!phone) errors.phone = 'Enter a phone number'
  else if (!/^[1-9]\d{7,14}$/.test(`${dialCode}${phone}`)) {
    errors.phone = 'Enter a phone number with the country code'
  }
  if (!dialCode) errors.dialCode = 'Choose a country'
  if (input.dateOfBirth) {
    if (!isIsoDate(input.dateOfBirth)) errors.dateOfBirth = 'Enter a valid date'
    else if (input.dateOfBirth > localToday()) errors.dateOfBirth = 'Date of birth cannot be in the future'
  }
  if (input.gender && input.gender !== 'male' && input.gender !== 'female' && input.gender !== 'other') {
    errors.gender = 'Choose Male, Female, or Other'
  }
  return errors
}

export function validateLogin(input: { email: string; password: string }) {
  const errors: FieldErrors<'email' | 'password'> = {}
  if (!EMAIL.test(input.email.trim().toLowerCase())) errors.email = 'Enter a valid email'
  if (input.password.length < 8) errors.password = 'Password must be at least 8 characters'
  return errors
}

export function validateSignup(input: AccountValues & { password: string; confirmPassword: string }) {
  const errors: FieldErrors<
    'name' | 'email' | 'phone' | 'dialCode' | 'dateOfBirth' | 'gender' | 'password' | 'confirmPassword'
  > = { ...accountErrors(input) }
  if (input.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export function validateProfile(input: AccountValues) {
  return accountErrors(input)
}

export function validateForgot(input: { email: string }) {
  const errors: FieldErrors<'email'> = {}
  if (!EMAIL.test(input.email.trim().toLowerCase())) errors.email = 'Enter a valid email'
  return errors
}

export function validateReset(input: { password: string; confirmPassword: string }) {
  const errors: FieldErrors<'password' | 'confirmPassword'> = {}
  if (input.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export function validateChangePassword(input: {
  currentPassword: string
  password: string
  confirmPassword: string
}) {
  const errors: FieldErrors<'currentPassword' | 'password' | 'confirmPassword'> = {}
  if (!input.currentPassword) errors.currentPassword = 'Enter your current password'
  if (input.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export function validateSubscription(input: SubscriptionFormValues) {
  const errors: FieldErrors<'name' | 'price' | 'currency' | 'cycle' | 'startDate' | 'nextRenewal' | 'note'> = {}
  if (!input.name.trim()) errors.name = 'Company is required'
  const price = Number(input.price.replace(/,/g, ''))
  if (!input.price.trim() || !Number.isFinite(price) || price < 0) errors.price = 'Enter a price'
  if (!/^[A-Za-z]{3}$/.test(input.currency.trim())) errors.currency = 'Pick a currency'
  if (!input.cycle) errors.cycle = 'Pick a cycle'
  if (!isIsoDate(input.startDate)) errors.startDate = 'Enter a start date'
  if (!isIsoDate(input.nextRenewal)) errors.nextRenewal = 'Enter a renewal date'
  if (input.note.trim().length > 280) errors.note = 'Note is too long'
  return errors
}

export function validateConnector(input: { email: string }) {
  const errors: FieldErrors<'email'> = {}
  if (!EMAIL.test(input.email.trim().toLowerCase())) errors.email = 'Enter a valid email'
  return errors
}

export function profileBody(input: AccountValues) {
  const dialCode = digitsOnly(input.dialCode) || DEFAULT_DIAL_CODE
  const phone = digitsOnly(input.phone)
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: `+${dialCode}${phone}`,
    dateOfBirth: input.dateOfBirth || null,
    gender: (input.gender || null) as Gender | null,
  }
}

export function subscriptionBody(input: SubscriptionFormValues, includeSource: boolean) {
  const name = input.name.trim()
  const price = Math.round((Number(input.price.replace(/,/g, '')) + Number.EPSILON) * 100) / 100
  return {
    name,
    price,
    currency: input.currency.trim().toUpperCase(),
    cycle: input.cycle,
    startDate: input.startDate,
    nextRenewal: input.nextRenewal,
    note: input.note.trim(),
    ...(includeSource ? { renewalSource: 'user' as const } : {}),
  }
}
