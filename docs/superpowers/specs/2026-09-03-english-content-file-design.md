# English Main-Site Content File Design

## Goal

Allow non-technical team members to update the English website copy from the GitHub web interface. A committed change should continue through the existing GitHub and Cloudflare Pages deployment flow without requiring local development tools.

## Scope

The first version covers the English main site only. It includes navigation labels, home-page headings and paragraphs, technology and company copy, contact copy, category descriptions, product names, product descriptions, calls to action, and the Cybertruck configurator labels.

It does not include translations, styling, animation settings, image paths, video paths, Three.js parameters, product codes, or technical specification values.

## Content Structure

Create `src/content/site-content.js` as the single editing surface. Export one `englishSiteContent` object divided into these sections:

- `navigation`
- `home`
- `technology`
- `company`
- `contact`
- `categories`
- `products`
- `cybertruck`

The file begins with short Chinese editing instructions. Team members should only change quoted text values and should not rename keys, delete punctuation required by JavaScript, or modify imports and exports.

## Application Integration

Existing React components and data modules will import English copy from `englishSiteContent`. Layout, media, product codes, animations, routes, and visual behavior remain in their current modules.

Where catalog records mix editable copy with structural data, the catalog keeps identifiers, codes, media references, and specifications while sourcing names and descriptions from the centralized content object.

## Validation

Add a content validation test that checks:

- every required top-level section exists;
- required navigation and page labels are non-empty strings;
- every current category and product has English copy;
- content values expected to be strings are not missing.

The existing production build remains the final syntax and integration check. A malformed edit should fail the Cloudflare build instead of publishing a partially broken page.

## Team Workflow

1. A collaborator opens `src/content/site-content.js` on GitHub.
2. They click the edit button, change only the quoted English text, and commit to a branch.
3. They open a pull request for review.
4. After approval and merge to `main`, Cloudflare Pages automatically deploys the update.
5. Git history provides review and rollback for every wording change.

## Success Criteria

- The English site renders the same copy after migration.
- A team member can find all editable English copy in one documented file.
- Changing a representative heading and paragraph in that file changes the corresponding rendered page.
- Missing required content is caught by an automated test.
- Existing interactions, media, styling, and non-English language data are unaffected.
