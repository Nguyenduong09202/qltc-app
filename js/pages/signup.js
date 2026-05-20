// signup.js
import { initStore, getState, setAuth } from '../modules/store.js';
import { showToast } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

function bind() {
  try { initStore(); } catch (e) { console.error('[signup] initStore failed', e); }

  const form = document.getElementById('signup-form');
  if (!form) {
    console.error('[signup] #signup-form not found');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      if (!name || !email || !password) return showToast('Vui lòng điền đầy đủ', 'error');
      if (password.length < 6) return showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');

      const currentAuth = (getState() && getState().auth) || {};
      const users = Array.isArray(currentAuth.users) ? currentAuth.users : [];
      if (users.some(u => u.email === email)) {
        return showToast('Email này đã có tài khoản. Hãy đăng nhập.', 'warning');
      }

      const user = { name, email, avatar: name.charAt(0).toUpperCase() };
      setAuth({
        ...currentAuth,
        isLoggedIn: true,
        user,
        users: [...users, { ...user, password }]
      });
      showToast('Tạo tài khoản thành công, đang chuyển hướng...', 'success');
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
