# SO-FINE High-Resolution Visual Refresh Design

## Objective

Use the high-resolution company and product assets under `/Users/geekou/Desktop/设计` to enrich the existing SO-FINE React website while preserving its restrained blue-and-white, technology-led identity. Every production asset used by the site must be copied into the project directory and optimized for web delivery.

## Visual Direction

The selected direction is restrained editorial storytelling. Large images are used as deliberate focal points, not as a dense catalogue collage. Product imagery should demonstrate the material, its surface behavior, or a credible installed application. Layout, typography, whitespace, and motion remain more important than image quantity.

## Asset Rules

- Prefer original photographs and independent source images over rendered brochure spreads.
- Prefer images at least 1600 pixels wide for desktop feature areas.
- Avoid low-resolution previews, screenshots, watermarked images, and images with baked-in promotional copy.
- Match each image to its actual product family; do not use generic automotive imagery for architectural films or vice versa.
- Copy selected files into `public/media/` with semantic English filenames.
- Produce responsive WebP derivatives while preserving originals only where useful.
- Lazy-load all imagery below the hero and provide descriptive English alt text.

## Homepage

### Hero

Keep the SO-FINE factory as the main full-screen image. Use the high-resolution factory photograph with a responsive focal point so the building sign remains visible on desktop and mobile. Apply a restrained blue tonal overlay for text contrast, subtle scale/parallax movement, and a soft film-like highlight. The existing logo and four-word headline remain visually dominant.

### Material Story Strip

Add a compact editorial strip immediately after the hero containing three complementary views: film surface detail, installed architectural/signage application, and automotive finish. Images reveal with clipped mask motion as the user scrolls. This section introduces the product range without duplicating the category list.

### Product Families

Retain the current category-first navigation. Each category row gains a correctly matched preview image. On desktop, hover or keyboard focus expands the image and shifts the title subtly; on mobile, the image remains visible as a stable card header. Clicking still enters the category page, and existing scroll restoration behavior is preserved.

### Company and Capability

Use factory and exhibition/production imagery in an asymmetric editorial composition. Capability cards retain their blue-white styling and vector motion; supporting photographs appear only where they add evidence of manufacturing scale or application expertise.

## Product Category and Detail Pages

- Each product family receives a wide category hero using a matching application or material photograph.
- Product model cards use consistent aspect ratios and larger model names.
- Where a model-specific image exists, use it. Otherwise use the correct family-level image and identify it as an application image through alt text rather than implying it is the exact SKU.
- Detail pages may contain a primary image, a close material detail, and an application image when available.
- Existing product data, model navigation, language behavior, and previous/next controls must remain functional.

## Family-to-Asset Mapping

- One Way Vision: perforated-glass and window application photography.
- Self-Adhesive Vinyl: printable vinyl, advertising graphics, and installed signage.
- Translucent Film: illuminated signs and light-box applications.
- PPF: transparent automotive paint-protection applications and close surface details.
- Car Wrapping Film: vehicle wrap photography and color/material roll details.
- Overlaminate Film: clear protective surface and roll-detail imagery.
- Cold Lamination Film: finished print protection and lamination close-ups.
- Wall Decals: interior wall and environmental-graphics applications.

## Motion

Use opacity, clipping masks, subtle image scale, and small typographic shifts. Avoid continuous decorative movement that competes with reading. Respect `prefers-reduced-motion`. Scroll animations must reverse cleanly when scrolling upward and must not hide headings after category selection.

## Responsive Behavior

Desktop content remains centered within the approximately 1700 px layout width. Hero images use independent desktop and mobile focal positions. Product previews switch from hover-driven expansion to always-visible image blocks below tablet width. Typography uses fluid sizing with explicit mobile line breaks for the main headline.

## Performance and Verification

Target appropriately sized WebP images rather than serving camera originals. Preserve visual quality at high-density desktop sizes, but keep initial hero transfer practical. Verify the production build, homepage navigation, all product links, language switching, scroll restoration, keyboard focus, and representative desktop/mobile viewport screenshots.
