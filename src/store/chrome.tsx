import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PageAction } from '../types'

type ChromeValue = {
  title: string
  action: PageAction
  setTitle: (title: string) => void
  setAction: (action: PageAction) => void
}

const ChromeContext = createContext<ChromeValue | null>(null)

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Renewless')
  const [action, setAction] = useState<PageAction>(null)
  const value = useMemo(() => ({ title, action, setTitle, setAction }), [action, title])
  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
}

export function useChrome() {
  const value = useContext(ChromeContext)
  if (!value) throw new Error('Page chrome is missing')
  return value
}
