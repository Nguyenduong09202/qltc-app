# Phase 01 — Foundation & Design System

## Context
- Overview: [plan.md](./plan.md)
- Research: [researcher-01-fintech-ux-patterns.md](./research/researcher-01-fintech-ux-patterns.md), [researcher-02-vanilla-js-architecture.md](./research/researcher-02-vanilla-js-architecture.md)
- Blocks: all later phases

## Overview
- **Date:** 2026-05-20
- **Description:** Scaffold project, create CSS design system (tokens + components), shared shell (sidebar/topbar), theme toggle, mock data, storage layer, shared JS modules.
- **Priority:** P0 — critical foundation
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- CSS variables on `:root` + `:root[data-theme="dark"]` enable instant theme swap without FOUC (research-01 §3, research-02 §2)
- Theme bootstrap script must run in `<head>` before paint to apply saved theme before stylesheet renders
- Components built via template literal functions returning HTML strings; injected with `insertAdjacentHTML` — no virtual DOM (research-02 §4)
- localStorage schema versioned via `STORAGE_VERSION` constant; migration hook on load (research-02 §1)
- Chart.js dark sync handled centrally in `charts.js` — single re-render trigger on theme toggle

## Requirements
**Functional**
- Project directory scaffold matches user spec exactly
- Design tokens for both light + dark themes
- Reusable shell (sidebar + topbar) renders identically across pages 2–8
- Theme toggle button in topbar persists choice to localStorage
- Toast + modal base primitives available globally
- Mock data seeds localStorage on first run

**Non-functional**
- Zero FOUC on initial paint
- No external deps beyond CDN libs (Chart.js, Day.js, Lucide)
- All text strings in Vietnamese
- Font: Be Vietnam Pro (primary) + Inter (fallback) via Google Fonts CDN

## Architecture

### Directory Layout
```
f:/App-Quan-Ly/
├── index.html                    # Landing (Phase 09)
├── login.html                    # Phase 10
├── signup.html                   # Phase 10
├── dashboard.html                # Phase 02
├── transactions.html             # Phase 03
├── budgets.html                  # Phase 04
├── goals.html                    # Phase 05
├── reports.html                  # Phase 06
├── accounts.html                 # Phase 07
├── settings.html                 # Phase 08
├── README.md                     # Phase 11
├── assets/
│   ├── fonts/                    # (empty — fonts via CDN)
│   ├── icons/                    # custom SVGs if needed
│   └── images/                   # logo, illustrations
├── css/
│   ├── base.css                  # tokens, reset, typography
│   ├── layout.css                # shell grid, sidebar, topbar
│   ├── components.css            # buttons, cards, modal, toast, table
│   └── pages/
│       ├── dashboard.css
│       ├── transactions.css
│       ├── budgets.css
│       ├── goals.css
│       ├── reports.css
│       ├── accounts.css
│       ├── settings.css
│       ├── landing.css
│       └── auth.css
├── js/
│   ├── modules/
│   │   ├── storage.js            # localStorage wrapper + versioning
│   │   ├── store.js              # in-memory state, hydrated from storage
│   │   ├── mockdata.js           # seed data (transactions, categories, wallets, goals, budgets)
│   │   ├── format.js             # formatVND, formatDate, formatPercent
│   │   ├── theme.js              # toggle, persist, dispatch theme-changed event
│   │   ├── charts.js             # Chart.js factory + theme color reader
│   │   ├── ui.js                 # toast, modal, confirm, empty state
│   │   ├── shell.js              # render sidebar + topbar
│   │   ├── icons.js              # lucide.createIcons() wrapper
│   │   └── router.js             # auth guard + active nav highlighting
│   └── pages/
│       ├── dashboard.js
│       ├── transactions.js
│       ├── budgets.js
│       ├── goals.js
│       ├── reports.js
│       ├── accounts.js
│       ├── settings.js
│       ├── landing.js
│       ├── login.js
│       └── signup.js
└── plans/                        # (existing — do not modify)
```

### Design Tokens (`css/base.css`)
```css
:root {
  /* Brand */
  --color-primary: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #F59E0B;
  --color-info: #0EA5E9;

  /* Surfaces (light) */
  --bg-app: #F9FAFB;
  --bg-surface: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-muted: #F3F4F6;

  /* Text (light) */
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-muted: #9CA3AF;
  --text-inverse: #FFFFFF;

  /* Borders */
  --border-default: #E5E7EB;
  --border-strong: #D1D5DB;

  /* Radius */
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
  --r-xl: 20px;

  /* Spacing scale */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 24px; --s-8: 32px; --s-10: 40px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(17,24,39,.06);
  --shadow-md: 0 4px 12px rgba(17,24,39,.08);

  /* Typography */
  --font-base: "Be Vietnam Pro", "Inter", system-ui, sans-serif;
  --fs-xs: 12px; --fs-sm: 13px; --fs-md: 14px;
  --fs-lg: 16px; --fs-xl: 20px; --fs-2xl: 24px; --fs-3xl: 32px;

  /* Layout */
  --sidebar-w: 240px;
  --topbar-h: 64px;
}

:root[data-theme="dark"] {
  --bg-app: #0B1020;
  --bg-surface: #111827;
  --bg-elevated: #1F2937;
  --bg-muted: #1F2937;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-muted: #6B7280;
  --border-default: #1F2937;
  --border-strong: #374151;
  --shadow-md: 0 4px 12px rgba(0,0,0,.35);
}
```

### Pre-paint Theme Script (must be inline `<head>` on every page)
```html
<script>
  (function(){
    try {
      var t = localStorage.getItem('theme');
      if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) {}
  })();
</script>
```

### LocalStorage Schema (`js/modules/storage.js`)
```js
// Key: "qlct.v1.state"
{
  version: 1,
  auth: { isLoggedIn: false, user: { name, email } | null },
  theme: "light" | "dark",
  preferences: { language: "vi", currency: "VND" },
  data: {
    transactions: [Transaction],
    categories: [Category],
    wallets: [Wallet],
    goals: [Goal],
    budgets: [Budget]
  }
}
```

### Entity Schemas (mock data)
```js
// Transaction
{ id, type: "income"|"expense"|"transfer", amount, walletId, categoryId,
  date: ISO8601, note, createdAt }
// Category
{ id, name, icon: "lucide-name", color: "#hex", type: "income"|"expense" }
// Wallet
{ id, name, type: "cash"|"bank"|"e-wallet", balance, currency: "VND", icon, color }
// Goal
{ id, name, targetAmount, currentAmount, deadline: ISO, walletId, note }
// Budget
{ id, categoryId, period: "monthly", limit, spent, startDate }
```

### Mock Data Seed (minimums)
- **6 categories:** Ăn uống (utensils), Đi lại (car), Giải trí (film), Hóa đơn (receipt), Mua sắm (shopping-bag), Sức khỏe (heart-pulse)
- **3 wallets:** Tiền mặt, Vietcombank, MoMo
- **≥20 transactions** spread across last 60 days, mix of income/expense
- **3 goals:** "Quỹ khẩn cấp", "Du lịch Đà Nẵng", "Mua laptop"
- **5 budgets:** one per spending category (except one)

### Shared Shell (`js/modules/shell.js`)
- Exports `renderShell({ activePage })` injecting sidebar + topbar
- Sidebar links: Dashboard, Giao dịch, Ngân sách, Mục tiêu, Báo cáo, Ví, Cài đặt
- Topbar: page title slot, search (optional), theme toggle, user menu (avatar → logout)
- Mobile (≤767px): sidebar becomes drawer toggled by hamburger
- Active link receives `.is-active` class

### UI Primitives (`js/modules/ui.js`)
- `showToast(msg, type)` — type: success|error|info|warning, auto-dismiss 3s
- `openModal({ title, body, actions })` — focus trap, ESC close, backdrop click closes
- `confirm(msg)` → Promise<boolean>
- `renderEmptyState(container, { icon, title, cta })`
- `renderSkeleton(container, rows)`

## Related Code Files

**Create**
- `f:/App-Quan-Ly/css/base.css`
- `f:/App-Quan-Ly/css/layout.css`
- `f:/App-Quan-Ly/css/components.css`
- `f:/App-Quan-Ly/js/modules/storage.js`
- `f:/App-Quan-Ly/js/modules/store.js`
- `f:/App-Quan-Ly/js/modules/mockdata.js`
- `f:/App-Quan-Ly/js/modules/format.js`
- `f:/App-Quan-Ly/js/modules/theme.js`
- `f:/App-Quan-Ly/js/modules/charts.js`
- `f:/App-Quan-Ly/js/modules/ui.js`
- `f:/App-Quan-Ly/js/modules/shell.js`
- `f:/App-Quan-Ly/js/modules/icons.js`
- `f:/App-Quan-Ly/js/modules/router.js`
- `f:/App-Quan-Ly/assets/images/logo.svg` (simple wordmark)
- `f:/App-Quan-Ly/_template.html` (reference template — head + shell mount points)

**Modify:** none
**Delete:** none

## Implementation Steps

1. Create directory tree per "Directory Layout" above.
2. Write `css/base.css` with all tokens (light + dark), CSS reset, base typography, body bg + text color binding to tokens.
3. Write `css/layout.css` — flex/grid app shell (`.app`, `.app-sidebar`, `.app-topbar`, `.app-main`), responsive media queries for 1280/768/375.
4. Write `css/components.css` — `.btn`, `.btn-primary/secondary/ghost/danger`, `.card`, `.stat-card`, `.table`, `.tag`, `.modal`, `.toast`, `.input`, `.select`, `.form-field`, `.progress-bar`, `.empty-state`, `.skeleton`.
5. Implement `storage.js` — `loadState()`, `saveState(state)`, version check + migrations stub, `subscribe(callback)` via `storage` event.
6. Implement `mockdata.js` — exported `seedData` constant; helper `seedIfEmpty()` writes to storage if no `qlct.v1.state` key.
7. Implement `store.js` — in-memory mirror of state; `store.load()`, `store.commit()`, `store.update(path, value)`; emits `state-changed` CustomEvent.
8. Implement `format.js`:
   - `formatVND(n)` → uses `n.toLocaleString('vi-VN')` then appends ` ₫`
   - `formatDate(d, pattern='DD/MM/YYYY')` via Day.js
   - `formatRelative(d)` via Day.js `relativeTime` plugin + vi locale
   - `formatPercent(n, digits=0)`
9. Implement `theme.js` — `getTheme()`, `setTheme(t)`, `toggleTheme()`; sets `data-theme` attr, writes localStorage, dispatches `theme-changed` event.
10. Implement `charts.js` — `getChartColors()` reads CSS vars via `getComputedStyle(document.documentElement)`; `createChart(ctx, config)` factory; `registerChart(chart)` keeps refs; on `theme-changed` event iterate refs, recompute colors, call `chart.update()`.
11. Implement `ui.js` — toast container appended to `<body>` once; modal portal; helper functions per spec.
12. Implement `icons.js` — `mountIcons()` wraps `lucide.createIcons()`; safely no-op if Lucide not loaded.
13. Implement `shell.js` — `renderShell({ activePage })` injects HTML strings into `#app-sidebar` + `#app-topbar` mount divs; binds hamburger, theme toggle, user menu, logout handler.
14. Implement `router.js` — `requireAuth()` redirects to `/login.html` if `state.auth.isLoggedIn !== true`; `markActiveNav(activePage)`.
15. Create `_template.html` reference showing standard `<head>` (theme pre-paint script, fonts, CSS, CDN libs deferred), shell mount points, footer scripts.
16. Smoke-test: open any future page → mocks seed → shell renders → theme toggle works → no console errors.

## Todo List
- [ ] Directory tree created
- [ ] `base.css` tokens (light + dark) complete
- [ ] `layout.css` responsive shell at 1280/768/375
- [ ] `components.css` primitives ready
- [ ] `storage.js` versioned schema + migration stub
- [ ] `mockdata.js` ≥20 tx, 6 categories, 3 wallets, 3 goals, 5 budgets
- [ ] `store.js` load/commit/update API
- [ ] `format.js` VND + date helpers verified with sample
- [ ] `theme.js` toggle persists + emits event
- [ ] `charts.js` color reader + re-render hook
- [ ] `ui.js` toast + modal + confirm + empty + skeleton
- [ ] `shell.js` sidebar + topbar render
- [ ] `icons.js` Lucide mount wrapper
- [ ] `router.js` auth guard
- [ ] `_template.html` reference
- [ ] Smoke test: theme toggle, no FOUC, mocks seed

## Success Criteria
- All files in scaffold exist and import cleanly
- Visit any blank page importing shell.js — sidebar + topbar render in light theme
- Toggle theme — instant swap, persists across reload, no FOUC
- `localStorage.qlct.v1.state` populated with full seed data on first load
- `formatVND(1500000)` returns `"1.500.000 ₫"`
- `formatDate(today)` returns `"20/05/2026"`
- Lucide icons render
- No console errors at any breakpoint (1280, 768, 375)

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| FOUC on slow connections | Inline pre-paint script in `<head>`; critical CSS first |
| CSS var typo cascades | Centralize all tokens in `base.css`; document via comments |
| localStorage corruption | Try/catch on parse; `version` check resets if mismatch |
| Lucide CDN failure | `icons.js` checks `typeof lucide` before calling; fallback emoji optional |
| ES6 module CORS on `file://` | README mandates Python http.server or Live Server |

## Security Considerations
- No real backend → no real PII; emails stored only locally
- Auth is UI-only; document clearly in README
- Sanitize any user-entered text before injecting into `insertAdjacentHTML` — use `textContent` or escape helper for note/name fields

## Next Steps
- Phase 02 (Dashboard) consumes shell, store, charts, format, ui, icons
- All subsequent phases depend on this foundation being merged first
