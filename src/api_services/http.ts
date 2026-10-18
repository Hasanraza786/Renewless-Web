import { API_BASE_URL } from '../config/api'
import { localToday } from '../util/dates'
import { asRecord, readString } from '../util/values'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

function errorText(data: unknown) {
  const record = asRecord(data)
  const error = readString(record.error)
  if (error) return error
  const message = readString(record.message)
  if (message) return message
  if (Array.isArray(record.errors) && typeof record.errors[0] === 'string') return record.errors[0]
  return 'Request failed'
}

export async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "Can't reach the server. Start the backend and try again.")
  }

  const text = await response.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = {}
    }
  }

  if (!response.ok) {
    const authPath = path.startsWith('/auth/')
    if (response.status === 401 && token && !authPath) onUnauthorized?.()
    throw new ApiError(response.status, errorText(data))
  }

  return data as T
}

export function withToday(path: string) {
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}today=${localToday()}`
}
