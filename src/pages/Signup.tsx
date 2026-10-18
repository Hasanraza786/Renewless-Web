import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api_services/auth'
import { SelectField, TextField } from '../components/Fields'
import { PhoneField } from '../components/PhoneField'
import { DEFAULT_COUNTRY_CODE, DEFAULT_DIAL_CODE } from '../constants/countries'
import { GENDERS } from '../constants/subscriptions'
import { useDocumentTitle } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { AccountValues } from '../types'
import { errorMessage } from '../util/values'
import { validateSignup } from '../validations_schemas/account'

const EMPTY: AccountValues & { password: string; confirmPassword: string } = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  dialCode: DEFAULT_DIAL_CODE,
  countryCode: DEFAULT_COUNTRY_CODE,
  dateOfBirth: '',
  gender: '',
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { setSession } = useSession()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<ReturnType<typeof validateSignup>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  useDocumentTitle('Signup')

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues(current => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateSignup(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      const session = await signup(values)
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
      <h1>Signup</h1>
      <div className="pair">
        <TextField label="Name" autoComplete="name" value={values.name} error={errors.name} onChange={event => set('name', event.target.value)} />
        <TextField label="Email" type="email" autoComplete="email" value={values.email} error={errors.email} onChange={event => set('email', event.target.value)} />
      </div>
      <div className="pair">
        <TextField label="Password" type="password" autoComplete="new-password" value={values.password} error={errors.password} onChange={event => set('password', event.target.value)} />
        <TextField label="Confirm password" type="password" autoComplete="new-password" value={values.confirmPassword} error={errors.confirmPassword} onChange={event => set('confirmPassword', event.target.value)} />
      </div>
      <div className="triple">
        <PhoneField
          countryCode={values.countryCode}
          dialCode={values.dialCode}
          phone={values.phone}
          error={errors.phone || errors.dialCode}
          onCountry={(countryCode, dialCode) => setValues(current => ({ ...current, countryCode, dialCode }))}
          onPhone={phone => set('phone', phone)}
        />
        <TextField label="Date of birth" type="date" value={values.dateOfBirth} error={errors.dateOfBirth} onChange={event => set('dateOfBirth', event.target.value)} />
        <SelectField
          label="Gender"
          placeholder="Optional"
          value={values.gender}
          error={errors.gender}
          options={GENDERS}
          onChange={event => set('gender', event.target.value as AccountValues['gender'])}
        />
      </div>
      <button className="btn btn-block" type="submit" disabled={busy}>
        {busy ? 'Creating account…' : 'Signup'}
      </button>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <p className="form-switch">
        <Link to="/login">Login</Link>
      </p>
    </form>
  )
}
