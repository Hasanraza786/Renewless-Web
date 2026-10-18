import type { SubscriptionFormValues } from '../types'
import { normalizeSubscriptionList, normalizeSubscriptionOne } from '../util/normalize'
import { subscriptionBody } from '../validations_schemas/account'
import { request, withToday } from './http'

function saveSubscription(
  token: string,
  path: string,
  method: 'POST' | 'PATCH',
  input: SubscriptionFormValues,
  includeSource: boolean,
) {
  return request<unknown>(withToday(path), {
    method,
    body: subscriptionBody(input, includeSource),
    token,
  }).then(normalizeSubscriptionOne)
}

export function listSubscriptions(token: string) {
  return request<unknown>(withToday('/subscriptions'), { token }).then(normalizeSubscriptionList)
}

export function getSubscription(token: string, id: string) {
  return request<unknown>(withToday(`/subscriptions/${id}`), { token }).then(normalizeSubscriptionOne)
}

export function createSubscription(token: string, input: SubscriptionFormValues) {
  return saveSubscription(token, '/subscriptions', 'POST', input, true)
}

export function updateSubscription(token: string, id: string, input: SubscriptionFormValues) {
  return saveSubscription(token, `/subscriptions/${id}`, 'PATCH', input, false)
}

export function deleteSubscription(token: string, id: string) {
  return request<unknown>(`/subscriptions/${id}`, { method: 'DELETE', token })
}
