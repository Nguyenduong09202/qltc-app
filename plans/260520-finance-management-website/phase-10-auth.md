# Phase 10 — Auth (Login + Signup)

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md)
- Related: `js/modules/router.js` (auth guard)

## Overview
- **Date:** 2026-05-20
- **Description:** UI-only login + signup. Simulated session via localStorage flag. No backend.
- **Priority:** P3
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Auth simulation per plan.md unresolved Q3: any non-empty email + 6+ char password passes
- Successful auth sets `store.state.auth = { isLoggedIn: true, user: { name, email } }`
- Redirects to `/dashboard.html`
- Already-logged-in users redirected away from auth pages

## Requirements
**Functional**

**Login (`login.html`):**
- Centered card layout
- Logo + heading "Đăng nhập"
- Email input, Password input (with show/hide toggle)
- "Quên mật khẩu?" link (placeholder — toast "Tính năng đang phát triển")
- Submit button "Đăng nhập"
- Link "Chưa có tài khoản? Đăng ký"
- Validation: email format, password ≥ 6 chars
- On success: set auth state → redirect dashboard

**Signup (`signup.html`):**
- Same layout
- Fields: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu
- Validation: name required, email format, password ≥ 6 chars, passwords match
- Terms checkbox required
- On success: same as login (set auth + redirect)

**Non-functional**
- No sidebar shell
- Theme toggle in corner
- Demo credentials hint shown: "Dùng bất kỳ email + mật khẩu ≥ 6 ký tự"

## Architecture

### Validation Pattern
```js
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePassword(v) { return v.length >= 6; }
```

### Submit Handler
```js
function handleLogin(form) {
  const { email, password } = formData(form);
  if (!validateEmail(email)) return showFieldError('email', 'Email không hợp lệ');
  if (!validatePassword(password)) return showFieldError('password', 'Mật khẩu ≥ 6 ký tự');
  store.state.auth = { isLoggedIn: true, user: { name: email.split('@')[0], email }};
  store.commit();
  showToast('Đăng nhập thành công', 'success');
  setTimeout(()=> location.href='/dashboard.html', 400);
}
```

### Router Guard (Phase 01 module)
- Used by pages 2–8: `if (!auth.isLoggedIn) location.href='/login.html'`
- Auth pages do reverse: if already logged in → `/dashboard.html`

## Related Code Files

**Create**
- `f:/App-Quan-Ly/login.html`
- `f:/App-Quan-Ly/signup.html`
- `f:/App-Quan-Ly/css/pages/auth.css`
- `f:/App-Quan-Ly/js/pages/login.js`
- `f:/App-Quan-Ly/js/pages/signup.js`

**Modify**
- `f:/App-Quan-Ly/js/modules/router.js` — confirm guard logic
- Pages 2–8 HTML — call `requireAuth()` at top of page script

## Implementation Steps
1. `auth.css` — centered card 400px max-width, full viewport bg, logo top
2. `login.html` + `login.js` per spec
3. `signup.html` + `signup.js` per spec
4. Add `requireAuth()` call to top of pages 2–8 page scripts (retroactive update)
5. Verify logout from sidebar (Phase 01 shell) clears auth + redirects
6. Test: navigate to `/dashboard.html` while logged out → redirected to `/login.html`; submit login → back to dashboard

## Todo List
- [ ] `auth.css` shared styles
- [ ] `login.html` + `login.js`
- [ ] `signup.html` + `signup.js`
- [ ] Email + password validation inline
- [ ] Show/hide password toggle
- [ ] Terms checkbox enforced on signup
- [ ] Successful submit sets auth state + redirects
- [ ] Already-logged-in users redirected to dashboard
- [ ] All app pages call `requireAuth()`
- [ ] Logout flow works end-to-end

## Success Criteria
- Visit `/dashboard.html` logged out → redirected to `/login.html`
- Login with "test@example.com" + "123456" → redirected to dashboard, sidebar shows
- Logout → back to login, auth cleared
- Visit `/login.html` while logged in → redirected to dashboard
- Signup with mismatched passwords → inline error, no submit

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Users expect real auth | Banner/hint clearly: "Phiên bản demo — không có máy chủ" |
| Redirect loops | Guard logic checks current page before redirect |
| Saved auth across users on shared machine | OK for demo; document in README |

## Security Considerations
- **Important:** No real security. Document loudly that this is UI-only.
- Don't store password in localStorage even in demo (store only name + email)
- Sanitize name/email before rendering anywhere

## Next Steps
- Phase 11 polish + README
