# Phase 03 — Transactions

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01-foundation-design-system.md](./phase-01-foundation-design-system.md), [phase-02-dashboard.md](./phase-02-dashboard.md)
- Research: [researcher-01-fintech-ux-patterns.md](./research/researcher-01-fintech-ux-patterns.md) §4, §6; [researcher-02-vanilla-js-architecture.md](./research/researcher-02-vanilla-js-architecture.md) §6

## Overview
- **Date:** 2026-05-20
- **Description:** Full transaction CRUD. Table with sort, filter (type/category/wallet/date range), search, pagination. Add/Edit/Delete modal. Confirm before delete.
- **Priority:** P0
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Pagination preferred over infinite scroll for an admin-style table (research-02 §6)
- Event delegation on table body (one listener) for row clicks (research-02 §4)
- Filters reset to page 1 (research-02 §6)
- Modal form: category → amount → date → note order (research-01 §6)
- Inline validation, submit disabled until valid

## Requirements
**Functional**
- Toolbar: search input, type filter (all/income/expense/transfer), category filter, wallet filter, date range (from/to), "Thêm giao dịch" button
- Table columns: Ngày | Danh mục | Ví | Ghi chú | Loại | Số tiền | Hành động (edit/delete)
- Sort by date (default desc), amount
- Pagination: 10/page, prev/next + page numbers
- Add modal: type toggle (income/expense/transfer), category select, wallet select, amount, date (default today), note
- Transfer type: shows fromWallet + toWallet selects
- Edit reuses same modal, prefilled
- Delete: confirm dialog → remove from store → toast
- Empty state if filtered result is empty (different message vs "no transactions at all")

**Non-functional**
- Handles ≥1000 tx without UI lag
- Filter applies on debounce 200ms for search input

## Architecture

### State (page-local)
```js
let view = {
  page: 1,
  pageSize: 10,
  sort: { col: 'date', dir: 'desc' },
  filters: { q: '', type: 'all', categoryId: null, walletId: null, from: null, to: null }
};
```

### Render Pipeline
1. `applyFilters(store.data.transactions, view.filters)` → filtered
2. `applySort(filtered, view.sort)`
3. `paginate(sorted, view.page, view.pageSize)` → page slice
4. Render table body via template literals
5. Render pagination controls

### Modal Component (`js/modules/ui.js` extension — declared in Phase 01, this phase builds the form)
- `openTransactionModal({ mode: 'create'|'edit', transaction? })`
- Returns Promise resolving to saved tx or null on cancel
- Validates: amount > 0, category required, wallet required, date required
- On save: if create → `store.addTransaction(tx)`; if edit → `store.updateTransaction(id, tx)`; updates wallet balance

### Wallet Balance Recomputation
- On add expense: wallet.balance -= amount
- On add income: wallet.balance += amount
- On transfer: from -= amount, to += amount
- On edit: revert previous, apply new
- On delete: revert
- Persist via `store.commit()`

## Related Code Files

**Create**
- `f:/App-Quan-Ly/transactions.html`
- `f:/App-Quan-Ly/css/pages/transactions.css`
- `f:/App-Quan-Ly/js/pages/transactions.js`

**Modify**
- `f:/App-Quan-Ly/js/modules/store.js` — add `addTransaction`, `updateTransaction`, `deleteTransaction` methods (with wallet balance side effects)
- `f:/App-Quan-Ly/js/modules/ui.js` — add `openTransactionModal` factory (if not stubbed in P02)
- `f:/App-Quan-Ly/js/pages/dashboard.js` — wire "Thêm giao dịch" button to modal

**Delete:** none

## Implementation Steps

1. Create `transactions.html` with shell mounts, toolbar markup, table skeleton, pagination div, modal portal div.
2. Write `transactions.css` — toolbar flex layout, sticky table header on desktop, mobile card-list fallback for narrow screens.
3. Implement filter/sort/paginate helpers in `transactions.js`:
   - `applyFilters(txs, filters)`
   - `applySort(arr, sort)`
   - `paginate(arr, page, size)`
4. Render functions:
   - `renderToolbar()` — bind events
   - `renderTable(pageRows)` — template literal map
   - `renderPagination(total)` — page buttons
5. Event delegation on table body:
   - Edit button → `openTransactionModal({ mode: 'edit', transaction })`
   - Delete button → `confirm()` → `store.deleteTransaction(id)` → re-render → toast
6. Implement `openTransactionModal`:
   - Build form HTML
   - Bind type toggle (show/hide wallet fields for transfer)
   - Inline validation on blur + on submit
   - On submit: build tx object, call store method, close, return Promise
7. Update `store.js` with CRUD methods + balance recomputation:
   - `addTransaction(tx)` — assigns id (`crypto.randomUUID()` or counter), pushes, adjusts wallet, commits, emits state-changed
   - `updateTransaction(id, patch)` — reverts old balance effect, applies new
   - `deleteTransaction(id)` — reverts balance effect, removes
8. Wire dashboard quick-add button to `openTransactionModal({ mode: 'create' })`.
9. Test: add 50 random tx via console, ensure UI still responsive; filter, sort, paginate.
10. Edge cases: amount = 0 disabled submit; date in future allowed; transfer to same wallet disabled.

## Todo List
- [ ] `transactions.html` scaffold
- [ ] `transactions.css` toolbar + table + responsive
- [ ] Filter/sort/paginate helpers
- [ ] Table renders + event delegation
- [ ] Modal form with validation
- [ ] Transfer type shows from/to wallets
- [ ] Store CRUD methods adjust wallet balances
- [ ] Confirm before delete + toast feedback
- [ ] Search debounce 200ms
- [ ] Pagination controls work
- [ ] Empty state for filtered results
- [ ] Dashboard quick-add wired

## Success Criteria
- Filter by category "Ăn uống" → table shows only food tx, pagination resets to 1
- Add new tx → wallet balance updates in store + dashboard reflects on revisit
- Edit tx → old balance reverted, new applied correctly
- Delete tx → confirm shown, removed, toast "Đã xóa giao dịch"
- 100 tx loaded → pagination works, no UI lag
- Search "lương" → matches notes containing that string
- Transfer between wallets → both balances update by exact amount

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Wallet balance drift after multiple edits | Always revert before reapplying; unit-test the math on console |
| `crypto.randomUUID` missing on old browsers | Fallback to `Date.now() + Math.random()` |
| Modal XSS via note field | Use `textContent` on render; never `innerHTML` user input |
| Pagination off-by-one on edge | Test boundary: 0 results, 1 result, exactly 10, exactly 11 |

## Security Considerations
- Sanitize note text on render (escape `<`, `>`, `&`)
- Validate amount as number, reject NaN/Infinity
- Limit note length to 200 chars

## Next Steps
- Phase 04 (Budgets) reads transactions to compute spent
- Phase 06 (Reports) consumes transaction data for charts
