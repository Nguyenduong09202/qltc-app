// settings.js
import { initStore, getState, setAuth, setPreference, resetAll } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { setTheme, getTheme, PRESETS, getPreset, setPreset, getCustomColor, setCustomColor } from '../modules/theme.js';
import { getLang, setLang, getCurrency, setCurrency, t } from '../modules/i18n.js';
import { showToast, confirmDialog } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'settings', title: t('set.title') });

const state = getState();
document.getElementById('s-name').value = state.auth?.user?.name || '';
document.getElementById('s-email').value = state.auth?.user?.email || '';
document.getElementById('s-dark').checked = getTheme() === 'dark';
document.getElementById('s-lang').value = getLang();
document.getElementById('s-currency').value = getCurrency();

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

// Theme presets
const presetsContainer = document.getElementById('theme-presets');
const customRow = document.getElementById('custom-color-row');
const customColorInput = document.getElementById('s-custom-color');
const customHexInput = document.getElementById('s-custom-hex');
const currentPreset = getPreset();
const currentCustom = getCustomColor();

function renderPresets() {
  const active = getPreset();
  presetsContainer.innerHTML = Object.entries(PRESETS).map(([key, p]) => {
    const color = key === 'custom' ? getCustomColor() : p.primary;
    const name = t('theme.preset.' + key);
    return `
      <button type="button" class="theme-preset ${key === active ? 'is-active' : ''}" data-preset="${key}" title="${name}">
        <span class="theme-swatch" style="background:${color}"></span>
        <span class="theme-preset-name">${name}</span>
      </button>
    `;
  }).join('');
  customRow.hidden = active !== 'custom';
}
// Re-render presets when language changes
window.addEventListener('lang-changed', renderPresets);

renderPresets();
customColorInput.value = currentCustom;
customHexInput.value = currentCustom;

presetsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  setPreset(btn.dataset.preset);
  renderPresets();
});

customColorInput.addEventListener('input', (e) => {
  const hex = e.target.value;
  customHexInput.value = hex;
  setCustomColor(hex);
  if (getPreset() !== 'custom') setPreset('custom');
  renderPresets();
});

customHexInput.addEventListener('change', (e) => {
  let hex = e.target.value.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    showToast('Mã hex không hợp lệ', 'error');
    e.target.value = getCustomColor();
    return;
  }
  customColorInput.value = hex;
  setCustomColor(hex);
  if (getPreset() !== 'custom') setPreset('custom');
  renderPresets();
});

document.getElementById('s-lang').addEventListener('change', (e) => {
  setLang(e.target.value);
  setPreference('language', e.target.value);
});
document.getElementById('s-currency').addEventListener('change', (e) => {
  setCurrency(e.target.value);
  setPreference('currency', e.target.value);
  showToast('Đã đổi đơn vị tiền tệ sang ' + e.target.value, 'success');
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
