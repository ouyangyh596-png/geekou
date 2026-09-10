# SO-FINE Website Typography Refresh

## Goal

Give the full website a more consistent, premium industrial character while improving readability across desktop and mobile. Large display titles use the user-selected Space Grotesk direction.

## Typeface system

- **Display:** Space Grotesk for primary page titles, major section headings, product-family titles and large configurator headings.
- **Text:** Manrope for body copy, navigation, buttons, form controls and supporting descriptions.
- **Technical:** DM Mono for kickers, indexes, product codes, specification labels and other compact technical metadata.
- **Fallbacks:** Each family retains sensible system fallbacks so text remains readable if a font asset cannot load.

The open-source webfont files will be stored locally under `public/fonts`. The production site must not depend on Google Fonts or another runtime font service.

## Visual treatment

Space Grotesk headings use medium weight, compact negative tracking and tight but readable line height. The treatment should feel engineered and editorial without becoming aggressive or condensed. Long category and series names may wrap naturally; line breaks must not clip glyphs.

Manrope body copy uses regular and medium weights with slightly more generous line height. Navigation, buttons and short labels keep enough weight for clarity at small sizes. DM Mono remains limited to short technical text rather than paragraphs.

Existing italic serif accent words remain serif. They provide contrast inside selected display headings and are part of the current visual identity.

## Scope

The refresh applies to homepage, company, category, series, product detail, contact, Cybertruck colour study and printable-wrap configurator views. It centralizes font-family decisions into CSS custom properties and removes conflicting late-file overrides where they affect the type system.

Layout, copy, colors, images, interactions and application behavior remain unchanged except for minor spacing or responsive adjustments required by the new font metrics.

## Responsive behavior

Desktop display sizes retain the existing hierarchy. Mobile headings use responsive `clamp()` sizing and balanced line height so long English product names fit without horizontal overflow. Controls and body text remain at readable sizes and preserve current touch-target dimensions.

## Loading and accessibility

Use WOFF2 assets with `font-display: swap`. Declare only the weights used by the interface to limit transfer size. Font swaps must not hide content. Heading levels and accessible names remain unchanged.

## Verification

- Add source checks for local font declarations, font variables and the required display/text/technical mappings.
- Run the existing release suite and production build.
- Inspect representative homepage, category, product-detail and configurator headings at desktop and 390 px mobile widths.
- Confirm there is no page-level horizontal overflow and no failed font requests or browser console errors.
