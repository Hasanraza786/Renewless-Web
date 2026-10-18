import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resetPassword } from '../api_services/auth'
import { TextField } from '../components/Fields'
import { useDocumentTitle } from '../hooks/usePageChrome'
import { errorMessage } from '../util/values'
import { validateReset } from '../validations_schemas/account'

type ResetState = { email?: string; code?: string; resetToken?: string }

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ResetState | null) || {}
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validateReset>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  useDocumentTitle('Reset password')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateReset({ password, confirmPassword })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      await resetPassword({
        email: state.email || '',
        code: state.code || '',
        password,
        resetToken: state.resetToken || '',
      })
      navigate('/login', { replace: true, state: { notice: 'Password updated. Log in with the new password.' } })
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  if (!state.email && !state.resetToken) {
    return (
      <div className="form-stack">
        <h1>Reset password</h1>
        <p className="support">Enter the code from forgot password before choosing a new password.</p>
        <Link className="btn btn-block" to="/forgot-password">Forgot password</Link>
      </div>
    )
  }

  return (
    <form className="form-stack" noValidate onSubmit={onSubmit}>
      <h1>Reset password</h1>
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        value={password}
        error={errors.password}
        onChange={event => setPassword(event.target.value)}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        error={errors.confirmPassword}
        onChange={event => setConfirmPassword(event.target.value)}
      />
      <button className="btn btn-block" type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Reset password'}
      </button>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
    </form>
  )
}
