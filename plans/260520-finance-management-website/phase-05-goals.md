# Phase 05 — Goals (Savings Goals)

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md), [phase-03](./phase-03-transactions.md)

## Overview
- **Date:** 2026-05-20
- **Description:** Savings goals with target amount, deadline, current saved amount, deposit history. Visual progress + ETA.
- **Priority:** P1
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Deposits stored standalone within goal (per plan.md unresolved Q4 default)
- Progress = currentAmount / targetAmount
- Days remaining computed from deadline vs today

## Requirements
**Functional**
- Grid of goal cards: name, target, current, % progress, deadline, days left, "Nạp tiền" button
- "Thêm mục tiêu" button → modal (name, targetAmount, deadline date picker, optional linked wallet, note)
- Deposit modal: amount + date (default today) + source wallet (subtracts from wallet balance)
- Edit goal: update name/target/deadline
- Delete: confirm
- Achievement badge when 100%

**Non-functional**
- Smooth progress bar animation on deposit

## Architecture

### Goal Schema (extended)
```js
{
  id, name, targetAmount, currentAmount, deadline,
  walletId,            // optional default source wallet
  note,
  deposits: [{ id, amount, date, walletId }]
}
```

### Deposit Logic
```js
function depositToGoal(goalId, amount, walletId, date) {
  const goal = store.findGoal(goalId);
  const wallet = store.findWallet(walletId);
  if (wallet.balance < amount) throw 'Insufficient balance';
  wallet.balance -= amount;
  goal.currentAmount += amount;
  goal.deposits.push({ id: uid(), amount, date, walletId });
  store.commit();
}
```

## Related Code Files

**Create**
- `f:/App-Quan-Ly/goals.html`
- `f:/App-Quan-Ly/css/pages/goals.css`
- `f:/App-Quan-Ly/js/pages/goals.js`

**Modify**
- `f:/App-Quan-Ly/js/modules/store.js` — goal CRUD + `depositToGoal`

## Implementation Steps
1. `goals.html` scaffold + modal portal.
2. `goals.css` — card with progress bar + deadline pill.
3. `goals.js`:
   - Render goal grid
   - Compute % + days left
   - Open modal for add/edit
   - Deposit modal flow
   - Delete with confirm
4. Store: goal CRUD + `depositToGoal` with wallet validation.
5. Edge: deadline in past → show "Quá hạn" badge.

## Todo List
- [ ] `goals.html` scaffold
- [ ] `goals.css` cards + progress
- [ ] Goal CRUD via modal
- [ ] Deposit reduces wallet balance + increases goal
- [ ] Achievement badge at 100%
- [ ] Overdue badge if past deadline
- [ ] Empty state

## Success Criteria
- Add goal "Du lịch" 10M target → renders 0% progress
- Deposit 2M from Vietcombank → wallet balance -2M, goal +20%
- Insufficient balance → error toast, no state change
- Reach 100% → badge "Hoàn thành" appears
- Delete confirms then removes

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Negative balance from deposit | Validate before commit |
| Floating-point math drift | Use integer VND (no decimals) per VN convention |

## Security Considerations
- Validate amount > 0
- Reject deposits to deleted goals

## Next Steps
- Phase 06 (Reports) may surface goal progress
