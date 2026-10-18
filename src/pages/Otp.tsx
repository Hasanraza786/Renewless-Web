import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { forgotPassword, verifyOtp } from '../api_services/auth'
import { OtpInput } from '../components/OtpInput'
import { useDocumentTitle } from '../hooks/usePageChrome'
import { errorMessage } from '../util/values'

export default function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email || ''
  const [code, setCode] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)
  useDocumentTitle('OTP')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (code.length < 6) return
    setBusy(true)
    setFormError('')
    setNotice('')
    try {
      const resetToken = await verifyOtp(email, code)
      navigate('/reset-password', { state: { email, code, resetToken } })
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setResending(true)
    setFormError('')
    setNotice('')
    try {
      await forgotPassword(email)
      setNotice('Code requested again.')
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="form-stack">
        <h1>OTP</h1>
        <p className="support">Start from forgot password so Renewless knows which account the code is for.</p>
        <Link className="btn btn-block" to="/forgot-password">Forgot password</Link>
      </div>
    )
  }

  return (
    <form className="form-stack" noValidate onSubmit={onSubmit}>
      <h1>OTP</h1>
      <p className="support">Enter the six digit code for {email}.</p>
      <OtpInput value={code} onChange={setCode} />
      <button className="btn btn-block" type="submit" disabled={busy || code.length < 6}>
        {busy ? 'Checking…' : 'Continue'}
      </button>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      {notice ? <p className="notice" role="status">{notice}</p> : null}
      <p className="form-switch">
        <button className="text-button" type="button" onClick={resend} disabled={resending}>
          {resending ? 'Requesting…' : 'Resend'}
        </button>
      </p>
    </form>
  )
}
