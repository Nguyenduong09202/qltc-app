// login.js
import { initStore, getState, setAuth } from '../modules/store.js';
import { showToast } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

function bind() {
  try { initStore(); } catch (e) { console.error('[login] initStore failed', e); }

  const form = document.getElementById('login-form');
  if (!form) {
    console.error('[login] #login-form not found');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      if (!email || !password) return showToast('Vui lòng nhập đầy đủ thông tin', 'error');
      if (password.length < 6) return showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');

      const currentAuth = (getState() && getState().auth) || {};
      const users = Array.isArray(currentAuth.users) ? currentAuth.users : [];
      const registeredUser = users.find(u => u.email === email);
      if (!registeredUser) {
        return showToast('Không tìm thấy tài khoản với email này. Hãy đăng ký.', 'error');
      }
      if (registeredUser.password !== password) {
        return showToast('Mật khẩu không đúng', 'error');
      }
      const { password: _pw, ...user } = registeredUser;
      setAuth({ ...currentAuth, isLoggedIn: true, user, users });
      showToast('Đăng nhập thành công, đang chuyển hướng...', 'success');
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

  try { mountIcons(); } catch (e) { console.warn('[login] mountIcons failed', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}
