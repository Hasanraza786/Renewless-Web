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
