import { normalizeConnectors, normalizeReview } from '../util/normalize'
import { request } from './http'

export function listConnectors(token: string) {
  return request<unknown>('/connectors', { token }).then(normalizeConnectors)
}

export function createConnector(token: string, email: string) {
  return request<unknown>('/connectors', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
    token,
  })
}

export function listReview(token: string, connectorId: string) {
  return request<unknown>(`/connectors/${connectorId}/review`, { token }).then(normalizeReview)
}

export function addReviewItem(token: string, itemId: string) {
  return request<unknown>(`/review/${itemId}/add`, { method: 'POST', token })
}

export function dismissReviewItem(token: string, itemId: string) {
  return request<unknown>(`/review/${itemId}/dismiss`, { method: 'POST', token })
}
