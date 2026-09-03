import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { PPF_SEQUENCE } from '../ppf-sequence.js'

function drawFrame(canvas, image) {
  if (!canvas || !image.complete || !image.naturalWidth) return
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
}

function preloadFrame(index, frames, canvas, onReady) {
  const url = PPF_SEQUENCE[index]
  if (frames.has(index)) return frames.get(index)
  const image = new Image()
  image.decoding = 'async'
  image.onload = () => {
    if (index === 0 || index === onReady.current) drawFrame(canvas, image)
    onReady.callback(index)
  }
  image.src = url
  frames.set(index, image)
  return image
}

export default function PPFScrollSequence() {
  const initialFrame = 70
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef(new Map())
  const frameRef = useRef(initialFrame)
  const readyRef = useRef({ current: initialFrame, callback: () => {} })
  const rafRef = useRef(0)
  const introRef = useRef(true)
  const [frameIndex, setFrameIndex] = useState(initialFrame)
  const [progress, setProgress] = useState(0)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const canvas = canvasRef.current
    const frames = framesRef.current
    canvas.width = 1920
    canvas.height = 1080
    readyRef.current.callback = index => {
      if (index === frameRef.current) drawFrame(canvas, frames.get(index))
    }
    preloadFrame(0, frames, canvas, readyRef.current)
    preloadFrame(initialFrame, frames, canvas, readyRef.current)
    if (reducedMotion) return undefined
    PPF_SEQUENCE.forEach((_, index) => preloadFrame(index, frames, canvas, readyRef.current))
    const update = () => {
      rafRef.current = 0
      const section = sectionRef.current
      if (!section) return
      if (introRef.current) return
      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const nextProgress = Math.min(Math.max((window.scrollY - sectionTop) / travel, 0), 1)
      const nextFrame = initialFrame + Math.round(nextProgress * (PPF_SEQUENCE.length - 1 - initialFrame))
      readyRef.current.current = nextFrame
      preloadFrame(nextFrame, frames, canvas, readyRef.current)
      const direction = nextFrame >= frameRef.current ? 1 : -1
      for (let offset = 1; offset <= 6; offset += 1) {
        const nearbyFrame = nextFrame + offset * direction
        if (nearbyFrame >= 0 && nearbyFrame < PPF_SEQUENCE.length) preloadFrame(nearbyFrame, frames, canvas, readyRef.current)
      }
      frameRef.current = nextFrame
      drawFrame(canvas, frames.get(nextFrame))
      setFrameIndex(nextFrame)
      setProgress(nextProgress)
    }
    const playIntro = startedAt => {
      const elapsed = performance.now() - startedAt
      const introProgress = Math.min(elapsed / 1800, 1)
      const nextFrame = Math.round(introProgress * initialFrame)
      frameRef.current = nextFrame
      readyRef.current.current = nextFrame
      preloadFrame(nextFrame, frames, canvas, readyRef.current)
      drawFrame(canvas, frames.get(nextFrame))
      setFrameIndex(nextFrame)
      setProgress(0)
      if (introProgress < 1) rafRef.current = window.requestAnimationFrame(() => playIntro(startedAt))
      else { introRef.current = false; update() }
    }
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(update)
    }
    introRef.current = true
    let introStarted = false
    const introObserver = new IntersectionObserver(entries => {
      if (introStarted || !entries[0]?.isIntersecting) return
      introStarted = true
      rafRef.current = window.requestAnimationFrame(() => playIntro(performance.now()))
      introObserver.disconnect()
    }, { threshold: 0.35 })
    introObserver.observe(sectionRef.current)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      introObserver.disconnect()
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion])

  const displayIndex = reducedMotion ? initialFrame : frameIndex
  const copyProgress = Math.min(progress * 3, 1)
  return <section className="ppf-sequence" ref={sectionRef} aria-label="PPF product motion presentation">
    <div className="ppf-sequence-track">
      <div className="ppf-sequence-sticky">
        <div className="ppf-sequence-inner">
          <div className="ppf-sequence-copy ppf-sequence-copy--top" style={{ '--copy-progress': copyProgress }}>
            <p className="kicker">SO-FINE / PPF SYSTEM</p>
            <h2>Protection<br /><em>in motion.</em></h2>
            <p>Paint protection film engineered for clarity, resilience and a precise finish across every curve.</p>
            <a className="text-link" href="#category=ppf">Explore PPF <ArrowUpRight size={16} /></a>
          </div>
          <div className="ppf-sequence-stage">
            <canvas ref={canvasRef} className="ppf-sequence-canvas" aria-label={`SO-FINE paint protection film rendering frame ${displayIndex + 1}`} width="1920" height="1080" />
            <div className="ppf-sequence-progress" aria-label={`Frame ${displayIndex + 1} of ${PPF_SEQUENCE.length}`}>
              <span style={{ transform: `scaleX(${reducedMotion ? 0 : progress})` }} />
              <b>{String(displayIndex + 1).padStart(3, '0')}</b><i>/</i><b>{String(PPF_SEQUENCE.length).padStart(3, '0')}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
}
