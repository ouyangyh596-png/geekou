// Native scroll is the clock: no wheel/touch interception or forced destinations.
export function boundaryProgress(top, viewportHeight) {
  return Math.max(0, Math.min(1, 1 - top / Math.max(1, viewportHeight)));
}

export function installHomeModuleMotion(root, win = window) {
  if (!root || typeof win.requestAnimationFrame !== 'function' || typeof win.matchMedia !== 'function') return () => {};
  const sections = [...root.querySelectorAll(':scope > section')];
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const properties = ['--module-seam', '--module-exit-seam', '--module-depth'];
  let frame = 0;
  function reset() {
    win.cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('module-motion');
    sections.forEach(section => properties.forEach(property => section.style.removeProperty(property)));
  }
  function update() {
    frame = 0;
    if (motion.matches) return;
    // Batch geometry reads before writes; decoration never changes these bounds.
    const entries = sections.map((section, index) => index === 0 ? 1 : boundaryProgress(section.getBoundingClientRect().top, win.innerHeight));
    const depth = root.classList.contains('is-mobile') ? 18 : 32;
    sections.forEach((section, index) => {
      const entry = entries[index], exit = entries[index + 1] || 0;
      const values = [Math.sin(Math.PI * entry).toFixed(4), Math.sin(Math.PI * exit).toFixed(4), ((entry - 1 + exit) * depth).toFixed(2) + 'px'];
      properties.forEach((property, i) => section.style.setProperty(property, values[i]));
    });
    root.classList.add('module-motion');
  }
  function schedule() {
    if (!motion.matches && !frame) frame = win.requestAnimationFrame(update);
  }
  function preferenceChanged() {
    reset();
    schedule();
  }
  win.addEventListener('scroll', schedule, { passive: true });
  win.addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', preferenceChanged);
  const resize = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(schedule) : null;
  resize?.observe(root);
  schedule();
  return () => {
    win.removeEventListener('scroll', schedule);
    win.removeEventListener('resize', schedule);
    motion.removeEventListener('change', preferenceChanged);
    resize?.disconnect();
    reset();
  };
}
