import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MenuIcon } from '../components/Icons'
import { TAGLINE } from '../constants/brand'
import { useDocumentTitle } from '../hooks/usePageChrome'

const STEPS = [
  {
    title: 'Add it',
    body: 'Add a subscription, or connect a Gmail account.',
  },
  {
    title: 'Review it',
    body: 'Review what was found, and keep only what you want.',
  },
  {
    title: 'See it coming',
    body: 'See what renews next, before it charges.',
  },
]

const FEATURES = [
  {
    title: 'Dashboard counts',
    body: 'See how many subscriptions are active, what renews in the next 7 days, what this month costs, and what has expired.',
  },
  {
    title: 'Subscription list',
    body: 'Search the list, then filter upcoming, in progress, and expired, with the price, dates, status, and any note you saved.',
  },
  {
    title: 'Gmail connectors and review',
    body: 'Connect a Gmail address, then add or dismiss the renewals found in that inbox before they join your list.',
  },
  {
    title: 'Reminders',
    body: 'Open a notice for each coming renewal, with the date and whether that date is confirmed or estimated.',
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  useDocumentTitle('')

  return (
    <div className="public">
      <header className="public-bar">
        <Link to="/" className="wordmark">Renewless</Link>
        <div className="public-right">
          <a className="nav-wide" href="#how-it-works">How it works</a>
          <a className="nav-wide" href="#features">Features</a>
          <Link to="/login">Login</Link>
          <Link className="btn btn-small btn-mint" to="/signup">Signup</Link>
          <button
            className="menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-label="Open menu"
            onClick={() => setMenuOpen(value => !value)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>
      {menuOpen ? (
        <div className="public-menu">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        </div>
      ) : null}

      <section className="hero">
        <h1>Know which renewals are worth keeping.</h1>
        <p className="tagline">{TAGLINE}</p>
        <p className="support">Add what you pay for, or connect a Gmail account and keep only the renewals you still want.</p>
        <div className="hero-actions">
          <Link className="btn btn-mint" to="/signup">Signup</Link>
          <Link className="btn btn-secondary" to="/login">Login</Link>
        </div>
      </section>

      <section className="band" id="how-it-works">
        <div className="band-inner">
          <h2>How it works</h2>
          <div className="steps">
            {STEPS.map((step, index) => (
              <article className="info-card" key={step.title}>
                <span className="step-index">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="features">
        <div className="band-inner">
          <h2>Features</h2>
          <div className="features">
            {FEATURES.map(feature => (
              <article className="info-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="questions">
        <div className="band-inner">
          <h2>Questions</h2>
          <div className="questions">
            <article>
              <h3>What does Renewless do?</h3>
              <p>It keeps the subscriptions you still want in one list and shows the next renewal before it charges. You cancel on the service itself.</p>
            </article>
            <article>
              <h3>Do I have to connect a bank?</h3>
              <p>No. A bank connection is not required.</p>
            </article>
            <article>
              <h3>How is a Gmail connector used?</h3>
              <p>You add a Gmail address. Renewless lists the renewal mail it finds in that inbox, and you choose what to add or dismiss.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="band-inner">
          <h2>{TAGLINE}</h2>
          <Link className="btn btn-mint" to="/signup">Signup</Link>
          <p>The account is created on the next page.</p>
        </div>
      </section>

      <footer className="site-footer">
        <span>Renewless</span>
        <nav className="footer-links" aria-label="Account">
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </nav>
      </footer>
    </div>
  )
}
