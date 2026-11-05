import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { PPF_SEQUENCE, introFrameAt, scrubFrameAt } from '../ppf-sequence.js'
import { useLanguage } from '../language.js'

export default function MobilePPFScrollSequence() {
  const { content: siteContent, lang } = useLanguage()
  const content = siteContent.home.ppfSequence
  const labels = lang === 'zh' ? ['自修复涂层', '高透 TPU', '胶粘层', 'PET 底膜'] : ['Self-healing top coat', 'High-clarity TPU', 'Adhesive', 'PET liner']
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    const context = canvas.getContext('2d')
    if (!context) return undefined
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const frames = new Map()
    const failed = new Set()
    let disposed = false, visible = false, started = false, finished = false
    let raf = 0, lastTime = 0, introTime = 0, anchor = 0, current = 0, drawn = -1
    let nextLoad = 0, activeLoads = 0

    const scrollProgress = () => {
      const top = section.getBoundingClientRect().top + window.scrollY
      return Math.max(0, Math.min(1, (window.scrollY - top) / Math.max(1, section.offsetHeight - section.querySelector('.ppf-sequence-sticky').offsetHeight)))
    }
    const draw = index => {
      const image = frames.get(index)
      if (!image?.complete || !image.naturalWidth) return
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))
      if (drawn === index && canvas.width === width && canvas.height === height) return
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      // Crop only empty margins (bounds checked across all 115 frames); readable labels live below.
      const crop = { x: 120, y: 140, width: 1540, height: 680 }
      const scale = Math.min(width / crop.width, height / crop.height)
      const w = crop.width * scale, h = crop.height * scale
      context.clearRect(0, 0, width, height)
      context.drawImage(image, crop.x, crop.y, crop.width, crop.height, (width - w) / 2, (height - h) / 2, w, h)
      drawn = index
      setFrameIndex(index)
    }
    const wake = () => {
      if (!disposed && !raf) raf = requestAnimationFrame(tick)
    }
    const load = index => {
      if (frames.has(index)) return
      const image = new Image()
      frames.set(index, image)
      activeLoads += 1
      image.decoding = 'async'
      const settle = () => {
        activeLoads -= 1
        if (disposed) return
        wake()
        pump()
      }
      image.onload = settle
      image.onerror = () => { failed.add(index); settle() }
      image.src = PPF_SEQUENCE[index]
    }
    // Bound concurrent decoding and request the intro before the scrub tail.
    const pump = () => {
      if (motion.matches) { load(114); return }
      while (activeLoads < 4 && nextLoad < PPF_SEQUENCE.length) load(nextLoad++)
    }
    function tick(now) {
      raf = 0
      if (disposed) return
      if (motion.matches) { draw(114); lastTime = 0; return }
      const delta = lastTime ? Math.min(now - lastTime, 50) : 0
      lastTime = now
      if (visible && !finished) {
        started = true
        const candidate = introFrameAt(introTime + delta)
        const image = frames.get(candidate)
        // Buffer rather than skipping undecoded frames on slower connections.
        if (image?.naturalWidth || failed.has(candidate)) introTime += delta
        current = introFrameAt(introTime)
        if (current === 73) {
          finished = true
          anchor = scrollProgress()
        }
      } else if (finished) {
        const position = scrollProgress()
        // At the very end there is no scroll travel left: re-arm on reverse.
        if (anchor === 1 && position < 1) anchor = position
        const target = scrubFrameAt(position, anchor)
        current += (target - current) * (1 - Math.exp(-delta / 90))
        if (Math.abs(target - current) < .05) current = target
      }
      draw(Math.round(current))
      setProgress(Math.max(0, (current - 73) / 41))
      if (visible && (started && !finished || finished && current !== scrubFrameAt(scrollProgress(), anchor))) wake()
      else lastTime = 0
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      lastTime = 0
      wake()
    }, { threshold: 0.15 })
    observer.observe(section.querySelector('.ppf-sequence-sticky'))
    const resize = new ResizeObserver(() => { drawn = -1; wake() })
    resize.observe(canvas)
    const onMotion = () => { lastTime = 0; pump(); wake() }
    motion.addEventListener('change', onMotion)
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', wake, { passive: true })
    pump()
    wake()
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      resize.disconnect()
      motion.removeEventListener('change', onMotion)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', wake)
      frames.forEach(image => { image.onload = null; image.onerror = null })
      frames.clear()
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
            <canvas ref={canvasRef} className="ppf-sequence-canvas" aria-label={`${content.canvasLabelPrefix} ${frameIndex + 1}`} width="1920" height="1080" />
            <ol className="ppf-mobile-labels">{labels.map(label => <li key={label}>{label}</li>)}</ol>
            <div className="ppf-sequence-progress" aria-label={`${content.progressLabelPrefix} ${frameIndex + 1} ${content.progressLabelInfix} ${PPF_SEQUENCE.length}`}>
              <span style={{ transform: `scaleX(${progress})` }} />
              <b>{String(frameIndex + 1).padStart(3, '0')}</b><i>/</i><b>{String(PPF_SEQUENCE.length).padStart(3, '0')}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
}
