# SO-FINE High-Resolution Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the SO-FINE homepage and every product family page with correctly matched, optimized high-resolution imagery while preserving navigation, content, motion, and responsive behavior.

**Architecture:** A small media manifest will separate visual asset selection from page rendering. A deterministic asset preparation script will copy and convert approved desktop source images into project-owned WebP files, and React components will consume the manifest for hero, story-strip, category preview, and category-page imagery. Existing catalogue and routing data remain the source of truth for product text and links.

**Tech Stack:** React, Vite, JavaScript, CSS, macOS `sips`, Node.js test scripts.

## Global Constraints

- Every website production asset must live under `/Users/geekou/Documents/公司网站`.
- Prefer original photographs and independent source images over rendered brochure spreads.
- Avoid screenshots, watermarks, low-resolution previews, and baked-in promotional copy.
- Preserve the existing approximately 1700 px desktop layout, English-first content, multilingual behavior, product links, and scroll restoration.
- Below-fold images must use lazy loading and descriptive English alt text.
- Motion must respect `prefers-reduced-motion` and reverse cleanly during upward scrolling.

---

### Task 1: Build the Curated Media Pipeline

**Files:**
- Create: `scripts/prepare-site-media.sh`
- Create: `src/media-manifest.js`
- Create: `scripts/test-media-manifest.mjs`
- Create: `public/media/home/*`
- Create: `public/media/families/*`

**Interfaces:**
- Produces: `homeMedia: { hero, materialDetail, signage, automotive, company }`.
- Produces: `familyMedia: Record<string, { hero: string, preview: string, alt: string }>` keyed by catalogue category slug.

- [ ] **Step 1: Write the manifest validation test**

Create a Node test that imports `categories`, `homeMedia`, and `familyMedia`; assert every category slug has `hero`, `preview`, and `alt`, every URL starts with `/media/`, every referenced file exists under `public`, and every raster is at least 1200 px wide using `sips` output.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node scripts/test-media-manifest.mjs`

Expected: FAIL because `src/media-manifest.js` and optimized files do not exist.

- [ ] **Step 3: Implement deterministic asset preparation**

Create `scripts/prepare-site-media.sh` with explicit quoted source and destination paths. Use `mkdir -p` for project destinations, `sips -s format webp --resampleWidth` for web derivatives, and semantic names such as `factory-hero.webp`, `one-way-vision.webp`, `translucent-signage.webp`, and `car-wrap-orange.webp`. Do not scan or copy unrelated Desktop assets at runtime.

- [ ] **Step 4: Add the media manifest**

Export the exact `homeMedia` and `familyMedia` structures described above. Map One Way Vision to perforated-window imagery, Self-Adhesive Vinyl to signage, Translucent Film to illuminated signage, PPF to paint-protection imagery, Car Wrapping Film to vehicle/material photography, Overlaminate and Cold Lamination to film-roll/protection details, and Wall Decals to interior graphics.

- [ ] **Step 5: Prepare assets and pass validation**

Run: `bash scripts/prepare-site-media.sh && node scripts/test-media-manifest.mjs`

Expected: PASS with all eight family mappings and homepage assets present.

### Task 2: Add Homepage Editorial Imagery

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`
- Test: `scripts/test-home-media.mjs`

**Interfaces:**
- Consumes: `homeMedia` and `familyMedia` from `src/media-manifest.js`.
- Produces: `MaterialStory` component and image-backed category rows.

- [ ] **Step 1: Write the homepage structure test**

Assert `main.jsx` imports the media manifest, renders `MaterialStory`, uses `loading="lazy"` below the hero, exposes useful alt text, and keeps the existing `#products`, `#technology`, `#company`, and `#contact` anchors.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node scripts/test-home-media.mjs`

Expected: FAIL because the story component and family previews are absent.

- [ ] **Step 3: Implement `MaterialStory` and hero media binding**

Bind the landing image to `homeMedia.hero`. Add a three-tile section after the hero using material detail, illuminated signage, and automotive imagery. Every tile includes an English label, responsive image dimensions, lazy loading, and a reveal class.

- [ ] **Step 4: Add family previews to `ProductShowcase`**

Within each `.category-row`, render a `.category-media` image from `familyMedia[category.slug].preview`. Keep the anchor as the row's interactive element so category navigation and keyboard activation remain unchanged.

- [ ] **Step 5: Add restrained editorial styling and motion**

Implement clipped image reveals, soft blue overlays, category image expansion, and mobile always-visible previews. Avoid layout shifts by setting aspect ratios. Disable transform transitions under `prefers-reduced-motion`.

- [ ] **Step 6: Pass homepage tests**

Run: `node scripts/test-home-media.mjs && node scripts/test-scroll-navigation.mjs && node scripts/test-language.mjs`

Expected: all commands PASS.

### Task 3: Enrich Company and Capability Sections

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`
- Test: `scripts/test-home-media.mjs`

**Interfaces:**
- Consumes: `homeMedia.company`.
- Produces: a responsive company evidence image and decorative, non-interactive capability visual layers.

- [ ] **Step 1: Extend the structure test**

Assert the company section contains one lazy-loaded evidence image and capability decorations are `aria-hidden="true"`.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node scripts/test-home-media.mjs`

Expected: FAIL on missing company image or accessibility attributes.

- [ ] **Step 3: Add the company image composition**

Place `homeMedia.company` beside the company copy using an asymmetric grid. Keep all company text readable without relying on the image.

- [ ] **Step 4: Add capability card detail**

Add lightweight CSS/SVG-inspired circles, measurement lines, film-layer bands, and a scanning highlight as pseudo-elements or `aria-hidden` spans. Keep decoration within cards and pause animation when reduced motion is requested.

- [ ] **Step 5: Pass the structure test**

Run: `node scripts/test-home-media.mjs`

Expected: PASS.

### Task 4: Add Family Imagery to Category Pages

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`
- Create: `scripts/test-category-media.mjs`

**Interfaces:**
- Consumes: `familyMedia[category.slug]`.
- Produces: image-backed `CategoryPage` headers with responsive focal behavior.

- [ ] **Step 1: Write the category media test**

Assert `CategoryPage` reads from `familyMedia`, renders a hero image with the family alt text, lazy-loads product-grid imagery, and preserves `#product=` and `#products` links.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node scripts/test-category-media.mjs`

Expected: FAIL because category headers are currently text-only.

- [ ] **Step 3: Implement category hero media**

Convert `.category-page-head` to an editorial text-and-image composition. Use the family hero as supporting context, keep category text above overlays, and use an aspect ratio rather than a fixed image height on mobile.

- [ ] **Step 4: Improve product card image semantics**

Set `loading="lazy"`, `decoding="async"`, descriptive model/family alt text, and stable image aspect ratios. Do not replace an existing model-specific image with a generic category image.

- [ ] **Step 5: Pass category tests**

Run: `node scripts/test-category-media.mjs && node scripts/validate-content.mjs && node scripts/test-scroll-navigation.mjs`

Expected: all commands PASS.

### Task 5: Responsive and Production Verification

**Files:**
- Modify: `src/styles.css`
- Modify: `package.json`

**Interfaces:**
- Consumes: all previous UI and media changes.
- Produces: verified desktop and mobile production build.

- [ ] **Step 1: Add media tests to npm scripts**

Add `test-media`, `test-home-media`, and `test-category-media` scripts with their exact Node commands.

- [ ] **Step 2: Run the complete automated suite**

Run: `pnpm run validate:content && pnpm run test-language && pnpm run test-scroll && pnpm run test-request-validation && pnpm run test-media && pnpm run test-home-media && pnpm run test-category-media && pnpm run build`

Expected: every test reports PASS and Vite completes a production build without warnings that affect function.

- [ ] **Step 3: Verify representative routes in the browser**

Open `/`, `/#products`, one category route, and one product detail route at 1440×900 and 390×844. Confirm the hero crop, heading animation, navigation clicks, family preview motion, product links, back navigation, and restored homepage scroll position.

- [ ] **Step 4: Verify accessibility and motion fallback**

Keyboard-tab through header and category rows; confirm visible focus. Emulate `prefers-reduced-motion: reduce`; confirm all information remains visible and decorative motion is disabled.

- [ ] **Step 5: Report final asset and verification summary**

List the production media files copied into `public/media`, identify any family using a representative application image rather than exact SKU imagery, and report automated test/build results.
