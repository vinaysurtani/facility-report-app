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
