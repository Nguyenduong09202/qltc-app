// router.js — simple auth guard

import { getState } from './store.js';

export function requireAuth() {
  const s = getState();
  if (!s.auth?.isLoggedIn) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

export function redirectIfAuthed(to = 'dashboard.html') {
  const s = getState();
  if (s.auth?.isLoggedIn) {
    window.location.href = to;
  }
}
