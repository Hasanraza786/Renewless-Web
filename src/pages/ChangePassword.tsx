import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../api_services/auth'
import { TextField } from '../components/Fields'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import { errorMessage } from '../util/values'
import { validateChangePassword } from '../validations_schemas/account'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validateChangePassword>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageChrome('Change password')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!session) return
    const nextErrors = validateChangePassword({ currentPassword, password, confirmPassword })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      await changePassword(session.token, currentPassword, password)
      navigate('/profile')
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-stack narrow-form" noValidate onSubmit={onSubmit}>
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        error={errors.currentPassword}
        onChange={event => setCurrentPassword(event.target.value)}
      />
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
      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
      </div>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
    </form>
  )
}
