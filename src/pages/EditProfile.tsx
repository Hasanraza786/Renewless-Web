import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../api_services/auth'
import { SelectField, TextField } from '../components/Fields'
import { PhoneField } from '../components/PhoneField'
import { DEFAULT_COUNTRY_CODE, DEFAULT_DIAL_CODE } from '../constants/countries'
import { GENDERS } from '../constants/subscriptions'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import type { AccountValues } from '../types'
import { errorMessage } from '../util/values'
import { validateProfile } from '../validations_schemas/account'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { session, updateUser } = useSession()
  const user = session?.user
  const [values, setValues] = useState<AccountValues>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dialCode: user?.dialCode || DEFAULT_DIAL_CODE,
    countryCode: user?.countryCode || DEFAULT_COUNTRY_CODE,
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  })
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageChrome('Edit profile')

  function set<K extends keyof AccountValues>(key: K, value: AccountValues[K]) {
    setValues(current => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!session) return
    const nextErrors = validateProfile(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    setBusy(true)
    try {
      const next = await updateProfile(session.token, values, session.user)
      updateUser(next)
      navigate('/profile')
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-stack form-page" noValidate onSubmit={onSubmit}>
      <div className="pair">
        <TextField label="Name" autoComplete="name" value={values.name} error={errors.name} onChange={event => set('name', event.target.value)} />
        <TextField label="Email" type="email" autoComplete="email" value={values.email} error={errors.email} onChange={event => set('email', event.target.value)} />
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
      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
      </div>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
    </form>
  )
}
