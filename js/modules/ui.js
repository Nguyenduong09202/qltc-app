// ui.js — toast, modal, confirm, empty state, skeleton

import { escapeHTML } from './format.js';
import { mountIcons } from './icons.js';

// ---------- Toast ----------
let toastContainer;
function ensureToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(msg, type = 'info', duration = 3000) {
  const c = ensureToastContainer();
  const iconMap = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon ${type}"><i data-lucide="${iconMap[type] || 'info'}"></i></span>
    <div class="toast-msg">${escapeHTML(msg)}</div>
  `;
  c.appendChild(el);
  mountIcons();
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 200ms';
    setTimeout(() => el.remove(), 200);
  }, duration);
}

// ---------- Modal ----------
export function openModal({ title, body, actions, size = '' }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal ${size === 'lg' ? 'modal-lg' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">${escapeHTML(title)}</h3>
          <button class="icon-btn" data-close aria-label="Đóng"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">${body || ''}</div>
        ${actions ? `<div class="modal-footer">${actions}</div>` : ''}
      </div>
    `;
    document.body.appendChild(backdrop);
    mountIcons();

    const close = (result) => {
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(null); };
    document.addEventListener('keydown', onKey);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(null);
      if (e.target.closest('[data-close]')) close(null);
      if (e.target.closest('[data-action]')) {
        close({ action: e.target.closest('[data-action]').dataset.action, modal: backdrop });
      }
    });

    // Focus first input
    const firstInput = backdrop.querySelector('input, select, textarea, button:not([data-close])');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);

    // expose helper to caller
    backdrop._close = close;
    backdrop._el = backdrop;
  });
}

export function closeModal(modal) {
  if (modal && modal._close) modal._close(null);
  else if (modal && modal.remove) modal.remove();
}

// ---------- Confirm ----------
export async function confirmDialog(msg, { title = 'Xác nhận', okText = 'Đồng ý', cancelText = 'Hủy', danger = false } = {}) {
  const res = await openModal({
    title,
    body: `<p>${escapeHTML(msg)}</p>`,
    actions: `
      <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="ok">${okText}</button>
    `
  });
  return res && res.action === 'ok';
}

// ---------- Empty state ----------
export function renderEmptyState(container, { icon = 'inbox', title = 'Không có dữ liệu', desc = '', ctaLabel = '', ctaAction = null } = {}) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon"><i data-lucide="${icon}"></i></div>
      <h3>${escapeHTML(title)}</h3>
      ${desc ? `<p>${escapeHTML(desc)}</p>` : ''}
      ${ctaLabel ? `<button class="btn btn-primary" id="empty-cta">${escapeHTML(ctaLabel)}</button>` : ''}
    </div>
  `;
  mountIcons();
  if (ctaAction && ctaLabel) {
    container.querySelector('#empty-cta').addEventListener('click', ctaAction);
  }
}

// ---------- Skeleton ----------
export function renderSkeleton(container, rows = 4) {
  container.innerHTML = Array.from({ length: rows }, () => `
    <div class="card" style="margin-bottom: var(--s-3);">
      <div class="skeleton skeleton-text wide"></div>
      <div class="skeleton skeleton-text med"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>
  `).join('');
}
