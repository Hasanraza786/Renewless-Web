import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { COUNTRIES, findCountry, flagEmoji } from '../constants/countries'

type PhoneFieldProps = {
  countryCode: string
  dialCode: string
  phone: string
  error?: string
  onCountry: (countryCode: string, dialCode: string) => void
  onPhone: (phone: string) => void
}

export function PhoneField({ countryCode, dialCode, phone, error, onCountry, onPhone }: PhoneFieldProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const country = findCountry(countryCode)
  const dial = dialCode || country.dial

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^\+/, '')
    if (!needle) return COUNTRIES
    return COUNTRIES.filter(item =>
      item.name.toLowerCase().includes(needle) ||
      item.dial.startsWith(needle) ||
      item.code.toLowerCase().includes(needle),
    )
  }, [query])

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="field phone-field" ref={rootRef}>
      <label htmlFor={inputId}>Phone</label>
      <div className="phone-row">
        <button
          type="button"
          className="phone-country"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country and dial code, ${country.name}, +${dial}`}
          onClick={() => setOpen(value => !value)}
        >
          <span className="flag" aria-hidden="true">{flagEmoji(country.code)}</span>
          <span className="dial">+{dial}</span>
          <span className="chevron" aria-hidden="true">▾</span>
        </button>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          value={phone}
          placeholder="Phone number"
          onChange={event => onPhone(event.target.value)}
        />
      </div>
      {open ? (
        <div className="phone-menu">
          <input
            ref={searchRef}
            value={query}
            placeholder="Search countries"
            aria-label="Search countries"
            onChange={event => setQuery(event.target.value)}
          />
          <ul className="phone-options" role="listbox" aria-label="Countries">
            {matches.map(item => (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.code === country.code}
                  onClick={() => {
                    onCountry(item.code, item.dial)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  <span aria-hidden="true">{flagEmoji(item.code)}</span>
                  <span>{item.name}</span>
                  <span className="dial">+{item.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  )
}
