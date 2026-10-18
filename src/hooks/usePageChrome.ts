import { useEffect, useLayoutEffect } from 'react'
import type { PageAction } from '../types'
import { useChrome } from '../store/chrome'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Renewless` : 'Renewless'
  }, [title])
}

export function usePageChrome(title: string, action: PageAction = null) {
  const { setTitle, setAction } = useChrome()
  useDocumentTitle(title)
  useLayoutEffect(() => {
    setTitle(title)
    setAction(action)
    return () => setAction(null)
  }, [action, setAction, setTitle, title])
}
