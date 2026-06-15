# Decisions Log

This file tracks architectural and implementation decisions made during development.

## 2026-06-14

### 1. Client-side PDF generation with jsPDF + html2canvas
- **Choice**: jsPDF + html2canvas for PDF export
- **Why**: No backend needed. The report is rendered as HTML in a preview pane, captured as a canvas image, and embedded into a PDF. This keeps the stack simple and fully client-side.
- **Trade-off**: PDF quality depends on screen rendering. Text is rasterized (not selectable in PDF) except for the hyperlink overlay added via jsPDF's `link()` method.

### 2. Tailwind CSS v4 with Vite plugin (not v3 with PostCSS)
- **Choice**: `@tailwindcss/vite` plugin instead of the classic `tailwindcss init -p` PostCSS approach
- **Why**: `npm install tailwindcss` now installs v4 by default. Tailwind v4 dropped the `tailwind.config.js` + PostCSS init workflow in favor of a Vite-native plugin and CSS `@import` directives. Adapted the setup accordingly.
- **Trade-off**: Slightly different config syntax. Theme customization goes in CSS via `@theme` blocks instead of a JS config file.

### 3. CMS Provider Data Catalog API (direct browser fetch)
- **Choice**: Fetch directly from `https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0` in the browser
- **Why**: Avoids needing a backend proxy. CMS public APIs generally allow CORS, but this needs browser testing to confirm.
- **Risk**: If CORS is blocked, a small Express proxy or a serverless function would be needed. Noted as a known risk.

### 4. React 18 + Vite (no TypeScript)
- **Choice**: Plain JSX, not TypeScript
- **Why**: The spec called for `--template react` (not `react-ts`). Keeping it simple for a focused internal tool.

### 5. Abandoned html2canvas — switched to direct jsPDF text/rect rendering
- **Problem**: `html2canvas` failed to capture the report preview because Tailwind v4 uses CSS custom properties (`--color-navy`, etc.) that html2canvas cannot resolve. Export produced a blank PDF.
- **Fix**: Rewrote `pdfExport.js` to draw the entire document imperatively with jsPDF primitives (`pdf.setFillColor`, `pdf.rect`, `pdf.text`, `pdf.line`). No DOM capture involved.
- **Trade-off**: PDF layout is hand-coded and must stay in sync with the visual preview manually.

### 6. Vercel serverless proxy for production CORS
- **Problem**: CMS API (`data.cms.gov`) blocks direct browser `fetch` in production due to CORS.
- **Fix**: Added `api/cms-proxy.js` — a generic Vercel serverless function that accepts `?dataset=...` plus any CMS query params, fetches server-side, and forwards the JSON. Local dev uses the Vite `proxy` config instead.
- **Why generic**: One function handles all datasets (`4pq5-n9py`, `ijh5-nb2v`, `xcdc-v8bm`) so no new serverless functions are needed for future datasets.

### 7. Text-based branding header (no image logo)
- **Problem**: A PNG logo was briefly added to the header. The requirement document specifies the header must read exactly "INFINITE — Managed by MEDELITE", which implies text, not an image.
- **Decision**: Reverted to a navy background text header in both `BrandingHeader.jsx` and `pdfExport.js`. State abbreviation displayed large on the right side.
- **Why**: Safer interpretation of the spec; avoids ambiguity about what "exactly" means for the evaluator.

### 8. Hospitalization / ED metrics via two CMS datasets
- **Dataset 1** (`ijh5-nb2v`): Per-facility measures queried by CCN. Measure codes: 521 (STR hospitalization %), 522 (STR ED visit %), 551 (LT hospitalization per 1000 days), 552 (LT ED visit per 1000 days). Field: `adjusted_score`.
- **Dataset 2** (`xcdc-v8bm`): State and national averages queried by `state_or_nation`. Long field names (e.g. `percentage_of_short_stay_residents_who_were_rehospitalized__1d02`).
- **Decision**: `fetchHospitalizationData` makes 3 parallel requests (facility measures + state avg + national avg) and returns `{ measures, stateAvg, nationalAvg }`.
- **Formatting**: STR values → `toFixed(1)%`; LT values → `toFixed(2)` (per-1000-days rate, no % sign).

### 9. Word export using docx v9
- **Choice**: `docx` library for `.docx` generation, triggered by a separate `DocxButton` component.
- **Format**: Two-table layout — navy header table + data table. `CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 }` (in twentieths of a point). Font size 10pt (size: 20 in half-points). Medicare URL as `ExternalHyperlink`.
- **Fix applied**: Initial export was compressed (no padding, 9pt font). Fixed by adding `CELL_MARGINS` and increasing font size to 20 half-points.

### 10. Empty-fields warning on both export buttons
- **Decision**: Before either PDF or Word export, check the 6 manual fields (EMR, Current Census, Type of Patient, Previous Coverage, Previous Provider Performance, Medical Coverage). If any are blank or whitespace-only, show `window.confirm()` with a bullet list of missing fields.
- **Fix**: `DocxButton` initially lacked this check. Added the same validation block as `ExportButton`.

### 12. AbortController fetch timeout in cmsApi.js
- **Problem**: A slow or unresponsive CMS API would leave the UI stuck in a loading state with no feedback or recovery path.
- **Fix**: Added `AbortController` with a 10-second `setTimeout` to every `cmsQuery()` call. The signal is passed to `fetch()`. On abort, catches `AbortError` specifically and throws a user-friendly message. Timer is cleared in `finally` to avoid spurious aborts on fast responses.

### 13. React ErrorBoundary wrapping the main app
- **Choice**: Class component `ErrorBoundary` defined in `App.jsx`, wrapping the entire app content below the header.
- **Why**: Any uncaught render error (e.g. malformed API data causing a component to throw) would otherwise show a blank white screen. The boundary shows a recovery UI with a "Try again" button that resets the error state.
- **Pattern**: `getDerivedStateFromError` sets the error flag; `componentDidCatch` logs to console for debugging.

### 14. Color-coded star rating badges in ReportPreview
- **Choice**: Replaced plain number display in `RatingRow` with a colored pill badge — green (`bg-emerald-100`) for ≥4, amber for 3, red for 1–2, gray for N/A.
- **Format**: Badge shows "X / 5" with the existing star string (★★★☆☆) alongside it.
- **Why**: Immediately communicates quality at a glance; stronger visual signal than a number alone.

### 15. Hospitalization comparison chart (grouped bar)
- **Choice**: Added two side-by-side grouped bar charts below the star ratings chart in `RatingsChart.jsx`. Left chart: Short-Stay metrics as percentages. Right chart: Long-Stay metrics as per-1,000-days rates.
- **Why split**: STR and LT use different units (% vs rate) — combining them on one Y-axis would be misleading.
- **Colors**: Facility = navy (`#0a1f3f`), State avg = slate (`#94a3b8`), National avg = light blue (`#93c5fd`).
- **Data**: Parsed from `facilityData` string fields (e.g. `"18.5%"` → `18.5`) via a local `parseNum()` helper that strips `%` and handles `N/A`.

### 11. Test setup — Vitest + jsdom + Testing Library
- **Choice**: Vitest (co-located with Vite config), jsdom environment, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- **Config fix**: `globals: true` required in `vite.config.js` test block so `@testing-library/jest-dom` can access `expect` as a global. Without it, all test suites failed with "ReferenceError: expect is not defined".
- **Extension fix**: `ExportButton.test.js` failed with "Unexpected JSX expression" because JSX requires `.jsx` extension for the Vite React plugin. Renamed to `ExportButton.test.jsx`.
- **Coverage**: `fieldMapper.js` 100%, `cmsApi.js` 88%, `ExportButton.jsx` 87%. `pdfExport.js` and `docxExport.js` are not meaningfully testable in jsdom as they rely on browser-only APIs (Blob, URL.createObjectURL, jsPDF canvas, docx Packer).
