// theme.js — mode (light/dark), preset palette, custom accent color

const KEY_MODE = 'theme';
const KEY_PRESET = 'theme.preset';
const KEY_CUSTOM = 'theme.custom';

export const PRESETS = {
  indigo:   { name: 'Indigo',     primary: '#4F46E5', hover: '#4338CA' },
  emerald:  { name: 'Emerald',    primary: '#10B981', hover: '#059669' },
  rose:     { name: 'Hồng',       primary: '#E11D48', hover: '#BE123C' },
  amber:    { name: 'Hổ phách',   primary: '#F59E0B', hover: '#D97706' },
  ocean:    { name: 'Đại dương',  primary: '#0EA5E9', hover: '#0284C7' },
  violet:   { name: 'Tím',        primary: '#8B5CF6', hover: '#7C3AED' },
  slate:    { name: 'Slate',      primary: '#475569', hover: '#334155' },
  custom:   { name: 'Tùy chỉnh',  primary: '#4F46E5', hover: '#4338CA' }
};

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(KEY_MODE, t); } catch {}
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: t }));
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function getPreset() {
  try { return localStorage.getItem(KEY_PRESET) || 'indigo'; } catch { return 'indigo'; }
}

export function getCustomColor() {
  try { return localStorage.getItem(KEY_CUSTOM) || PRESETS.indigo.primary; } catch { return PRESETS.indigo.primary; }
}

export function setPreset(key) {
  if (!PRESETS[key]) return;
  try { localStorage.setItem(KEY_PRESET, key); } catch {}
  applyPalette();
  window.dispatchEvent(new CustomEvent('preset-changed', { detail: key }));
}

export function setCustomColor(hex) {
  try { localStorage.setItem(KEY_CUSTOM, hex); } catch {}
  applyPalette();
}

function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex, amount = 0.12) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(full, 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  r = Math.max(0, Math.round(r * (1 - amount)));
  g = Math.max(0, Math.round(g * (1 - amount)));
  b = Math.max(0, Math.round(b * (1 - amount)));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function applyPalette() {
  const presetKey = getPreset();
  const preset = PRESETS[presetKey] || PRESETS.indigo;
  const primary = presetKey === 'custom' ? getCustomColor() : preset.primary;
  const hover = presetKey === 'custom' ? darken(primary, 0.12) : preset.hover;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', hover);
  root.style.setProperty('--color-primary-soft', hexToRgba(primary, 0.12));

  // Sync browser theme-color meta for PWA
  const meta = document.querySelector('meta[name="theme-color"]:not([media])') || document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', primary);
}

// Auto-apply on import
applyPalette();
