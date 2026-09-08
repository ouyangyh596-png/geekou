# Wrap film category migration design

## Goal

Replace the broad Car Wrap Film and Overlaminate Film families with four clearer product families, while retaining every existing model and keeping the homepage product cards and header directory synchronized.

## Final category structure

The site moves from nine to eleven top-level product families.

| New family | Source models | Series retained within the family |
| --- | --- | --- |
| Cast Wrap Vinyl | 6 existing Cast PVC Wrap Film models and 5 existing Cast PVC Overlaminate Film models | Cast PVC Wrap Film; Cast PVC Overlaminate Film |
| Polymeric Wrap Vinyl | 2 existing Polymeric PVC Wrap Film models and 2 existing Polymeric PVC Overlaminate Film models | Polymeric PVC Wrap Film; Polymeric PVC Overlaminate Film |
| Super Chrome Film | 14 existing Super Chrome Film Classic Colours models | Super Chrome Film Classic Colours |
| PVC-Free Film | AF1831 and AF1840 | PVC-Free Film |

The old `car-wrapping` and `overlaminate` categories are removed. Their 29 total models are redistributed exactly as described above. The complete catalogue remains at 82 unique models.

## Data and routes

- Add the four new category slugs: `cast-wrap-vinyl`, `polymeric-wrap-vinyl`, `super-chrome-film`, and `pvc-free-film`.
- Reassign product `category` values in `src/catalog.js`; preserve each existing model number, specification, group/series name, image, and product detail route.
- Update content-backed category definitions so `brochureSeries` automatically provides the new order and labels to all consumers.
- Remove references and routes to `car-wrapping` and `overlaminate`. Legacy hashes are not redirected in this scoped change.
- The Cybertruck colour-study interaction moves to `super-chrome-film`, because that family owns the classic colour models.

## Header and homepage

- The Products directory continues to be data-driven from `categories`; it will render all eleven new/unchanged families with no duplicate hard-coded list.
- The homepage product counter changes to 11 families and the rotating card stack uses the new category sequence.
- New family cards and category detail headers receive valid local representative media. Existing car-wrap and overlaminate media may be reused where they accurately represent the new material family; no remote images are introduced.
- The landing-page product action changes from the deleted Car Wrap Film route to Super Chrome Film, the direct home of the existing interactive colour study.

## Verification

1. Content/catalogue checks prove 82 unique models remain, with exactly 11 ordered categories.
2. Cast and polymeric overlaminate model identifiers appear only in their corresponding new wrap-vinyl family.
3. Products directory and homepage card data derive from the same 11-category source.
4. No active UI route, media manifest entry, or product link targets `car-wrapping` or `overlaminate`.
5. Super Chrome Film loads the Cybertruck colour-study interaction and its 14 colour products.
6. Existing content, navigation, media, accessibility, and build checks pass.
