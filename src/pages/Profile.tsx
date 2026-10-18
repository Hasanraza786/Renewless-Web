import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../api_services/auth'
import { countryForDial, findCountry, flagEmoji } from '../constants/countries'
import { GENDER_LABELS } from '../constants/subscriptions'
import { usePageChrome } from '../hooks/usePageChrome'
import { useSession } from '../store/session'
import { formatDate } from '../util/dates'
import { errorMessage } from '../util/values'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { session, setSession } = useSession()
  const user = session?.user
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  usePageChrome('Profile')

  async function onLogout() {
    if (!session) return
    setBusy(true)
    setFormError('')
    try {
      await logout(session.token)
      setSession(null)
      navigate('/login', { replace: true })
    } catch (error) {
      setFormError(errorMessage(error))
      setBusy(false)
    }
  }

  if (!user) return null
  const selected = findCountry(user.countryCode || 'US')
  const country = !user.dialCode || selected.dial === user.dialCode ? selected : countryForDial(user.dialCode)
  const dial = user.dialCode || country.dial

  return (
    <div className="page">
      <section className="detail-panel">
        <dl className="facts">
          <div>
            <dt>Name</dt>
            <dd>{user.name || 'Not set'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {user.phone ? (
                <>
                  <span aria-hidden="true">{flagEmoji(country.code)}</span> +{dial} {user.phone}
                </>
              ) : (
                'Not set'
              )}
            </dd>
          </div>
          {user.dateOfBirth ? (
            <div>
              <dt>Date of birth</dt>
              <dd>{formatDate(user.dateOfBirth)}</dd>
            </div>
          ) : null}
          {user.gender ? (
            <div>
              <dt>Gender</dt>
              <dd>{GENDER_LABELS[user.gender]}</dd>
            </div>
          ) : null}
        </dl>
        <div className="form-actions">
          <Link className="btn" to="/profile/edit">Edit profile</Link>
          <Link className="btn btn-secondary" to="/profile/password">Change password</Link>
          <button className="btn btn-secondary" type="button" onClick={onLogout} disabled={busy}>
            {busy ? 'Logging out…' : 'Log out'}
          </button>
        </div>
        {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      </section>
    </div>
  )
}
