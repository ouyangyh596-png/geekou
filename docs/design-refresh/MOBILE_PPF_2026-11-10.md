# Mobile PPF layer animation, code-drawn (mobile only)
Scope: ONLY src/components/MobilePPFScrollSequence.jsx (rewrite it; keep the export name so main.jsx is unchanged) and mobile-only CSS in src/mobile.css scoped to .is-mobile / .ppf-sequence-mobile. Do NOT touch desktop PPFScrollSequence.jsx, desktop styles, carousel or anything else. Mobile no longer uses the PNG sequence.

Goal: replace the PNG-frame animation on phones with a code-drawn (SVG or CSS 3D, no images) animation that tells the same story as the old sequence: a PPF film sheet over a car paint surface that separates into its layers, then closes back together, driven directly by finger scroll.
- Layers top to bottom: Self-healing top coat, High-clarity TPU, Adhesive, PET liner (zh: 自修复涂层, 高透 TPU, 胶粘层, PET 底膜), sitting on the car paint.
- Look: premium, restrained, technical. Isometric/perspective stacked translucent plates with thin edges, subtle gradients and glow, brand colors navy #0B1F3A, blue #0A60C8, light #F4F7FB. Top coat glossy with a moving sheen; TPU clear glass-like; adhesive a fine dotted/textured layer; PET liner slightly matte. No rainbow gradients.
- Interaction: a tall track (~300vh) with a sticky stage (position: sticky; top: 0; height: 100svh). Progress p = scroll through the track, 0..1. 0-0.15: closed stack. 0.15-0.6: layers spread apart vertically with easing, and each layer's small label fades in beside its own layer (attached to the layer, not a numbered list). 0.6-0.85: hold exploded. 0.85-1: close back together. Reverse scrolling reverses it smoothly. Update with requestAnimationFrame on passive scroll; use transforms only (60fps). Make sure no ancestor breaks sticky on iOS Safari.
- Remove the old numbered labels row and the 001/115 counter. Keep the existing title/kicker/description/Explore button copy above, compact.
- prefers-reduced-motion: show the exploded state statically.
- Build with node ./node_modules/vite/bin/vite.js build and make sure it passes. Do not git commit.
Write a short summary at the end.

## UPDATE (overrides above): match the original artwork exactly in meaning and English
- English labels must be EXACTLY: "Self-Healing Top Coat", "High-Clarity TPU", "Glue", "PET Liner" (top to bottom). Chinese labels only when lang is zh.
- Match the original look (public/assets/ppf-sequence/frame-073.png): four thin wavy curved sheets (S-curve, rising to the right) on a light/white background, silver-white glass-like top coat and TPU, grey glue layer, thicker off-white PET liner at bottom; labels in light grey on the left, aligned to each layer. Stack closed then separating with scroll, same as before.
