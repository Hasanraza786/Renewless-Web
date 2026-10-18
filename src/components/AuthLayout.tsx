import { Link, Outlet, useMatches } from 'react-router-dom'
import { TAGLINE } from '../constants/brand'

export function AuthLayout() {
  const matches = useMatches()
  const wide = matches.some(match => Boolean((match.handle as { wide?: boolean } | undefined)?.wide))
  return (
    <div className="auth-split">
      <section className="auth-brand">
        <Link to="/" className="wordmark">Renewless</Link>
        <p className="auth-tagline">{TAGLINE}</p>
      </section>
      <section className="auth-panel">
        <div className={wide ? 'auth-card wide' : 'auth-card'}>
          <Outlet />
        </div>
      </section>
    </div>
  )
}
