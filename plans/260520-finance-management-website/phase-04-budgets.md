# Phase 04 — Budgets

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md), [phase-03](./phase-03-transactions.md)
- Research: [researcher-01-fintech-ux-patterns.md](./research/researcher-01-fintech-ux-patterns.md) §2

## Overview
- **Date:** 2026-05-20
- **Description:** Monthly budget per category. Visual progress bars, over-budget warning, add/edit/delete budgets.
- **Priority:** P1
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Color thresholds: <70% green, 70–99% yellow, ≥100% red (research-01 §2)
- Spent computed dynamically from transactions, not stored stale
- One budget per category per month (uniqueness constraint)

## Requirements
**Functional**
- Header: month selector (default current month)
- Summary card: Tổng ngân sách | Tổng đã chi | Còn lại | % used
- Grid of budget cards (one per budget): category icon + name, limit, spent, progress bar, remaining
- Color states: green / yellow / red per threshold
- "Thêm ngân sách" button → modal (category, limit amount)
- Edit + Delete per card
- Empty state if none

**Non-functional**
- Recalculate spent on each render from current store state

## Architecture

### Computed Spent
```js
function spentForBudget(budget, txs, monthIso) {
  return txs
    .filter(t => t.type === 'expense'
      && t.categoryId === budget.categoryId
      && dayjs(t.date).isSame(monthIso, 'month'))
    .reduce((s,t)=>s+t.amount, 0);
}
```

### Budget Card Template
```
[icon] Ăn uống                          2.500.000 / 3.000.000 ₫
[================75%==        ] (yellow)
Còn lại: 500.000 ₫
[Edit] [Delete]
```

### Store Methods (extend)
- `addBudget({ categoryId, limit })` — assigns id, default period 'monthly', startDate first of month
- `updateBudget(id, patch)`
- `deleteBudget(id)`

## Related Code Files

**Create**
- `f:/App-Quan-Ly/budgets.html`
- `f:/App-Quan-Ly/css/pages/budgets.css`
- `f:/App-Quan-Ly/js/pages/budgets.js`

**Modify**
- `f:/App-Quan-Ly/js/modules/store.js` — budget CRUD methods

## Implementation Steps
1. `budgets.html` scaffold with shell, month selector, summary card, grid container, modal portal.
2. `budgets.css` — card grid `repeat(auto-fill, minmax(280px,1fr))`, progress bar styles for green/yellow/red modifiers.
3. `budgets.js`:
   - Read selected month (default current)
   - Compute summary + per-budget spent
   - Render summary + grid
   - Bind month change → re-render
   - Modal form: category select (filter out categories already budgeted), limit amount input
   - Edit reuses modal prefilled
   - Delete with confirm
4. Add store CRUD methods.
5. Show toast on over-budget (≥100%) on initial render (optional warning UX).

## Todo List
- [ ] `budgets.html` scaffold
- [ ] `budgets.css` cards + progress thresholds
- [ ] Spent calculation correct vs transactions
- [ ] Summary aggregates total/spent/remaining
- [ ] Add/Edit/Delete via modal
- [ ] Month selector switches data
- [ ] Color thresholds applied
- [ ] Empty state

## Success Criteria
- Budgets show spent matching transaction sums for current month
- Add new budget → appears immediately
- Switch month → spent recomputed for that month
- Edit limit from 3M to 5M → progress bar adjusts (75% → 50%)
- Over-budget category shows red bar + warning indicator
- Delete confirms then removes

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Budget for already-budgeted category | Filter category select to exclude existing; show toast on duplicate |
| Month boundary edge case (timezone) | Use `dayjs.startOf('month')` consistently |

## Security Considerations
- Validate limit > 0
- Reject category not in seed list

## Next Steps
- Phase 06 (Reports) cross-references budgets vs actual
