import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

export function OtpInput({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '')

  function write(next: string) {
    onChange(next.replace(/\D/g, '').slice(0, 6))
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const text = event.clipboardData.getData('text')
    if (!/\d/.test(text)) return
    event.preventDefault()
    const next = text.replace(/\D/g, '').slice(0, 6)
    write(next)
    refs.current[Math.min(next.length, 5)]?.focus()
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const next = digits.slice()
      next[index - 1] = ''
      write(next.join(''))
      refs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="otp" onPaste={onPaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={node => {
            refs.current[index] = node
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={digit}
          onChange={event => {
            const cleaned = event.target.value.replace(/\D/g, '')
            if (!cleaned) {
              const next = digits.slice()
              next[index] = ''
              write(next.join(''))
              return
            }
            const next = digits.slice()
            next[index] = cleaned.slice(-1)
            write(next.join(''))
            if (index < 5) refs.current[index + 1]?.focus()
          }}
          onKeyDown={event => onKeyDown(index, event)}
        />
      ))}
    </div>
  )
}
