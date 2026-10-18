import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../store/session'
import { useChrome } from '../store/chrome'
import { BellIcon, MenuIcon } from './Icons'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/profile', label: 'Profile' },
  { to: '/connectors', label: 'Connectors' },
]

export function AppShell() {
  const { session } = useSession()
  const { title, action } = useChrome()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 760px)').matches)
  const account = session?.user.name || session?.user.email || 'Account'

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 760px)')
    const onChange = () => {
      setWide(media.matches)
      if (media.matches) setOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="shell">
      {open ? <button className="backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside className={open ? 'sidebar open' : 'sidebar'} inert={!wide && !open ? true : undefined}>
        <Link to="/dashboard" className="wordmark">Renewless</Link>
        <nav className="side-nav" aria-label="App">
          {LINKS.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'side-link active' : 'side-link')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-title">
            <button className="menu-btn" type="button" aria-expanded={open} aria-label="Open menu" onClick={() => setOpen(true)}>
              <MenuIcon />
            </button>
            <h1>{title}</h1>
          </div>
          <div className="topbar-tools">
            {action === 'add-subscription' ? (
              <Link className="btn btn-small" to="/subscriptions/new">Add</Link>
            ) : null}
            {action === 'add-connector' ? (
              <Link className="btn btn-small" to="/connectors/new">Add</Link>
            ) : null}
            <Link
              className={location.pathname === '/notifications' ? 'icon-button active' : 'icon-button'}
              to="/notifications"
              aria-label="Notifications"
            >
              <BellIcon />
            </Link>
            <Link className="account-link" to="/profile">{account}</Link>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
