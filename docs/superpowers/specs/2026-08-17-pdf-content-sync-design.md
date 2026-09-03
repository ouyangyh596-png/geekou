# SO-FINE Brochure Content Synchronization Design

## Objective

Update the SO-FINE website so that company information, product families, model lists, technical specifications, and contact details are derived from `修改后小册子.pdf`. The brochure is the authoritative content source. Existing website images and interaction design remain in place where they still match the listed products.

## Source handling

- Treat visible brochure tables and paragraphs as authoritative.
- Correct obvious export artifacts, duplicated characters, punctuation, spacing, and clear English spelling mistakes without changing technical meaning.
- Exclude page numbers, catalogue navigation numbers, decorative slogans repeated in footers, Illustrator text duplication, and placeholders such as `XX calendar line`, `XX cast line`, and `XX m² annual output`.
- Do not invent specifications that are absent from the brochure.

## Company content

Replace the current short company description with brochure-backed content covering:

- Established in 2005 and 20 years of industrial experience.
- Integrated capabilities in self-adhesive material handling, manufacturing, scientific research, sales, and services.
- Modern production facilities, an equipped R&D laboratory, quality-control systems, selected domestic and imported raw materials, and consistent product quality.
- Recognition as an Innovative Technology Enterprise.
- Dedicated teams serving signage and automotive-detailing applications.

The company section will use edited, professional English while preserving these facts. Unsupported current claims, including unverified country counts and monthly production figures, will be removed.

## Product taxonomy

The homepage and category pages will be aligned to these brochure families:

1. One Way Vision Film
2. Self-Adhesive Vinyl
3. Translucent Film - SF6000 Series
4. Paint Protection Film
5. Car Wrap Film
6. Overlaminate Film
7. Cold Lamination Film
8. Wall Decals Self-Adhesive Material

SPC/LVT and other categories not represented in the new brochure will be removed from primary navigation and product-family listings.

## Product data

Each brochure-listed model will receive structured data fields appropriate to its table:

- Common: product code, material or series, thickness, finish, adhesive, liner.
- One Way Vision: perforation ratio, hole size, SOL/ESOL/UV/Latex compatibility.
- Printable vinyl and wrap film: SOL/ESOL/UV/Latex compatibility.
- SF6000: features plus physical and chemical property values and test methods.
- Wall decals: weight and material.
- PPF marketing entries: model or series name and brochure-backed features only.

Models absent from the brochure will not appear in the primary catalogue. Existing local images may be reused only when their filenames/model identity match. Products without a matching local image will use a restrained family-level visual rather than an unrelated photo.

## Website presentation

- Preserve the current blue-white visual system, navigation behavior, responsive layout, scroll animations, product cards, and detail-page structure.
- Replace generic product descriptions with concise brochure-derived family descriptions.
- Product detail pages will show only meaningful, populated specification rows.
- Printing compatibility will be presented as a clear specification row rather than copied table symbols.
- The homepage company and capability copy will be updated without changing the overall layout.

## Contact information

Use the brochure contact block:

- Zhejiang SO-FINE Self-Adhesive Products Co., Ltd.
- No. 99 Wufu Road, Tianzihu Modern Industrial Park, Anji County, Zhejiang, China.
- Ningbo SO-FINE Import and Export Co., Ltd.
- Block 66, No. 31 West Hongtang Road, Hongtang Town, Jiangbei District, Ningbo, Zhejiang, P.R. China 315033.
- Telephone: +86-574-8716-7701 / +86-574-8716-7702.
- Fax: +86-574-8716-7703.
- Email: admin@so-fine.com.cn.

The existing inquiry form and internal database behavior remain unchanged.

## Data boundaries

- Product content will be centralized in catalogue data files so category cards and detail pages use the same source.
- Company and capability copy will be centralized instead of maintaining multiple conflicting homepage versions.
- Existing scraped descriptions containing language menus, contact fragments, HTML residue, or wholesale-page boilerplate will be removed.

## Validation

- Confirm every brochure model appears once in the correct family.
- Compare all model specifications against brochure pages 5, 7, 9, 11, and 12.
- Confirm unsupported categories and claims are absent from visible pages.
- Build the React project successfully.
- Test homepage navigation, all category links, representative product detail pages, language selection, mobile layout, contact form API, and back-navigation scroll restoration.
