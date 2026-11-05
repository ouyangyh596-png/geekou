import { useEffect, useRef, useState } from 'react';
import { Play, X } from 'lucide-react';
import { useLanguage } from '../language.js';
import './tvc-showcase.css';

export default function TvcShowcase() {
  const { content } = useLanguage();
  const copy = content.home.tvc;
  const [allowMotion, setAllowMotion] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const section = useRef(null);
  const loop = useRef(null);
  const dialog = useRef(null);
  const film = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 801px) and (prefers-reduced-motion: no-preference)');
    const update = () => setAllowMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!allowMotion || !loop.current) return;
    const video = loop.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isOpen) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(section.current);
    return () => { observer.disconnect(); video.pause(); };
  }, [allowMotion, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  useEffect(() => {
    const video = film.current;
    return () => video?.pause();
  }, []);

  const close = () => {
    film.current?.pause();
    if (dialog.current?.open) dialog.current.close();
    setIsOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const open = () => {
    dialog.current.showModal();
    setIsOpen(true);
    loop.current?.pause();
    film.current.muted = false;
    // Keep play() in the user's click activation. Controls remain usable if playback fails.
    film.current.play().catch(() => {});
  };

  return <section className="tvc-showcase" id="top" ref={section} aria-labelledby="tvc-title">
    <img className="tvc-poster" src="/media/tvc/sofine-tvc-loop-poster.jpg" alt="" fetchPriority="high" />
    {allowMotion && <video ref={loop} className="tvc-loop" autoPlay muted loop playsInline preload="metadata" poster="/media/tvc/sofine-tvc-loop-poster.jpg" aria-hidden="true">
      <source src="/media/tvc/sofine-tvc-loop.webm" type="video/webm" />
      <source src="/media/tvc/sofine-tvc-loop.mp4" type="video/mp4" />
    </video>}
    <div className="tvc-copy container">
      <div className="tvc-brand"><img src="/so-fine-logo.svg" alt="SO-FINE" /></div>
      <h2 id="tvc-title">{copy.title}</h2>
      <p className="tvc-subtitle">{copy.subtitle}</p>
      <button ref={trigger} className="tvc-watch" onClick={open} type="button" aria-haspopup="dialog"><Play size={20} aria-hidden="true" />{copy.watch}</button>
    </div>
    <dialog className="tvc-dialog" ref={dialog} aria-labelledby="tvc-dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClose={close} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="tvc-player">
        <div className="tvc-player-heading"><h2 id="tvc-dialog-title">{copy.filmTitle}</h2><button type="button" onClick={close} aria-label={copy.close} autoFocus><X size={24} aria-hidden="true" /></button></div>
        <video ref={film} controls playsInline preload="none" poster="/media/tvc/sofine-tvc-full-poster.jpg" aria-label={copy.filmTitle}>
          <source src="/media/tvc/sofine-tvc-full.mp4" type="video/mp4" />
          {copy.unsupported}
        </video>
      </div>
    </dialog>
  </section>;
}
