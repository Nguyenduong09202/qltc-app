// login.js
import { initStore, getState, setAuth } from '../modules/store.js';
import { showToast } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';
import { t } from '../modules/i18n.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  ['email', 'password'].forEach(id => setError(id, null));
}

function bind() {
  try { initStore(); } catch (e) { console.error('[login] initStore failed', e); }

  const form = document.getElementById('login-form');
  if (!form) {
    console.error('[login] #login-form not found');
    return;
  }

  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');

  emailEl?.addEventListener('input', () => setError('email', null));
  passEl?.addEventListener('input', () => setError('password', null));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    try {
      const email = emailEl.value.trim().toLowerCase();
      const password = passEl.value;

      let bad = false;
      if (!email) { setError('email', 'auth.err.email.required'); bad = true; }
      else if (!EMAIL_RE.test(email)) { setError('email', 'auth.err.email.invalid'); bad = true; }
      if (!password) { setError('password', 'auth.err.password.required'); bad = true; }
      else if (password.length < 6) { setError('password', 'auth.err.password.short'); bad = true; }
      if (bad) return;

      const currentAuth = (getState() && getState().auth) || {};
      const users = Array.isArray(currentAuth.users) ? currentAuth.users : [];
      const registeredUser = users.find(u => u.email === email);
      if (!registeredUser) {
        return setError('email', 'auth.err.account.notfound');
      }
      if (registeredUser.password !== password) {
        return setError('password', 'auth.err.password.wrong');
      }
      const { password: _pw, ...user } = registeredUser;
      setAuth({ ...currentAuth, isLoggedIn: true, user, users });
      showToast(t('auth.ok.login'), 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
    } catch (err) {
      console.error('[login] submit failed', err);
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

  const forgotBtn = document.getElementById('forgot-btn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => {
      showToast(t('auth.forgot.toast'), 'info');
    });
  }

  try { mountIcons(); } catch (e) { console.warn('[login] mountIcons failed', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}
