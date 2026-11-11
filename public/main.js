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

// Hero demo: two taps walk through the real onboarding screens
const demo = document.querySelector('.demo')
if (demo) {
  const shots = [...demo.querySelectorAll('img')]
  const tap = demo.querySelector('.tap')
  // screen index, where the tap target sits (% of the screenshot), its label, or ms before moving on
  const steps = [
    { tap: [80.7, 5.6], label: 'Connect Gmail (demo)', hint: 'Tap to try' },
    { wait: 2600 },
    { tap: [86.5, 5.2], label: 'Save subscriptions (demo)', hint: 'Save them' },
    { wait: 2400 },
    { replay: true },
  ]
  let timer, refocus = false
  const show = i => {
    clearTimeout(timer)
    const step = steps[i]
    shots.forEach((img, n) => { img.classList.toggle('on', n === i); img.setAttribute('aria-hidden', n !== i) })
    tap.hidden = Boolean(step.wait)
    tap.classList.toggle('replay', Boolean(step.replay))
    tap.textContent = step.replay ? 'Replay' : ''
    if (step.tap) {
      tap.style.setProperty('--top', step.tap[0] + '%')
      tap.style.setProperty('--h', step.tap[1] + '%')
      tap.dataset.hint = step.hint
      tap.setAttribute('aria-label', step.label)
    } else if (step.replay) tap.setAttribute('aria-label', 'Replay the demo')
    if (step.wait) timer = setTimeout(() => show(i + 1), reduce ? 800 : step.wait)
    // keyboard users keep their place while the button hides during a wait
    else if (refocus) tap.focus({ preventScroll: true })
    demo.dataset.step = i
  }
  tap.addEventListener('click', () => {
    const i = Number(demo.dataset.step)
    refocus = document.activeElement === tap
    show(steps[i].replay ? 0 : i + 1)
  })
  tap.classList.add('ready')
  show(0)
}
