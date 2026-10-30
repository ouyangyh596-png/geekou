# Full-Site Typography and Layout Refresh Design

## Objective

Refresh the existing SO-FINE website typography, hierarchy, spacing, and colour system so the site reads like a precise automotive-film and engineered-materials brand. Preserve every approved word, product name, specification, image, link destination, interaction, and page order.

The supplied VEYRA prompt is a visual-reference document only. Its copy, page structure, assets, product concepts, and implementation instructions are outside scope and must not be copied into SO-FINE.

## Content Lock

The deployed website at `https://so-fine-site.pages.dev/` is the source of truth for content. The implementation must not:

- add, remove, rewrite, translate, reorder, or rename website copy;
- alter product data, specifications, colour names, navigation labels, or calls to action;
- replace existing media or change product-interaction behaviour;
- introduce VEYRA wording, sections, features, or branding.

Line wrapping may change as a natural result of typography and layout changes. Existing semantic markup may be grouped or wrapped only when required for layout, without changing rendered text.

## Typography System

### Display type

Use locally hosted **Barlow Semi Condensed** for `h1`–`h4`, large product names, and major editorial statements. It provides an automotive and industrial tone, fits long English product names efficiently, and avoids the compressed appearance caused by the current Space Grotesk treatment.

- Use weights 500 and 600 only where hierarchy requires them.
- Default display tracking: approximately `-0.02em`, adjusted toward zero for smaller headings.
- Large-heading line height: `0.98–1.06`.
- Remove Space Grotesk from active typography tokens and production usage.

### Text type

Keep locally hosted **Manrope** for paragraphs, navigation, controls, buttons, forms, and supporting descriptions.

- Body line height: `1.55–1.7` depending on size.
- Keep readable text measures, generally `42–68ch` for prose.
- Increase contrast for supporting copy that is currently too grey.

### Technical type

Keep locally hosted **DM Mono** for kickers, indexes, product codes, technical labels, table headings, progress indicators, and compact metadata.

- Use restrained uppercase tracking.
- Do not use the mono face for long product names or prose.

### Editorial serif accents

Retain the existing serif emphasis only where the markup already uses emphasis. Reduce excessive negative tracking and keep it subordinate to the industrial display face.

## Responsive Type Scale

Use content-aware `clamp()` scales rather than one oversized rule for every section.

### Desktop

- Hero title: approximately `72–96px`.
- Primary section headings: approximately `64–84px`.
- Category-page headings: approximately `56–82px`, constrained by available column width.
- Product and series headings: approximately `22–36px`.
- Body text: generally `14–18px` according to purpose.

### Mobile

- Hero title: approximately `36–50px`.
- Primary section headings: approximately `38–54px`.
- Product and series headings: approximately `20–30px`.
- Avoid forced single-line headings when they reduce readability.
- Preserve natural word boundaries and prevent clipping or horizontal overflow.

## Layout and Hierarchy

### Global rhythm

Use a consistent maximum content width and shared horizontal gutters across the header, section headings, media, product grids, technical tables, and footer. Reduce arbitrary differences between sections while retaining the current section order.

Create hierarchy through:

- measured whitespace above and below headings;
- shorter readable paragraph widths;
- alignment between kickers, headings, descriptions, and media edges;
- differentiated heading scales for brand statements, product families, cards, and technical content;
- balanced desktop two-column compositions that stack cleanly on mobile.

### Homepage

- Preserve the current hero logos, title, CTA, video, and navigation.
- Keep the `SUPER CHROME FILM` gradient treatment, but refine it into a controlled chrome-film reflection using a narrower cool-to-warm spectrum and less rainbow saturation.
- Reduce oversized section headings and extreme tracking so phrases read as complete statements.
- Keep the product carousel and scroll interactions unchanged.
- Rebalance company, technology, material-story, and contact sections through grid alignment and readable copy measures.

### Category and product pages

- Preserve all category, series, model, and specification content.
- Use the display face for category and product identity, Manrope for descriptions, and DM Mono for indexes and codes.
- Improve card-title wrapping and vertical rhythm without changing card order or link behaviour.
- Clarify specification-table hierarchy through contrast, spacing, and type roles rather than heavy borders.

### Automotive interaction areas

- Apply the same typography and colour hierarchy to the Cybertruck colour study and printable-wrap configurator.
- Preserve all current 3D, colour, finish, drag, and configuration behaviour.
- Keep controls readable against the viewer without adding new copy.

## Colour System

Refine the existing SO-FINE palette rather than replacing the brand identity.

- Deep navy: primary dark surface and high-contrast brand field.
- SO-FINE blue: links, active controls, selected states, and directional emphasis.
- Cool white: principal content surface.
- Mist blue: secondary section surface and subtle grouping.
- Ink navy: primary text.
- Blue-grey: supporting text, with higher contrast than the current muted tone.
- Thin cool-blue lines: structural separators.

Use colour to distinguish content roles. Avoid low-contrast grey text, excessive gradients, and repeated saturated blue blocks. Maintain accessible contrast for text and interactive controls.

## Motion and Interaction

Typography and layout changes must not alter navigation, carousel wheel behaviour, touch gestures, 3D controls, forms, hashes, or reduced-motion behaviour.

Any type-related transition must be subtle and must respect `prefers-reduced-motion`. Font loading must use local WOFF2 assets with `font-display: swap` and no third-party runtime dependency.

## Implementation Boundaries

Primary implementation areas:

- local font assets in `public/fonts/`;
- font-face declarations and design tokens in `src/polish.css`;
- scoped layout and colour refinements in `src/polish.css`, with targeted corrections in `src/styles.css` or `src/detail.css` only when required;
- typography regression checks in `scripts/test-typography.mjs`;
- rendered responsive verification at representative desktop and mobile widths.

Avoid broad component rewrites. Add wrappers only where CSS cannot express the approved layout while preserving text and behaviour.

## Verification

Automated verification must confirm:

- Barlow Semi Condensed is locally hosted and used by the display token;
- Space Grotesk is no longer active in production typography;
- Manrope and DM Mono keep their approved roles;
- no website content data files are modified;
- release tests and production build pass;
- the site has no horizontal overflow at 390px and representative desktop widths.

Browser review must cover:

- homepage hero and all major sections;
- Product dropdown;
- product carousel;
- at least one category page and one detailed product presentation;
- Cybertruck colour study and printable-wrap configurator;
- desktop and mobile heading wrapping, text contrast, and control legibility.

## Deployment

After verification, merge the isolated implementation branch into `main`, push it to GitHub, wait for GitHub verification, Cloudflare Pages, and Workers Builds to succeed, then confirm the public site serves the new font and CSS assets.
