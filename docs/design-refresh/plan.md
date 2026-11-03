# Design refresh execution plan

Approved specification: docs/design-refresh-prompt.md. Work on existing design-refresh branch; preserve unrelated working files. No push.

1. Global: consolidate tokens in styles.css, remove conflicting polish declarations, common containers, accessible font floor, reveal motion. Verify typography and build.
2. Header: custom language disclosure with native language names and current selection; navigation spacing. Verify language tests and browser interactions.
3. Hero: white heading, lower-left copy, gradient, subtitle, remove lockup. Verify media contracts and build.
4. PPF: 5/7 grid, readable copy, reduced motion. Verify responsive geometry.
5. Factory: correct copy, navy panel, four explicitly pending metrics. Verify content tests.
6. Carousel: passive gesture-latched wheel, arrows/dots/keys, static model fallback, shared business order. Verify gesture tests and browser.
7. Technology: five-card filled grid, consistent Lucide icons. Verify media tests.
8. Contact/footer: two columns, contact details, form and copyright. Verify build and browser.
9. Categories: hide absent/failed media, equal cards, accessible striped tables and duplicate-spec TODO. Verify media tests and browser.
10. Language: reactive localized content, complete Chinese and English fallback. Verify language/content tests.

Each numbered block is independently committed as style: <block> ... after targeted verification. Final validation: pnpm test-release, build, screenshot every category and home at 1440/1024/390; collect data/image TODOs and evidence in docs/design-refresh.
