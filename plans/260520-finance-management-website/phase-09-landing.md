# Phase 09 — Landing Page

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md)

## Overview
- **Date:** 2026-05-20
- **Description:** Marketing landing page `index.html`. Hero, features, screenshots, testimonials, CTA. Public (no auth required, no sidebar shell).
- **Priority:** P3
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- No app shell — uses standalone header/footer
- Reuse design tokens, fonts, theme system
- Should auto-redirect logged-in users to `/dashboard.html` (optional)

## Requirements
**Functional**

Sections (top to bottom):
1. **Top nav:** logo, links (Tính năng, Về chúng tôi, Đăng nhập), CTA "Bắt đầu miễn phí" + theme toggle
2. **Hero:** headline "Quản lý tài chính cá nhân dễ dàng", subheadline, primary CTA → signup, hero image/illustration
3. **Features grid:** 6 features (Theo dõi giao dịch, Ngân sách thông minh, Mục tiêu tiết kiệm, Báo cáo trực quan, Đa ví, An toàn dữ liệu) with Lucide icons
4. **Screenshots:** 2–3 product screenshots (placeholder images for v1)
5. **Testimonials:** 3 quote cards (mock)
6. **CTA banner:** repeat signup
7. **Footer:** links, copyright

**Non-functional**
- Page weight < 200KB excluding fonts
- Smooth scroll on nav anchor clicks
- Theme toggle works without auth

## Architecture

### Layout
- No sidebar shell — own `.landing-header` + `.landing-footer`
- Single column scrollable
- Sections separated by generous padding

### Auto-redirect (optional)
```js
if (store.state.auth?.isLoggedIn) location.href = '/dashboard.html';
```

## Related Code Files

**Create**
- `f:/App-Quan-Ly/index.html`
- `f:/App-Quan-Ly/css/pages/landing.css`
- `f:/App-Quan-Ly/js/pages/landing.js`
- `f:/App-Quan-Ly/assets/images/hero-illustration.svg` (or placeholder)

## Implementation Steps
1. `index.html` with `<head>` pre-paint theme + fonts + base.css + landing.css.
2. `landing.css` — hero gradient bg, feature card grid `repeat(auto-fit, minmax(280px,1fr))`, large typography for headlines (`--fs-3xl` minimum).
3. `landing.js`:
   - Mount Lucide icons
   - Bind theme toggle
   - Bind smooth scroll for in-page anchors
   - Optional: auto-redirect logged-in users
4. Placeholder SVG illustration in `assets/images/`.

## Todo List
- [ ] `index.html` scaffold
- [ ] `landing.css` hero + features + CTA + footer
- [ ] Top nav with theme toggle + login/signup CTAs
- [ ] Hero section with headline + CTA
- [ ] 6 feature cards
- [ ] Screenshot section (placeholder ok)
- [ ] Testimonials
- [ ] Footer
- [ ] Smooth scroll
- [ ] Optional: redirect if logged in

## Success Criteria
- Visit `/` → renders landing fully styled
- Click "Đăng ký" → goes to `/signup.html`
- Click "Đăng nhập" → goes to `/login.html`
- Theme toggle works
- Responsive at 1280/768/375 — hero stacks on mobile

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Hero illustration weight | Use SVG or compressed PNG |
| Theme flash | Reuse pre-paint script |

## Security Considerations
- All links use relative paths only

## Next Steps
- Phase 10 builds the auth pages this links to
