# Phase 02 — Dashboard

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01-foundation-design-system.md](./phase-01-foundation-design-system.md)
- Research: [researcher-01-fintech-ux-patterns.md](./research/researcher-01-fintech-ux-patterns.md) §1, §2, §7

## Overview
- **Date:** 2026-05-20
- **Description:** Most important screen. Hero balance, stat cards, income/expense line chart, category donut, recent transactions list, upcoming bills/goals snapshot.
- **Priority:** P0
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Hero metric at top (total balance + daily delta) per fintech 2026 pattern (research-01 §1)
- Stat cards in 3-col grid on desktop, 2-col tablet, 1-col mobile
- Line chart for last-6-months income vs expense; donut for current-month category split
- Skeletons load while data hydrates; empty state if no transactions
- Color coding: green income, red expense, follow palette exactly

## Requirements
**Functional**
- Header: greeting "Xin chào, {name}" + date "Hôm nay, dd/MM/yyyy"
- Hero card: Tổng số dư (sum of wallet balances), monthly income, monthly expense, net savings
- 4 stat cards: Thu tháng này, Chi tháng này, Tiết kiệm, Số giao dịch
- Chart 1: Line — Thu nhập vs Chi tiêu, 6 tháng gần nhất
- Chart 2: Donut — Chi tiêu theo danh mục (current month)
- Recent transactions list (latest 5) with category icon, name, amount, date
- Goals progress mini-list (top 3 goals with progress bar)
- Quick action: "Thêm giao dịch" button → opens shared transaction modal (from Phase 03)

**Non-functional**
- First meaningful paint < 500ms on cached load
- Charts respond to theme toggle within 100ms
- Responsive at 1280/768/375 without horizontal scroll

## Architecture

### Layout (desktop ≥1280)
```
[Hero card — full width]
[Stat 1] [Stat 2] [Stat 3] [Stat 4]
[Line chart 2/3]          [Donut 1/3]
[Recent tx 2/3]           [Goals snapshot 1/3]
```

### Tablet (768–1279)
- Stats 2x2
- Charts stacked
- Recent tx + goals stacked

### Mobile (375)
- All single column
- Hero compact (no delta bars)

### Data Flow
1. `dashboard.js` imports `store`, `format`, `charts`, `shell`, `ui`, `icons`
2. On `DOMContentLoaded`: `shell.renderShell({ activePage: 'dashboard' })` → `store.load()` → compute aggregates → render
3. Subscribe to `theme-changed` → charts auto-update via `charts.js` registry
4. Subscribe to `state-changed` → re-render

### Aggregation Helpers (inline in `dashboard.js`)
```js
function totalBalance(wallets) { return wallets.reduce((s,w)=>s+w.balance, 0); }
function monthlyTotals(txs, type, monthOffset=0) {
  const target = dayjs().subtract(monthOffset, 'month');
  return txs.filter(t => t.type===type && dayjs(t.date).isSame(target,'month'))
            .reduce((s,t)=>s+t.amount, 0);
}
function categoryBreakdown(txs, categories) { /* group by categoryId, sum amount */ }
function last6Months(txs) { /* return [{ month, income, expense }] */ }
```

## Related Code Files

**Create**
- `f:/App-Quan-Ly/dashboard.html`
- `f:/App-Quan-Ly/css/pages/dashboard.css`
- `f:/App-Quan-Ly/js/pages/dashboard.js`

**Modify**
- none (consumes Phase 01 modules as-is)

**Delete:** none

## Implementation Steps

1. Create `dashboard.html` with: `<head>` pre-paint theme script, fonts, base.css/layout.css/components.css/pages/dashboard.css, Chart.js + Day.js + Lucide CDN scripts (defer), shell mount divs, main content scaffold (`<section class="hero">`, `<section class="stats">`, `<section class="charts">`, `<section class="lists">`).
2. Write `css/pages/dashboard.css` — hero card style (gradient bg using primary), stat card grid (CSS grid `repeat(auto-fit, minmax(220px,1fr))`), chart containers `position: relative; height: 320px`, lists card styles.
3. Implement `dashboard.js`:
   - Import modules
   - `await store.load()` (or sync)
   - Compute aggregates
   - Render hero numbers via `formatVND`
   - Render stat cards
   - Create line chart (Chart.js, type 'line', 2 datasets)
   - Create donut chart (type 'doughnut')
   - Render recent transactions (latest 5, sorted desc)
   - Render goals mini-list
   - Bind "Thêm giao dịch" button → opens transaction modal (placeholder until Phase 03 finalizes; for now show toast "Coming soon" OR open simple modal with fields)
   - Listen for `theme-changed` and `state-changed`
4. Skeleton states: while computing, show shimmer cards (100ms delay before hide to avoid flash).
5. Empty state: if no transactions, show illustration + "Bạn chưa có giao dịch nào" + CTA.
6. Test responsive breakpoints.

## Todo List
- [ ] `dashboard.html` scaffold + script/style imports
- [ ] `dashboard.css` complete with hero, stats, charts, lists
- [ ] Aggregation helpers compute correctly
- [ ] Hero numbers + stats render in VND format
- [ ] Line chart renders 6 months
- [ ] Donut chart renders category split
- [ ] Recent tx list (5 items, with icons)
- [ ] Goals mini-list (top 3, progress bars)
- [ ] Theme toggle updates chart colors
- [ ] Empty state shows when no data
- [ ] Responsive at 1280/768/375

## Success Criteria
- Open `dashboard.html` after seed → page renders fully in < 1s
- Total balance equals sum of 3 wallet balances
- Monthly totals match seeded transactions for current month
- Line chart shows 6 months data without empty gaps
- Toggle theme → both charts re-render in new colors smoothly
- Resize to 375px → no overflow, all elements stack
- Click "Thêm giao dịch" → modal opens (or stub toast)

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Chart.js layout shift on init | Set fixed container height; aspectRatio: false |
| Theme toggle leaves stale chart colors | Centralized re-render via `charts.js` event listener |
| Aggregation slow with many tx | Compute once on load, cache in module scope |
| Day.js missing relativeTime plugin | Import plugin script + `dayjs.extend(relativeTime)` |

## Security Considerations
- Sanitize `user.name` before injecting into greeting (escape HTML)
- No XSS surface beyond user-entered note/name — use `textContent` for those

## Next Steps
- Phase 03 builds the transaction modal Dashboard reuses
- Phase 04+ link from dashboard via sidebar
