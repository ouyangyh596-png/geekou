# Webpage English Copy Update

## Scope

- Use the English copy in `Webpage.docx` as the source of truth.
- Do not publish any Chinese notes or labels from the document.
- Replace matching copy in the existing English website without changing the established visual framework.
- Add `SF9000 Series` under `Translucent Film`.
- Add `Decorative Film` as a new top-level product category using the existing category and product-detail patterns.

## Content mapping

- Update the One Way Vision Film series descriptions for Mono, Poly, Cast and PET.
- Update the Self-Adhesive Vinyl introduction and the Mono, Poly, Super Transparent and Super Glossy series descriptions.
- Update the Translucent Film introduction and SF6000 description; add SF9000 and its English description.
- Update the Paint Protection Film, Overlaminate Film and Cold Lamination Film introductions.
- Update Wall Decals introduction plus PVC-Coated and 100% Poly descriptions.
- Add Decorative Film with the English introduction supplied by the document.
- Keep existing English content that already exactly matches the document.
- Preserve the document's English wording and spelling exactly, including apparent typos and placeholders.

## Navigation and data behavior

- Keep content in the existing central data modules so navigation, cards and detail views stay synchronized.
- Give Decorative Film a stable URL/hash category key and make it reachable wherever top-level product categories are listed.
- SF9000 behaves like SF6000: selectable as a series and rendered through the same detail template.
- Do not infer product codes, specifications or descriptions from Chinese notes. Where the document provides no English product data, show only the supplied English category or series copy.

## Verification

- Add content/navigation regression checks before implementation and observe them fail for missing copy/routes.
- Run the focused tests, full release test suite and production build.
- Open the affected pages locally and verify headings, paragraphs, navigation links and responsive layout.
- Confirm no Chinese text from the document was introduced.

