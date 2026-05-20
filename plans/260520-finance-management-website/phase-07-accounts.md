# Phase 07 — Accounts / Wallets

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md), [phase-03](./phase-03-transactions.md)

## Overview
- **Date:** 2026-05-20
- **Description:** Manage wallets (cash, bank, e-wallet). Show balance, recent activity per wallet, add/edit/delete, transfer between wallets.
- **Priority:** P2
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Wallet balance is the source of truth — transactions adjust it (Phase 03 logic)
- Deleting a wallet with transactions: prompt user (cascade delete vs reassign vs block)
- Initial balance entered manually on creation

## Requirements
**Functional**
- Top stat: Tổng tài sản (sum of all wallet balances)
- Wallet cards grid: name, type, balance, color/icon, recent 3 tx, edit/delete
- "Thêm ví" button → modal (name, type, initialBalance, icon, color)
- Edit wallet (name/icon/color; balance not editable directly — instruct to add adjustment tx)
- Delete wallet: confirm + block if tx exist (option: reassign tx to another wallet first)
- "Chuyển tiền" button → opens transfer modal (from/to/amount/date/note)

**Non-functional**
- Recent tx per wallet limited to 3 inline (link to Transactions page filtered)

## Architecture

### Wallet Card Template
```
[icon background-color] Vietcombank
                        Ngân hàng
                        12.500.000 ₫
─────────────────────────────────
Gần đây:
  20/05  Mua sắm     -250.000 ₫
  19/05  Lương     +15.000.000 ₫
  ...
[Edit] [Delete] [Chuyển tiền]
```

### Delete Behavior
- If `transactions.filter(t => t.walletId === id).length > 0`:
  - Show modal: "Ví này có N giao dịch. Bạn có chắc xóa?"
  - Option: cascade delete all tx OR cancel
  - Phase v1: simpler — block delete with explanation

## Related Code Files

**Create**
- `f:/App-Quan-Ly/accounts.html`
- `f:/App-Quan-Ly/css/pages/accounts.css`
- `f:/App-Quan-Ly/js/pages/accounts.js`

**Modify**
- `f:/App-Quan-Ly/js/modules/store.js` — `addWallet`, `updateWallet`, `deleteWallet` (with tx-check)

## Implementation Steps
1. `accounts.html` scaffold + modal portal.
2. `accounts.css` — wallet card with colored icon backdrop, balance prominent.
3. `accounts.js`:
   - Render total stat
   - Render wallet cards (3 from seed)
   - Bind add/edit/delete/transfer buttons
   - Recent 3 tx per wallet (sorted desc)
4. Store methods + validation:
   - Add: validate name unique, balance ≥ 0
   - Delete: block if tx exist with explanation
5. Transfer modal reuses Phase 03 transaction modal (type=transfer) OR custom inline form.

## Todo List
- [ ] `accounts.html` scaffold
- [ ] `accounts.css` cards
- [ ] Total assets stat
- [ ] Wallet cards with recent tx
- [ ] Add/Edit modal
- [ ] Delete with tx-check guard
- [ ] Transfer modal works (or reuses tx modal)
- [ ] Empty state if no wallets

## Success Criteria
- Sum of wallet balances matches Dashboard total balance
- Add new wallet "Techcombank" with 5M → appears immediately
- Recent tx per wallet shows correct 3 most recent
- Delete wallet with tx → blocked with message
- Transfer 1M from Vietcombank → Tiền mặt → both balances change by 1M

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Wallet deletion orphans tx | Block delete if any tx; instruct user |
| Initial balance counted as income? | No — set directly on wallet object; not in tx list |

## Security Considerations
- Sanitize wallet name on render
- Validate balance is non-negative integer

## Next Steps
- Phase 08 (Settings) may allow currency change (out of scope v1 — VND only)
