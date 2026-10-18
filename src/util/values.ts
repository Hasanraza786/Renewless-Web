export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function readString(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

export function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = readString(source[key])
    if (value) return value
  }
  return ''
}

export function firstNumber(objects: Record<string, unknown>[], keys: string[]) {
  for (const source of objects) {
    for (const key of keys) {
      const value = source[key]
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
    }
  }
  return 0
}

export function firstArray(objects: Record<string, unknown>[], keys: string[]) {
  for (const source of objects) {
    for (const key of keys) {
      const value = source[key]
      if (Array.isArray(value)) return value
    }
  }
  return []
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export function errorMessage(error: unknown, fallback = 'Request failed') {
  return error instanceof Error && error.message ? error.message : fallback
}
