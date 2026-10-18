import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createConnector } from '../api_services/connectors'
import { TextField } from '../components/Fields'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import { errorMessage } from '../util/values'
import { validateConnector } from '../validations_schemas/account'

export default function AddConnectorPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validateConnector>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageChrome('Add connector')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!session) return
    const nextErrors = validateConnector({ email })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      await createConnector(session.token, email)
      navigate('/connectors')
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-stack narrow-form" noValidate onSubmit={onSubmit}>
      <p className="support">Renewless reads renewal mail from that inbox.</p>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={event => setEmail(event.target.value)}
      />
      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
      </div>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
    </form>
  )
}
