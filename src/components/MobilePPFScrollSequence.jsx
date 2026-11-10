import { useEffect, useId, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../language.js'

function expansionAt(progress) {
  const t = Math.max(0, Math.min(1, progress < 0.85 ? (progress - 0.15) / 0.45 : (1 - progress) / 0.15))
  return t * t * (3 - 2 * t)
}

export default function MobilePPFScrollSequence() {
  const { content: siteContent, lang } = useLanguage()
  const content = siteContent.home.ppfSequence
  const labels = lang === 'zh' ? ['自修复涂层', '高透 TPU', '胶粘层', 'PET 底膜'] : ['Self-Healing Top Coat', 'High-Clarity TPU', 'Glue', 'PET Liner']
  const sectionRef = useRef(null)
  const layersRef = useRef([])
  const sheenRef = useRef(null)
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
    let raf = 0
    function update() {
      raf = 0
      const progress = Math.max(0, Math.min(1, -track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - sticky.offsetHeight)))
      const expansion = motion.matches ? 1 : expansionAt(progress)
      layersRef.current.forEach((layer, index) => {
        layer.style.transform = `translateY(${-((4 - index) * 7 + (4 - index) * 44 * expansion)}px)`
        layer.querySelector('.ppf-film-label').style.opacity = Math.min(1, expansion * 2)
      })
      sheenRef.current.style.transform = `translateX(${motion.matches ? 0 : -220 + progress * 440}px)`
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
  }, [])

  return <section className="ppf-sequence ppf-sequence-mobile" ref={sectionRef} aria-label={content.presentationLabel}>
    <div className="ppf-sequence-track">
      <div className="ppf-sequence-sticky">
        <div className="ppf-sequence-inner">
          <div className="ppf-sequence-copy ppf-sequence-copy--top">
            <p className="kicker">{content.kicker}</p>
            <h2>{content.titleLead}<br /><em>{content.titleEmphasis}</em></h2>
            <p>{content.description}</p>
            <a className="ppf-explore-button" href="#category=ppf"><span>{content.action}</span> <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="ppf-sequence-stage">
            <svg className="ppf-film-diagram" viewBox="0 0 400 380" role="img" aria-labelledby={`${id}-title ${id}-description`}>
              <title id={`${id}-title`}>{content.presentationLabel}</title>
              <desc id={`${id}-description`}>{labels.join(', ')} — {lang === 'zh' ? '四层曲面保护膜，随滚动展开与合拢。' : 'Four protective film layers with curved surfaces, separating and closing as you scroll.'}</desc>
              <defs>
                <linearGradient id={`${id}-top`} x1="0" y1="0" x2=".25" y2="1">
                  <stop stopColor="#fff" /><stop offset=".35" stopColor="#dce2e4" stopOpacity=".85" /><stop offset=".7" stopColor="#adb8bc" stopOpacity=".72" /><stop offset="1" stopColor="#f9fbfc" />
                </linearGradient>
                <linearGradient id={`${id}-tpu`} x1="0" y1="0" x2=".2" y2="1">
                  <stop stopColor="#fff" /><stop offset=".45" stopColor="#d0d3d4" stopOpacity=".8" /><stop offset=".8" stopColor="#f9fafb" /><stop offset="1" stopColor="#babfc2" />
                </linearGradient>
                <linearGradient id={`${id}-glue`} x2=".1" y2="1">
                  <stop stopColor="#b8babb" /><stop offset=".55" stopColor="#737779" /><stop offset="1" stopColor="#a9acad" />
                </linearGradient>
                <linearGradient id={`${id}-pet`} x2=".15" y2="1">
                  <stop stopColor="#fffffb" /><stop offset=".5" stopColor="#e4e3db" /><stop offset=".8" stopColor="#f7f6ef" /><stop offset="1" stopColor="#c9c9c2" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`}>
                  <stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <clipPath id={`${id}-plate`}><path d={sheet} /></clipPath>
              </defs>
              {[3, 2, 1, 0].map(index => <g key={index} ref={element => { layersRef.current[index] = element }} className={`ppf-film-layer ppf-film-layer--${index}`}>
                <path d={sheet} transform={`translate(0 ${index === 3 ? 4 : 1.5})`} fill={index === 3 ? '#c5c5bd' : '#b5bdc0'} stroke={index === 3 ? '#c5c5bd' : '#b5bdc0'} strokeWidth=".8" />
                <path d={sheet} fill={fill(['top', 'tpu', 'glue', 'pet'][index])} stroke={index === 2 ? '#c3c5c6' : '#e3e6e6'} strokeWidth=".8" />
                <path d={frontEdge} fill="none" stroke={index === 2 ? '#d7d9da' : '#fff'} strokeWidth={index === 3 ? '1.8' : '1'} strokeOpacity=".9" />
                {index === 0 && <g clipPath={fill('plate')}><path ref={sheenRef} className="ppf-film-sheen" d="M80 230h48l80 120h-48Z" fill={fill('sheen')} /></g>}
                <g className="ppf-film-label">
                  <path d="M88 290h26l23 8" fill="none" stroke="#b8bcbf" strokeWidth=".7" />
                  <text x="84" y="286" textAnchor="end">{lang !== 'zh' && index < 2 ? <><tspan x="84" dy="-7">{index === 0 ? 'Self-Healing' : 'High-Clarity'}{' '}</tspan><tspan x="84" dy="14">{index === 0 ? 'Top Coat' : 'TPU'}</tspan></> : labels[index]}</text>
                </g>
              </g>)}
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
}
