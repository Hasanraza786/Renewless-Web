import { normalizeDashboard } from '../util/normalize'
import { request, withToday } from './http'

export function getDashboard(token: string) {
  return request<unknown>(withToday('/dashboard'), { token }).then(normalizeDashboard)
}
