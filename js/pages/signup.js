// signup.js
import { initStore, getState, setAuth } from '../modules/store.js';
import { showToast } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';
import { t } from '../modules/i18n.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = ['name', 'email', 'password', 'confirm'];

function setError(fieldId, msgKey) {
  const ff = document.getElementById('ff-' + fieldId);
  const err = document.getElementById('err-' + fieldId);
  if (!ff || !err) return;
  if (msgKey) {
    ff.classList.add('has-error');
    err.textContent = t(msgKey);
  } else {
    ff.classList.remove('has-error');
    err.textContent = '';
  }
}

function clearErrors() {
  FIELDS.forEach(id => setError(id, null));
}

function bind() {
  try { initStore(); } catch (e) { console.error('[signup] initStore failed', e); }

  const form = document.getElementById('signup-form');
  if (!form) {
    console.error('[signup] #signup-form not found');
    return;
  }

  const els = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirm: document.getElementById('confirm'),
  };

  FIELDS.forEach(id => {
    els[id]?.addEventListener('input', () => {
      setError(id, null);
      if (id === 'confirm' || id === 'password') {
        const pw = els.password.value;
        const cf = els.confirm.value;
        if (cf && pw && cf !== pw) setError('confirm', 'auth.err.confirm.mismatch');
        else setError('confirm', null);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    try {
      const name = els.name.value.trim();
      const email = els.email.value.trim().toLowerCase();
      const password = els.password.value;
      const confirm = els.confirm.value;

      let bad = false;
      if (!name) { setError('name', 'auth.err.name.required'); bad = true; }
      if (!email) { setError('email', 'auth.err.email.required'); bad = true; }
      else if (!EMAIL_RE.test(email)) { setError('email', 'auth.err.email.invalid'); bad = true; }
      if (!password) { setError('password', 'auth.err.password.required'); bad = true; }
      else if (password.length < 6) { setError('password', 'auth.err.password.short'); bad = true; }
      if (!confirm) { setError('confirm', 'auth.err.confirm.required'); bad = true; }
      else if (confirm !== password) { setError('confirm', 'auth.err.confirm.mismatch'); bad = true; }
      if (bad) return;

      const currentAuth = (getState() && getState().auth) || {};
      const users = Array.isArray(currentAuth.users) ? currentAuth.users : [];
      if (users.some(u => u.email === email)) {
        return setError('email', 'auth.err.email.exists');
      }

      const user = { name, email, avatar: name.charAt(0).toUpperCase() };
      setAuth({
        ...currentAuth,
        isLoggedIn: true,
        user,
        users: [...users, { ...user, password }]
      });
      showToast(t('auth.ok.signup'), 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (err) {
      console.error('[signup] submit failed', err);
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  });

  const pwToggle = document.getElementById('pw-toggle');
  if (pwToggle) {
    pwToggle.addEventListener('click', (e) => {
      const inp = document.getElementById('password');
      if (!inp) return;
      const isPwd = inp.type === 'password';
      inp.type = isPwd ? 'text' : 'password';
      e.currentTarget.innerHTML = '<i data-lucide="' + (isPwd ? 'eye-off' : 'eye') + '"></i>';
      try { mountIcons(); } catch {}
    });
  }

  try { mountIcons(); } catch (e) { console.warn('[signup] mountIcons failed', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}
