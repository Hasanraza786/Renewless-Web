// Scroll reveal, count-up, sticky feature screens and phone tilt.
// Without JS or with Reduced Motion the page still shows everything (first screen in the showcase).
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

function countUp(el) {
  const end = Number(el.dataset.count)
  const prefix = el.dataset.prefix || ''
  if (reduce || end === 0) return
  const start = performance.now()
  const tick = now => {
    const t = Math.min((now - start) / 1200, 1)
    el.textContent = prefix + Math.round(end * (1 - (1 - t) ** 3))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const reveal = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    entry.target.classList.add('in')
    entry.target.querySelectorAll('[data-count]').forEach(countUp)
    reveal.unobserve(entry.target)
  }
}, { threshold: 0.15 })
document.querySelectorAll('[data-reveal], .numbers').forEach(el => reveal.observe(el))

// Features: the text block in the middle of the screen picks the sticky phone's screen.
const shots = document.querySelectorAll('.showcase-phone img')
const steps = document.querySelectorAll('.sc-step')
const pick = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    const i = Number(entry.target.dataset.i)
    steps.forEach(s => s.classList.toggle('on', s === entry.target))
    shots.forEach((img, n) => img.classList.toggle('on', n === i))
  }
}, { rootMargin: '-45% 0px -45% 0px' })
steps.forEach(s => pick.observe(s))

// Hover tilt on phones, only with a mouse.
if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  for (const el of document.querySelectorAll('.tilt')) {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`
    })
    el.addEventListener('mouseleave', () => { el.style.transform = '' })
  }
}

// Hero scene: tap Connect Gmail (or Outlook) -> the phone slides left and the inbox opens; the search filters it;
// the billing emails fly into the app's list; tap Save -> ready, and a reminder arrives.
const stage = document.querySelector('.stage')
if (stage) {
  const phone = stage.querySelector('.phone')
  const mails = [...stage.querySelectorAll('.mail')]
  const bills = mails.filter(m => m.classList.contains('bill'))
  const slots = [...stage.querySelectorAll('.slot')]
  const covers = [...stage.querySelectorAll('.cover')]
  const q = stage.querySelector('.q')
  const found = stage.querySelector('.found')
  const live = stage.querySelector('[aria-live]')
  let run = 0 // bumped on every start/replay so an older timeline stops

  const sleep = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 120) : ms))
  const set = st => { stage.dataset.state = st }
  // the steps bar above the scene: step n fills over ms, earlier ones show done
  const steps = [...document.querySelectorAll('.steps li')]
  const step = (n, ms) => steps.forEach((li, i) => {
    li.classList.toggle('done', i < n); li.classList.toggle('on', i === n)
    if (i === n) li.style.setProperty('--d', ms + 'ms')
  })
  const say = text => { live.textContent = text }
  // The same sample inbox, shown as Gmail or Outlook. Outlook search is by subject only, like the backend's Outlook scan.
  const host = stage.querySelector('.gbar span'), logo = stage.querySelector('.gm')
  const providers = {
    gmail: { name: 'Gmail', host: 'mail.google.com', logo: '/logos/gmail.svg', q: q.dataset.q },
    outlook: { name: 'Outlook', host: 'outlook.live.com', logo: '/logos/outlook.svg', q: 'subject:(receipt OR invoice OR subscription OR renewal OR trial)' },
  }
  steps.forEach(li => { li.dataset.t = li.textContent })
  let p = providers.gmail
  const use = key => {
    p = providers[key]
    host.textContent = p.host; logo.src = p.logo
    steps.forEach(li => { li.textContent = li.dataset.t.replace('Gmail', p.name) })
  }
  const rect = el => {
    const a = el.getBoundingClientRect(), s = stage.getBoundingClientRect()
    return { left: a.left - s.left, top: a.top - s.top, width: a.width, height: a.height }
  }
  // Copy the email into the stage and move it, in an arc, onto its row in the phone.
  const fly = (mail, row) => {
    if (reduce) return Promise.resolve()
    const from = rect(mail), to = rect(row)
    const card = mail.cloneNode(true)
    card.className = 'mail flyer'
    Object.assign(card.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' })
    stage.append(card)
    mail.classList.add('sent') // the original stays behind, marked as added
    const lift = Math.min(from.top, to.top) - 60
    const anim = card.animate([
      { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', opacity: 1 },
      { left: (from.left + to.left) / 2 + 'px', top: lift + 'px', width: (from.width + to.width) / 2 + 'px', height: from.height + 'px', opacity: 1, offset: .45 },
      { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: to.height + 'px', opacity: .9, offset: .92 },
      { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: to.height + 'px', opacity: 0 },
    ], { duration: 1100, easing: 'cubic-bezier(.5, 0, .2, 1)', fill: 'forwards' })
    return anim.finished.then(() => card.remove())
  }

  const reset = () => {
    stage.querySelectorAll('.flyer').forEach(f => f.remove())
    mails.forEach(m => m.classList.remove('out', 'hit', 'sent'))
    covers.forEach(c => c.classList.remove('off'))
    q.textContent = ''; found.textContent = 'Searching…'
    use('gmail'); set('idle'); step(-1)
  }

  // A tap ripple on a button, so the autoplay reads as someone using the app
  const tap = async (btn, alive) => {
    btn.classList.add('tap'); await sleep(650); btn.classList.remove('tap')
    return alive()
  }

  const start = async (id = ++run, key = 'gmail') => {
    const alive = () => id === run
    use(key); set('open'); step(1, 5600); say(p.name + ' opens. Renewless searches for billing emails.')
    await sleep(1200); if (!alive()) return
    // type the search the backend runs (Renewless-backend scan.ts)
    const text = p.q
    for (let i = 1; i <= text.length; i += reduce ? text.length : 2) {
      q.textContent = text.slice(0, i); q.scrollLeft = q.scrollWidth
      await sleep(22); if (!alive()) return
    }
    q.textContent = text; q.scrollLeft = q.scrollWidth
    await sleep(500); if (!alive()) return
    // everything that is not a bill drops out, one after another
    set('filter')
    for (const m of mails) {
      await sleep(170); if (!alive()) return
      m.classList.add(m.classList.contains('bill') ? 'hit' : 'out')
    }
    found.textContent = '3 billing emails found'
    say('3 billing emails found. Personal mail is left alone.')
    await sleep(1600); if (!alive()) return
    // into the app: each email lands on its row
    set('fly'); step(2, reduce ? 0 : 5600)
    await sleep(500); if (!alive()) return
    for (const [i, m] of bills.entries()) {
      fly(m, slots[i]).then(() => { if (alive() && covers[i]) covers[i].classList.add('off') })
      await sleep(450); if (!alive()) return
    }
    await sleep(1300); if (!alive()) return
    // reduced motion skips the flights, so make sure the list is complete
    covers.forEach(c => c.classList.add('off')); bills.forEach(m => m.classList.add('sent'))
    set('results'); say('Found 3 subscriptions. Review them, then save.')
    return true
  }

  const connect = stage.querySelector('.go.connect'), save = stage.querySelector('.go.save')
  const saved = () => { set('ready'); step(3, 4000); say('Saved. Reminders are on.') }
  // Plays by itself, on a loop, while the scene is on screen; reduced motion waits for taps instead
  const play = async () => {
    const id = ++run, alive = () => id === run
    while (alive()) {
      reset(); step(0, 2000)
      await sleep(1400); if (!alive() || !await tap(connect, alive)) return
      if (!await start(id)) return
      await sleep(1800); if (!alive() || !await tap(save, alive)) return
      saved()
      await sleep(4000)
    }
  }

  connect.addEventListener('click', () => start())
  stage.querySelector('.go.outlook').addEventListener('click', () => start(undefined, 'outlook'))
  save.addEventListener('click', () => { run++; saved() })
  stage.querySelector('.replay').addEventListener('click', () => { run++; reset(); if (!reduce) play() })
  reset()
  if (!reduce) new IntersectionObserver(([e]) => {
    if (e.isIntersecting) play()
    else { run++; reset() }
  }, { threshold: .6 }).observe(stage)
}
