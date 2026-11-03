### Task 4: Configurator UI and exact-series routing

**Files:**
- Create: `src/components/PrintableWrapConfigurator.jsx`
- Create: `scripts/test-printable-wrap-configurator.mjs`
- Modify: `src/main.jsx:14-20,310-322`
- Modify: `src/content/site-content.js:125-142`
- Modify: `src/polish.css:95-166`
- Modify: `package.json`

**Interfaces:**
- Consumes state helpers from Task 1 and `PrintableWrapViewer` from Task 3.
- Produces a self-contained configurator mounted only for `activeSeries === 'Printable Super Glossy Chrome Wrap Film'`.

- [ ] **Step 1: Write failing routing and UI tests**

Assert exact-series detection, lazy loading, local file input with `accept="image/png,image/jpeg,image/webp"`, Glossy/Matte controls, edit/rotate modes, scale and rotation sliders, reset/remove actions, inline validation status, and no invocation of `fetch`/upload APIs.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test-printable-wrap-configurator`
Expected: FAIL because the configurator does not exist and the exact route is not mounted.

- [ ] **Step 3: Implement local upload lifecycle**

The configurator validates the selected file, creates one object URL, resets placement, and revokes the previous URL when replacing/removing/unmounting. It owns `{ artworkUrl, placement, finish, editMode, error }` and passes pure values to the viewer.

- [ ] **Step 4: Mount the exact series and add responsive styling**

In `CategoryPage`, define:

```js
const isPrintableChrome = activeSeries === 'Printable Super Glossy Chrome Wrap Film'
```

Render `<PrintableWrapConfigurator />` immediately below the series cards for that route. Use the existing 1440px section width and pale-blue visual system. Place controls beside the viewer on desktop and below it on mobile; keep every control outside the canvas with a minimum 44px touch target.

- [ ] **Step 5: Run configurator and release tests**

Run: `pnpm test-printable-wrap-configurator && pnpm test-release`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/PrintableWrapConfigurator.jsx src/main.jsx src/content/site-content.js src/polish.css scripts/test-printable-wrap-configurator.mjs package.json
git commit -m "feat: add printable chrome configurator"
```

