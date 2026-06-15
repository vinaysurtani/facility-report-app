# Facility Assessment Report Generator
**INFINITE — Managed by MEDELITE**

A lightweight web application that allows a Medelite director to enter a facility's CCN, instantly pull public CMS data, combine it with manual operational inputs, and download a polished PDF or Word report.

**Live URL:** https://facility-report-app.vercel.app/  
**Repository:** https://github.com/vinaysurtani/facility-report-app

---

## Features

- **CCN Lookup** — queries the CMS Provider Data Catalog API for facility info, star ratings, and all 12 hospitalization/ED metrics
- **Facility Name Override** — pre-populated from the API, editable for internal naming conventions
- **Manual Inputs** — EMR, Current Census, Patient Type, Previous Medelite Coverage (Yes/No), Provider Performance, Medical Coverage
- **PDF Export** — direct jsPDF rendering with clickable Medicare Care Compare hyperlink
- **Word Export** — `.docx` via the `docx` library, matching PDF layout
- **Star Ratings Chart** — color-coded horizontal bar chart (green/amber/red)
- **Hospitalization Comparison Chart** — grouped bars comparing facility vs state vs national averages
- **Opportunity Score** — composite 0–100 score with auto-generated sales talking points
- **Error Boundary** — catches React render errors with a recoverable fallback UI
- **Auto-retry** — single automatic retry on CMS API 500 errors or timeouts

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| PDF Export | jsPDF v4 (direct drawing — no html2canvas) |
| Word Export | docx v9 |
| Charts | Recharts |
| Tests | Vitest + @testing-library/react |
| Hosting | Vercel (with serverless CORS proxy) |

---

## Local Setup

```bash
git clone https://github.com/vinaysurtani/facility-report-app.git
cd facility-report-app
npm install
npm run dev
```

Open http://localhost:5173 and enter CCN `686123` to test with the reference facility (Kendall Lakes Healthcare and Rehab Center).

---

## Running Tests

```bash
npm test                # run all tests
npm run test:coverage   # run with coverage report
```

---

## Engineering Assumptions

**1. CORS proxy required for production**  
The CMS Provider Data Catalog API (`data.cms.gov`) blocks direct browser `fetch` calls due to CORS. In development, Vite's built-in proxy handles this transparently. In production (Vercel), a generic serverless function at `api/cms-proxy.js` forwards all requests server-side. This function accepts any `dataset` parameter so it works for all three CMS datasets used (`4pq5-n9py`, `ijh5-nb2v`, `xcdc-v8bm`).

**2. PDF uses direct drawing, not DOM capture**  
`html2canvas` — the standard approach for HTML-to-PDF — cannot resolve Tailwind v4's CSS custom properties (`var(--color-navy)`), producing a blank canvas. The PDF is instead drawn imperatively using jsPDF primitives, which produces a cleaner, fully text-selectable document.

**3. Hospitalization dataset identification**  
The 12 hospitalization/ED metrics are spread across two CMS datasets not documented in the primary data dictionary: `ijh5-nb2v` (per-facility claims measures, codes 521/522/551/552) and `xcdc-v8bm` (state and national averages). These were identified by cross-referencing the CMS API explorer and validating output against the reference PDF for CCN 686123.

**4. Opportunity Score formula**  
The 0–100 composite score is calculated as: star ratings average (40 pts) + hospitalization rates vs state benchmarks (40 pts) + census utilization (20 pts). This is an internal sales tool heuristic to help Medelite directors prioritize outreach, not an official CMS metric.
