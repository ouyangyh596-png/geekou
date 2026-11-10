import { useEffect, useId, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { englishSiteContent } from '../content/site-content.js'

// cubic-bezier(.22,1,.36,1): sheets peel out quickly and settle softly.
function cubicBezier(x1, y1, x2, y2) {
  const a = (p1, p2) => 1 - 3 * p2 + 3 * p1, b = (p1, p2) => 3 * p2 - 6 * p1, c = p1 => 3 * p1
  const at = (t, p1, p2) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t
  const slope = (t, p1, p2) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1)
  return x => {
    if (x <= 0 || x >= 1) return Math.max(0, Math.min(1, x))
    let t = x
    for (let i = 0; i < 6; i++) { const d = slope(t, x1, x2); if (Math.abs(d) < 1e-6) break; t -= (at(t, x1, x2) - x) / d }
    return at(Math.max(0, Math.min(1, t)), y1, y2)
  }
}
const ease = cubicBezier(0.22, 1, 0.36, 1)
function rawExpansionAt(progress) {
  return Math.max(0, Math.min(1, progress < 0.85 ? (progress - 0.15) / 0.45 : (1 - progress) / 0.15))
}
// Top sheet lifts first; lower sheets follow with a short stagger.
function layerExpansion(raw, index) {
  return ease(Math.max(0, Math.min(1, (raw - index * 0.1) / 0.7)))
}

export default function PPFLayerAnimation({ mobile = false }) {
  const content = englishSiteContent.home.ppfSequence
  const labels = ['Self-Healing Top Coat', 'High-Clarity TPU', 'Glue', 'PET Liner']
  const sectionRef = useRef(null)
  const layersRef = useRef([])
  const sheenRef = useRef([])
  const stackRef = useRef(null)
  const backgroundRef = useRef(null)
  const id = useId().replace(/:/g, '')
  // Shared S-curve keeps the four sheets aligned when the stack closes.
  const sheet = 'M126 286 C170 280 197 291 229 301 C265 313 291 296 322 277 C350 260 375 247 392 246 L386 264 C363 265 341 280 313 296 C279 317 256 333 221 321 C185 309 157 304 110 303 Z'
  const frontEdge = 'M110 303 C157 304 185 309 221 321 C256 333 279 317 313 296 C341 280 363 265 386 264'
  const fill = name => `url(#${id}-${name})`

  useEffect(() => {
    const section = sectionRef.current
    const track = section.querySelector('.ppf-sequence-track')
    const sticky = section.querySelector('.ppf-sequence-sticky')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0, current = null, last = 0
    function update(now) {
      raf = 0
      const target = Math.max(0, Math.min(1, -track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - sticky.offsetHeight)))
      // Ease toward the scroll position so wheel steps glide instead of jumping.
      const dt = last ? Math.min(now - last, 64) : 16
      last = now
      if (current === null || motion.matches) current = target
      else current += (target - current) * (1 - Math.exp(-dt / (mobile ? 120 : 150)))
      if (Math.abs(target - current) < 0.0005) current = target
      const progress = current
      const raw = motion.matches ? 1 : rawExpansionAt(progress)
      layersRef.current.forEach((layer, index) => {
        const expansion = layerExpansion(raw, index)
        layer.style.transform = `translate3d(0, ${-((4 - index) * 51 * expansion)}px, 0)`
        layer.querySelector('.ppf-film-label').style.opacity = Math.min(1, expansion * 1.6)
      })
      if (!mobile) {
        const activeLayer = Math.min(3, Math.floor(progress * 4))
        section.querySelectorAll('.ppf-layer-legend li').forEach((item, index) => {
          if (index === activeLayer) item.setAttribute('aria-current', 'step')
          else item.removeAttribute('aria-current')
        })
        // Measure the artwork, including labels, rather than centering empty SVG space.
        const bounds = stackRef.current.getBBox()
        stackRef.current.setAttribute('transform', `translate(${200 - bounds.x - bounds.width / 2} ${190 - bounds.y - bounds.height / 2})`)
      }
      backgroundRef.current.style.transform = `translate3d(0, ${motion.matches ? 0 : -40 + progress * 80}px, 0)`
      sheenRef.current.forEach(sheen => {
        sheen.style.transform = `translateX(${motion.matches ? 0 : -70 + progress * 140}px)`
      })
      if (current !== target) schedule()
      else last = 0
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    const resize = new ResizeObserver(schedule)
    resize.observe(track)
    resize.observe(sticky)
    motion.addEventListener('change', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    schedule()
    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      motion.removeEventListener('change', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [mobile])

  return <section className={mobile ? 'ppf-sequence ppf-sequence-mobile' : 'ppf-sequence'} ref={sectionRef} aria-label={content.presentationLabel}>
    <div className="ppf-sequence-track">
      <div className="ppf-sequence-sticky">
        <div className="ppf-sequence-background" ref={backgroundRef} aria-hidden="true" />
        <div className="ppf-sequence-inner">
          <div className="ppf-sequence-copy ppf-sequence-copy--top">
            <p className="kicker">{content.kicker}</p>
            <h2 className="ppf-brand-title"><img src="/media/home/autoface-logo-light.svg" alt="AUTOFACE" className="ppf-brand-logo" /><em>{content.titleEmphasis}</em></h2>
            <p>{content.description}</p>
            <a className="ppf-explore-button" href="#category=ppf"><span>{content.action}</span> <ArrowUpRight size={16} aria-hidden="true" /></a>
            {!mobile && <ol className="ppf-layer-legend" aria-label="Film layers">
              {labels.map((label, index) => <li key={label} aria-current={index === 0 ? 'step' : undefined}>{label}</li>)}
            </ol>}
          </div>
          <div className="ppf-sequence-stage">
            <svg className="ppf-film-diagram" viewBox={mobile ? "0 0 400 380" : "30 20 340 340"} preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={`${id}-title ${id}-description`}>
              <title id={`${id}-title`}>{content.presentationLabel}</title>
              <desc id={`${id}-description`}>{labels.join(', ')} — Four protective film layers with curved surfaces, separating and closing as you scroll.</desc>
              <defs>
                <linearGradient id={`${id}-top`} x1="0" y1="0" x2=".25" y2="1">
                  <stop stopColor="#e9faff" stopOpacity=".24" /><stop offset=".35" stopColor="#dceef7" stopOpacity=".07" /><stop offset=".7" stopColor="#adcbdc" stopOpacity=".12" /><stop offset="1" stopColor="#f9fbfc" stopOpacity=".3" />
                </linearGradient>
                <linearGradient id={`${id}-tpu`} x1="0" y1="0" x2=".2" y2="1">
                  <stop stopColor="#e7f8ff" stopOpacity=".3" /><stop offset=".45" stopColor="#c5e1ef" stopOpacity=".1" /><stop offset=".8" stopColor="#f9fafb" stopOpacity=".18" /><stop offset="1" stopColor="#badaed" stopOpacity=".32" />
                </linearGradient>
                <linearGradient id={`${id}-glue`} x2=".1" y2="1">
                  <stop stopColor="#edf0e9" stopOpacity=".34" /><stop offset=".55" stopColor="#d8e1df" stopOpacity=".2" /><stop offset="1" stopColor="#eef3ed" stopOpacity=".38" />
                </linearGradient>
                <linearGradient id={`${id}-pet`} x2=".15" y2="1">
                  <stop stopColor="#fffffb" stopOpacity=".48" /><stop offset=".5" stopColor="#e4e3db" stopOpacity=".3" /><stop offset=".8" stopColor="#f7f6ef" stopOpacity=".4" /><stop offset="1" stopColor="#dce6e5" stopOpacity=".52" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`}>
                  <stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".24" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <filter id={`${id}-shadow`} x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#020b15" floodOpacity=".22" />
                </filter>
                <clipPath id={`${id}-plate`}><path d={sheet} /></clipPath>
              </defs>
              <g ref={stackRef} className="ppf-film-stack">
              {[3, 2, 1, 0].map(index => <g key={index} ref={element => { layersRef.current[index] = element }} className={`ppf-film-layer ppf-film-layer--${index}`}>
                <path d={sheet} fill={fill(['top', 'tpu', 'glue', 'pet'][index])} filter={fill('shadow')} stroke="#e3f4ff" strokeOpacity={index < 2 ? '.55' : '.35'} strokeWidth=".65" />
                <path d={frontEdge} fill="none" stroke={index === 2 ? '#d7d9da' : '#fff'} strokeWidth={index === 3 ? '1.8' : '1'} strokeOpacity=".9" />
                <g clipPath={fill('plate')}><path ref={element => { sheenRef.current[index] = element }} className="ppf-film-sheen" d="M170 230h65l80 120h-65Z" fill={fill('sheen')} /></g>
                <g className="ppf-film-label" transform={mobile ? undefined : 'translate(65 90) scale(.65)'}>
                  <path d="M88 290h26l23 8" fill="none" stroke="#b8bcbf" strokeWidth=".7" />
                  <text x="84" y="286" textAnchor="end">{index < 2 ? <><tspan x="84" dy="-7">{index === 0 ? 'Self-Healing' : 'High-Clarity'}{' '}</tspan><tspan x="84" dy="14">{index === 0 ? 'Top Coat' : 'TPU'}</tspan></> : labels[index]}</text>
                </g>
              </g>)}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
}
