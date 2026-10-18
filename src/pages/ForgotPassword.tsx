import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api_services/auth'
import { TextField } from '../components/Fields'
import { useDocumentTitle } from '../hooks/usePageChrome'
import { errorMessage } from '../util/values'
import { validateForgot } from '../validations_schemas/account'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validateForgot>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  useDocumentTitle('Forgot password')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateForgot({ email })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      await forgotPassword(email)
      navigate('/otp', { state: { email: email.trim().toLowerCase() } })
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-stack" noValidate onSubmit={onSubmit}>
      <h1>Forgot password</h1>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={event => setEmail(event.target.value)}
      />
      <button className="btn btn-block" type="submit" disabled={busy}>
        {busy ? 'Sending…' : 'Continue'}
      </button>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <p className="form-switch">
        <Link to="/login">Login</Link>
      </p>
    </form>
  )
}
