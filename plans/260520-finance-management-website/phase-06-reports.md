# Phase 06 — Reports

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md), [phase-03](./phase-03-transactions.md), [phase-04](./phase-04-budgets.md)
- Research: [researcher-01-fintech-ux-patterns.md](./research/researcher-01-fintech-ux-patterns.md) §2

## Overview
- **Date:** 2026-05-20
- **Description:** Analytics page. Multiple chart types showing spending patterns, income/expense trends, category breakdowns, budget performance.
- **Priority:** P1
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Chart selection per use case (research-01 §2): line for trends, donut for splits, bar for comparisons
- Date range picker drives all charts on page
- Color accessibility: use shape/pattern in addition to color

## Requirements
**Functional**
- Date range selector: 7 ngày / 30 ngày / 3 tháng / 6 tháng / 1 năm / Tùy chỉnh
- Chart 1: Line — Thu nhập vs Chi tiêu over selected range
- Chart 2: Donut — Chi tiêu theo danh mục
- Chart 3: Bar — So sánh chi theo tháng (last N months)
- Chart 4: Horizontal bar — Top 5 danh mục chi nhiều nhất
- Summary stat row: total income, total expense, savings rate %, top category
- Budget vs actual table (per category, period = current month)

**Non-functional**
- All charts re-render on date range change + theme toggle
- Maintain `Chart` refs to call `.destroy()` before re-create (avoid memory leak)

## Architecture

### Page-local State
```js
let range = { preset: '30d', from: dayjs().subtract(30,'day'), to: dayjs() };
let charts = { trend: null, donut: null, monthly: null, top: null };
```

### Refresh Flow
1. User changes range → recompute datasets → destroy + recreate charts
2. Theme toggle → existing `charts.js` listener handles colors (no destroy needed; just `chart.update()`)

### Aggregation Helpers
- `txInRange(from, to)`
- `groupByDay(txs)` → for trend
- `groupByCategory(txs)` → for donut + top 5
- `groupByMonth(txs)` → for monthly bar

## Related Code Files

**Create**
- `f:/App-Quan-Ly/reports.html`
- `f:/App-Quan-Ly/css/pages/reports.css`
- `f:/App-Quan-Ly/js/pages/reports.js`

**Modify:** none

## Implementation Steps
1. `reports.html` scaffold: shell, range selector, summary row, 2x2 chart grid (`.charts-grid`), budget table section.
2. `reports.css` — chart containers fixed height 300px desktop / 240px mobile, range pill buttons.
3. `reports.js`:
   - Bind range presets + custom date inputs
   - On change: filter txs, compute aggregates, render
   - Use `charts.createChart()` factory; store refs; destroy before recreate
   - Render summary row
   - Render budget-vs-actual table
4. Verify theme toggle still works on this page (existing listener).
5. Test with empty range (no tx) → show "Không có dữ liệu" in chart area.

## Todo List
- [ ] `reports.html` scaffold
- [ ] `reports.css` chart grid responsive
- [ ] Range selector with 5 presets + custom
- [ ] Line chart (income vs expense trend)
- [ ] Donut (category split)
- [ ] Bar (monthly comparison)
- [ ] Horizontal bar (top 5 categories)
- [ ] Summary stats row
- [ ] Budget vs actual table
- [ ] Charts destroy before recreate
- [ ] Empty state per chart

## Success Criteria
- Switch range 30d → 6 months → all 4 charts re-render with new data
- Theme toggle → all charts adopt new colors smoothly
- Savings rate = (income - expense) / income * 100, formatted to 1 decimal
- Top category list ordered by spent desc
- No console errors after 10 consecutive range changes (memory leak check)

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Chart.js memory leak on re-render | Always `chart.destroy()` before new instance |
| Empty data crash | Guard datasets with default `[]`; show empty placeholder |
| Date range timezone bugs | Use `dayjs().startOf('day')` / `endOf('day')` |

## Security Considerations
- Range inputs validated (from ≤ to)

## Next Steps
- Phase 11 may add CSV export (stretch)
