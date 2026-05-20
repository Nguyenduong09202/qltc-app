# Vietnamese Personal Finance Management Website — Implementation Plan

**Date:** 2026-05-20
**Plan dir:** `f:/App-Quan-Ly/plans/260520-finance-management-website/`
**Stack:** HTML5 + CSS3 + Vanilla ES6 modules (no build tools, CDN libs only)
**Target:** 9-page SPA-like multi-page app, VN locale, light/dark theme, mock data via localStorage

## Research Inputs
- `research/researcher-01-fintech-ux-patterns.md` — UX patterns, VN locale, breakpoints, theming
- `research/researcher-02-vanilla-js-architecture.md` — ES6 modules, Chart.js v4, Day.js, Lucide, localStorage patterns

## Architecture at a Glance
- Multi-page HTML, each page = own `.html` + own `pages/<name>.js` ES6 module
- Shared modules in `js/modules/`: `store.js`, `storage.js`, `format.js`, `theme.js`, `charts.js`, `ui.js`, `mockdata.js`, `router.js` (auth guard)
- Shared components rendered via template literals + `insertAdjacentHTML` (sidebar, topbar, modal, toast, stat card, transaction item)
- CSS layered: `base.css` (tokens + reset) → `layout.css` (shell, grid) → `components.css` (cards, buttons, tables) → `pages/<name>.css`
- Theme: CSS variables on `:root` and `:root[data-theme="dark"]`; pre-paint script in `<head>` reads localStorage
- Charts: Chart.js v4 via CDN, colors pulled from `getComputedStyle()`, rebuilt on theme toggle
- Mock data: seeded into localStorage on first load from `mockdata.js` (versioned schema)
- Auth: UI-only, `auth.isLoggedIn` flag in localStorage, simple route guard redirects to `/login.html`

## Phases (Implementation Order)

| # | Phase | Status | Progress | File |
|---|-------|--------|----------|------|
| 01 | Foundation & Design System | pending | 0% | [phase-01-foundation-design-system.md](./phase-01-foundation-design-system.md) |
| 02 | Dashboard | pending | 0% | [phase-02-dashboard.md](./phase-02-dashboard.md) |
| 03 | Transactions | pending | 0% | [phase-03-transactions.md](./phase-03-transactions.md) |
| 04 | Budgets | pending | 0% | [phase-04-budgets.md](./phase-04-budgets.md) |
| 05 | Goals | pending | 0% | [phase-05-goals.md](./phase-05-goals.md) |
| 06 | Reports | pending | 0% | [phase-06-reports.md](./phase-06-reports.md) |
| 07 | Accounts / Wallets | pending | 0% | [phase-07-accounts.md](./phase-07-accounts.md) |
| 08 | Settings | pending | 0% | [phase-08-settings.md](./phase-08-settings.md) |
| 09 | Landing Page | pending | 0% | [phase-09-landing.md](./phase-09-landing.md) |
| 10 | Auth (Login/Signup) | pending | 0% | [phase-10-auth.md](./phase-10-auth.md) |
| 11 | Polish, QA, README | pending | 0% | [phase-11-polish-qa.md](./phase-11-polish-qa.md) |

## Key Dependencies
- Phase 01 blocks all others (design tokens, shell, storage, mock data)
- Phases 02–08 share shell from Phase 01 — can be parallelized after 01 completes
- Phase 11 depends on all prior phases

## Unresolved Questions
1. Confirm Day.js `vi` locale ships expected strings ("vài giây trước", "2 ngày trước") — verify on first integration.
2. Should mock data persist user edits between sessions or reset on each load? **Assumed:** persist; reset button in Settings.
3. Auth simulation — accept any non-empty email/password, or hardcoded demo credentials? **Assumed:** any non-empty + 6+ char password passes.
4. Should "Goals" support contributions linked to transactions, or standalone deposits? **Assumed:** standalone deposits stored in goal object.
5. Reports export (CSV/PDF) — in scope? **Assumed:** out of scope for v1; deferred to phase 11 stretch.
