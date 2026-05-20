// settings.js
import { initStore, getState, setAuth, setPreference, resetAll } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { setTheme, getTheme } from '../modules/theme.js';
import { showToast, confirmDialog } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'settings', title: 'Cài đặt' });

const state = getState();
document.getElementById('s-name').value = state.auth?.user?.name || '';
document.getElementById('s-email').value = state.auth?.user?.email || '';
document.getElementById('s-dark').checked = getTheme() === 'dark';
document.getElementById('s-lang').value = state.preferences?.language || 'vi';
document.getElementById('s-currency').value = state.preferences?.currency || 'VND';

document.getElementById('save-profile').addEventListener('click', () => {
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  if (!name) return showToast('Nhập tên', 'error');
  const currentAuth = getState().auth || {};
  const users = Array.isArray(currentAuth.users) ? currentAuth.users : [];
  const nextUser = { name, email, avatar: name.charAt(0).toUpperCase() };
  setAuth({
    ...currentAuth,
    isLoggedIn: true,
    user: nextUser,
    users: users.map(u => u.email === currentAuth.user?.email ? { ...u, ...nextUser } : u)
  });
  showToast('Đã lưu hồ sơ', 'success');
});

document.getElementById('s-dark').addEventListener('change', (e) => {
  setTheme(e.target.checked ? 'dark' : 'light');
  // sync topbar icon
  const tb = document.getElementById('theme-toggle');
  if (tb) { tb.innerHTML = '<i data-lucide="' + (e.target.checked ? 'sun' : 'moon') + '"></i>'; mountIcons(); }
});

document.getElementById('s-lang').addEventListener('change', (e) => {
  if (e.target.value !== 'vi') { showToast('Tính năng sắp ra mắt', 'info'); e.target.value = 'vi'; return; }
  setPreference('language', e.target.value);
});
document.getElementById('s-currency').addEventListener('change', (e) => {
  if (e.target.value !== 'VND') { showToast('Tính năng sắp ra mắt', 'info'); e.target.value = 'VND'; return; }
  setPreference('currency', e.target.value);
});

document.getElementById('export-data').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'qltc-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(url);
  showToast('Đã xuất dữ liệu', 'success');
});

document.getElementById('import-data').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.data || !data.version) throw new Error('Định dạng không hợp lệ');
    localStorage.setItem('qlct.v1.state', JSON.stringify(data));
    showToast('Đã nhập dữ liệu — đang tải lại...', 'success');
    setTimeout(() => location.reload(), 800);
  } catch (err) { showToast('Lỗi nhập dữ liệu: ' + err.message, 'error'); }
});

document.getElementById('reset-data').addEventListener('click', async () => {
  if (await confirmDialog('Khôi phục về dữ liệu mặc định? Mọi thay đổi sẽ mất.', { danger: true, okText: 'Khôi phục' })) {
    resetAll(); showToast('Đã khôi phục', 'success'); setTimeout(() => location.reload(), 600);
  }
});

mountIcons();
