import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { PPF_SEQUENCE } from '../ppf-sequence.js'
import { useLanguage } from '../language.js'



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
    if (index === onReady.current) drawFrame(canvas, image)
    onReady.callback(index)
  }
  image.src = url
  frames.set(index, image)
  return image
}

export default function PPFScrollSequence() {
  const content = useLanguage().content.home.ppfSequence
  const initialFrame = 70
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef(new Map())
  const frameRef = useRef(initialFrame)
  const readyRef = useRef({ current: initialFrame, callback: () => {} })
  const rafRef = useRef(0)
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
      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const nextProgress = Math.min(Math.max((window.scrollY - sectionTop) / travel, 0), 1)
      const rect = section.getBoundingClientRect()
      const entrance = Math.min(Math.max((window.innerHeight - rect.top) / window.innerHeight, 0), 1)
      const exit = Math.min(Math.max(rect.bottom / window.innerHeight, 0), 1)
      section.style.setProperty('--sequence-presence', Math.min(entrance, exit))
      const nextFrame = Math.round(nextProgress * (PPF_SEQUENCE.length - 1))
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
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion])

  const displayIndex = reducedMotion ? initialFrame : frameIndex
  const copyProgress = Math.min(progress * 3, 1)
  return <section className="ppf-sequence" ref={sectionRef} aria-label={content.presentationLabel}>
    <div className="ppf-sequence-track">
      <div className="ppf-sequence-sticky">
        <div className="ppf-sequence-inner">
          <div className="ppf-sequence-copy ppf-sequence-copy--top" style={{ '--copy-progress': copyProgress }}>
            <p className="kicker">{content.kicker}</p>
            <h2>{content.titleLead}<br /><em>{content.titleEmphasis}</em></h2>
            <p>{content.description}</p>
            <a className="text-link" href="#category=ppf">{content.action} <ArrowUpRight size={16} /></a>
          </div>
          <div className="ppf-sequence-stage">
            <canvas ref={canvasRef} className="ppf-sequence-canvas" aria-label={`${content.canvasLabelPrefix} ${displayIndex + 1}`} width="1920" height="1080" />
            <div className="ppf-sequence-progress" aria-label={`${content.progressLabelPrefix} ${displayIndex + 1} ${content.progressLabelInfix} ${PPF_SEQUENCE.length}`}>
              <span style={{ transform: `scaleX(${reducedMotion ? 0 : progress})` }} />
              <b>{String(displayIndex + 1).padStart(3, '0')}</b><i>/</i><b>{String(PPF_SEQUENCE.length).padStart(3, '0')}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
}
