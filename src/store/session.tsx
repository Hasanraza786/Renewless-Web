import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '../api_services/http'
import type { Session, User } from '../types'
import { normalizeUser } from '../util/normalize'
import { asRecord, readString } from '../util/values'

const SESSION_KEY = 'renewless-session'

type SessionValue = {
  session: Session | null
  setSession: (next: Session | null) => void
  updateUser: (user: User) => void
}

const SessionContext = createContext<SessionValue | null>(null)

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const record = asRecord(JSON.parse(raw) as unknown)
    const token = readString(record.token)
    if (!token || token === 'local-session') return null
    const user = normalizeUser(record.user ?? record, readString(record.email))
    return { token, user }
  } catch {
    return null
  }
}

function writeSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(readSession)

  const setSession = useCallback((next: Session | null) => {
    setSessionState(next)
    writeSession(next)
  }, [])

  const updateUser = useCallback((user: User) => {
    setSessionState(current => {
      if (!current) return current
      const next = { ...current, user }
      writeSession(next)
      return next
    })
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null))
  }, [setSession])

  const value = useMemo(() => ({ session, setSession, updateUser }), [session, setSession, updateUser])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('Session is missing')
  return value
}
