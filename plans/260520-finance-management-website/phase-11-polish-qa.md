# Phase 11 — Polish, Cross-Browser QA, README

## Context
- Overview: [plan.md](./plan.md)
- Depends on: all prior phases (01–10)

## Overview
- **Date:** 2026-05-20
- **Description:** Final polish pass — accessibility audit, cross-browser QA, performance check, README documentation.
- **Priority:** P2
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Run a11y check against WCAG 2.1 AA (research-01 §2)
- Test FOUC on slow connections (throttled)
- Verify Vietnamese diacritics render correctly across all font weights

## Requirements
**Functional**
- All keyboard navigation works (Tab, Esc, Enter on forms/modals)
- Skip-to-content link for screen readers
- All interactive elements have visible focus rings
- Modals have correct ARIA (`role="dialog"`, `aria-modal`, `aria-labelledby`)
- Color contrast meets 4.5:1 for text
- Charts have alt-text summary
- All Vietnamese strings reviewed for typos

**Non-functional**
- Lighthouse score ≥ 90 for Performance, Accessibility, Best Practices
- Page weight < 500KB per page (excluding CDN libs)
- No console errors anywhere
- Works on Chrome, Firefox, Edge (latest), Safari (latest)

## Architecture
N/A — polish only

## Polish Checklist

### Accessibility
- [ ] Add skip-link at top of every page
- [ ] All buttons/links have accessible names
- [ ] Inputs have `<label>` associations
- [ ] Modal focus trap verified on all CRUD modals
- [ ] Tab order logical
- [ ] Color contrast verified (use DevTools)
- [ ] Charts include `aria-label` summary
- [ ] Lucide icons decorative → `aria-hidden="true"`

### Performance
- [ ] All CDN scripts use `defer` or `async` where safe
- [ ] Images optimized (SVG or compressed PNG)
- [ ] No unused CSS rules (visual scan)
- [ ] Charts destroy before recreate (memory)
- [ ] Long lists use event delegation (no per-row listeners)

### Cross-Browser
- [ ] Chrome 120+
- [ ] Firefox 120+
- [ ] Edge 120+
- [ ] Safari 17+
- [ ] iOS Safari (manual test if available)
- [ ] Android Chrome (manual test if available)

### Responsive
- [ ] 1280px — full sidebar
- [ ] 768px — drawer sidebar, 2-col grids
- [ ] 375px — drawer, 1-col, thumb-friendly buttons (44px+ touch targets)
- [ ] No horizontal scroll at any width

### Vietnamese Content
- [ ] All UI strings reviewed by native reader (or careful self-review)
- [ ] Be Vietnam Pro font loads on all pages
- [ ] VND formatting consistent everywhere (`1.500.000 ₫`)
- [ ] Date format `DD/MM/YYYY` consistent
- [ ] Relative time strings ("2 ngày trước") working

### Edge Cases
- [ ] Empty states render for: transactions, budgets, goals, reports range, wallets
- [ ] Large data: seed 200 tx, ensure UI responsive
- [ ] Storage corruption: manually invalidate JSON, ensure app recovers
- [ ] Offline: still works (everything localStorage)

### Stretch (optional)
- [ ] CSV export on Reports page
- [ ] Keyboard shortcuts (e.g. `n` for new transaction)
- [ ] PWA manifest + service worker

## Related Code Files

**Create**
- `f:/App-Quan-Ly/README.md` — project overview, setup, running, features, tech stack, structure, screenshots
- `f:/App-Quan-Ly/.gitignore` — node_modules (none here), .DS_Store, .vscode/, etc.

**Modify**
- Any file with discovered bugs
- Possibly all HTML files (add skip-link)

## README.md Outline
```
# Ứng Dụng Quản Lý Tài Chính Cá Nhân
Brief description (VI + EN)

## Tech Stack
HTML5, CSS3, Vanilla ES6, Chart.js, Day.js, Lucide

## Getting Started
- Clone
- `python -m http.server 8000` (or VS Code Live Server)
- Open http://localhost:8000

## Features
- 9 pages: Landing, Auth, Dashboard, Transactions, Budgets, Goals, Reports, Accounts, Settings
- Light/Dark theme
- Vietnamese locale
- Mock data via localStorage (no backend)

## Project Structure
[tree]

## Demo Credentials
Any non-empty email + password ≥ 6 chars

## Notes
- Frontend only — no real authentication
- All data stored in browser localStorage
- Reset data via Settings → Dữ liệu → Đặt lại dữ liệu mẫu
```

## Todo List
- [ ] Accessibility audit complete
- [ ] Performance audit (Lighthouse) ≥ 90
- [ ] Cross-browser test (4 browsers)
- [ ] Responsive test (3 breakpoints, all 9 pages)
- [ ] Vietnamese strings reviewed
- [ ] Empty states verified
- [ ] Edge cases handled
- [ ] README.md complete
- [ ] .gitignore in place
- [ ] All console errors fixed

## Success Criteria
- Zero console errors on any page in any browser
- Lighthouse ≥ 90 across Performance/Accessibility/Best Practices on dashboard
- All 9 pages render correctly at 1280/768/375
- Theme toggle works on every page
- Mock data resets cleanly
- README enables a new dev to run the app in < 5 minutes

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Hidden bugs in untested combos | Systematic checklist; test matrix |
| Safari-specific quirks | Test early; have polyfill plan for `crypto.randomUUID` |
| Lighthouse score below target | Profile + fix biggest contributors (images, unused CSS) |

## Security Considerations
- README clearly states no real auth/data persistence guarantees
- No PII collection
- localStorage only, no third-party trackers

## Next Steps
- Ship v1 → gather feedback
- Future v2: real backend, multi-user, mobile app
