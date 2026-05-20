// format.js — VND, date, percent helpers

export function formatVND(n) {
  if (n == null || isNaN(n)) return '0 ₫';
  return Math.round(n).toLocaleString('vi-VN') + ' ₫';
}

export function formatVNDShort(n) {
  if (n == null || isNaN(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + ' tỷ';
  if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' tr';
  if (abs >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}

export function formatSigned(amount, type) {
  const sign = type === 'income' ? '+' : '−';
  return sign + ' ' + formatVND(amount);
}

export function formatDate(d, pattern = 'DD/MM/YYYY') {
  if (typeof dayjs === 'undefined') return new Date(d).toLocaleDateString('vi-VN');
  return dayjs(d).format(pattern);
}

export function formatRelative(d) {
  if (typeof dayjs === 'undefined') return formatDate(d);
  try { return dayjs(d).fromNow(); } catch { return formatDate(d); }
}

export function formatPercent(n, digits = 0) {
  if (n == null || isNaN(n)) return '0%';
  return (n * 100).toFixed(digits) + '%';
}

export function formatChange(curr, prev) {
  if (!prev) return { value: 0, dir: 'flat', text: '0%' };
  const diff = (curr - prev) / Math.abs(prev);
  const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  return { value: diff, dir, text: (diff >= 0 ? '+' : '') + (diff * 100).toFixed(1) + '%' };
}

// Escape user input before injecting via insertAdjacentHTML
export function escapeHTML(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
