// icons.js — Lucide wrapper

export function mountIcons(root) {
  if (typeof lucide === 'undefined') return;
  try {
    lucide.createIcons(root ? { nameAttr: 'data-lucide', attrs: {}, } : undefined);
  } catch (e) {
    console.warn('lucide mount failed', e);
  }
}
