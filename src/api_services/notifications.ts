import { normalizeNotices } from '../util/normalize'
import { request } from './http'

export function listNotifications(token: string) {
  return request<unknown>('/notifications', { token }).then(normalizeNotices)
}
