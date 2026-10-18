import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api_services/auth'
import { TextField } from '../components/Fields'
import { useDocumentTitle } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import { errorMessage } from '../util/values'
import { validateLogin } from '../validations_schemas/account'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useSession()
  const notice = (location.state as { notice?: string } | null)?.notice || ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validateLogin>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  useDocumentTitle('Login')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateLogin({ email, password })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      const session = await login(email, password)
      setSession(session)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-stack" noValidate onSubmit={onSubmit}>
      <h1>Login</h1>
      {notice ? <p className="notice" role="status">{notice}</p> : null}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={event => setEmail(event.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        error={errors.password}
        onChange={event => setPassword(event.target.value)}
      />
      <button className="btn btn-block" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Login'}
      </button>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <p className="form-switch">
        <Link to="/signup">Signup</Link>
        <Link to="/forgot-password">Forgot password</Link>
      </p>
    </form>
  )
}
