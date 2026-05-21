// accounts.js
import { initStore, getState, getCategoryById, getWalletById, addWallet, updateWallet, deleteWallet } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatSigned, formatDate, escapeHTML } from '../modules/format.js';
import { getCurrencySymbol, toBaseVND, fromBaseVND, t } from '../modules/i18n.js';
import { showToast, openModal, confirmDialog, renderEmptyState } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'accounts', title: t('acc.title') });

const TYPE_KEY = { cash: 'acc.type.cash', bank: 'acc.type.bank', 'e-wallet': 'acc.type.ewallet' };
const ICONS = ['wallet','landmark','smartphone','credit-card','banknote','piggy-bank'];
const COLORS = ['#4F46E5','#0EA5E9','#EC4899','#16A34A','#F59E0B','#8B5CF6'];

let activeWalletId = null;

function render() {
  const wallets = getState().data.wallets;
  const total = wallets.reduce((s, w) => s + w.balance, 0);
  const list = document.getElementById('wallet-list');

  list.innerHTML = `
    <div class="card" style="grid-column: 1/-1;">
      <div class="flex-between">
        <div>
          <div class="text-muted fs-sm">${t('acc.total.balance')}</div>
          <div style="font-size: var(--fs-3xl); font-weight: 700; color: var(--text-primary);">${formatVND(total)}</div>
        </div>
        <div class="text-muted fs-sm">${wallets.length} ${t('acc.wallets')}</div>
      </div>
    </div>
  ` + wallets.map(w => `
    <div class="wallet-card" style="--w-color:${w.color}" data-id="${w.id}">
      <div class="w-head">
        <div>
          <div class="w-name">${escapeHTML(w.name)}</div>
          <div class="w-type">${TYPE_KEY[w.type] ? t(TYPE_KEY[w.type]) : w.type}</div>
        </div>
        <div class="w-icon"><i data-lucide="${w.icon}"></i></div>
      </div>
      <div class="w-balance">${formatVND(w.balance)}</div>
      <div class="w-actions">
        <button class="btn btn-sm" data-action="edit"><i data-lucide="pencil"></i>${t('common.edit')}</button>
        <button class="btn btn-sm" data-action="delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join('');

  renderWalletTx();
  mountIcons();
}

function renderWalletTx() {
  const wallets = getState().data.wallets;
  if (!activeWalletId && wallets[0]) activeWalletId = wallets[0].id;
  const container = document.getElementById('wallet-tx');
  const picker = `<div class="wallet-pick">${wallets.map(w => `<button data-wid="${w.id}" class="${w.id === activeWalletId ? 'is-active' : ''}">${escapeHTML(w.name)}</button>`).join('')}</div>`;

  const txs = getState().data.transactions.filter(t => t.walletId === activeWalletId).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  let txHtml;
  if (txs.length === 0) txHtml = '<div class="empty-state"><div class="empty-icon"><i data-lucide="inbox"></i></div><h3>' + t('acc.no.tx') + '</h3></div>';
  else txHtml = txs.map(t => {
    const cat = getCategoryById(t.categoryId);
    return `
      <div class="tx-item">
        <div class="tx-icon" style="background:${cat?.color}22;color:${cat?.color}"><i data-lucide="${cat?.icon || 'circle'}"></i></div>
        <div class="tx-body">
          <div class="tx-title">${escapeHTML(t.note || cat?.name || '—')}</div>
          <div class="tx-meta">${escapeHTML(cat?.name || '')} · ${formatDate(t.date)}</div>
        </div>
        <div class="tx-amount ${t.type}">${formatSigned(t.amount, t.type)}</div>
      </div>
    `;
  }).join('');
  container.innerHTML = picker + txHtml;
  container.querySelectorAll('.wallet-pick button').forEach(b => {
    b.addEventListener('click', () => { activeWalletId = b.dataset.wid; renderWalletTx(); mountIcons(); });
  });
}

function openWalletModal(existing) {
  const isEdit = !!existing;
  const w = existing || { name: '', type: 'cash', balance: 0, currency: 'VND', icon: 'wallet', color: COLORS[0] };
  openModal({
    title: isEdit ? t('acc.modal.edit') : t('acc.modal.add'),
    body: `
      <div class="form-field">
        <label class="form-label">${t('acc.name')}</label>
        <input class="input" id="wf-name" value="${escapeHTML(w.name)}" placeholder="${t('acc.name.placeholder')}" />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">${t('acc.type')}</label>
          <select class="select" id="wf-type">
            <option value="cash" ${w.type==='cash'?'selected':''}>${t('acc.type.cash')}</option>
            <option value="bank" ${w.type==='bank'?'selected':''}>${t('acc.type.bank')}</option>
            <option value="e-wallet" ${w.type==='e-wallet'?'selected':''}>${t('acc.type.ewallet')}</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">${t('acc.initial')} (${getCurrencySymbol()})</label>
          <input class="input" type="number" min="0" step="any" id="wf-bal" value="${w.balance ? fromBaseVND(w.balance) : 0}" ${isEdit ? 'disabled' : ''} />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">${t('common.icon')}</label>
          <select class="select" id="wf-icon">${ICONS.map(i => `<option value="${i}" ${i === w.icon ? 'selected' : ''}>${i}</option>`).join('')}</select>
        </div>
        <div class="form-field">
          <label class="form-label">${t('common.color')}</label>
          <select class="select" id="wf-color">${COLORS.map(c => `<option value="${c}" ${c === w.color ? 'selected' : ''}>${c}</option>`).join('')}</select>
        </div>
      </div>
    `,
    actions: `<button class="btn btn-secondary" data-close>${t('common.cancel')}</button><button class="btn btn-primary" id="wf-save">${isEdit ? t('common.update') : t('common.save')}</button>`
  });
  setTimeout(() => {
    document.getElementById('wf-save').addEventListener('click', () => {
      const data = {
        name: document.getElementById('wf-name').value.trim(),
        type: document.getElementById('wf-type').value,
        icon: document.getElementById('wf-icon').value,
        color: document.getElementById('wf-color').value
      };
      if (!isEdit) data.balance = toBaseVND(parseFloat(document.getElementById('wf-bal').value) || 0);
      if (!data.name) return showToast(t('acc.toast.empty.name'), 'error');
      if (isEdit) { updateWallet(existing.id, data); showToast(t('budget.toast.updated'), 'success'); }
      else { addWallet({ ...data, currency: 'VND' }); showToast(t('acc.toast.added'), 'success'); }
      document.querySelector('.modal-backdrop')?.remove();
      render();
    });
  }, 60);
}

document.getElementById('btn-add').addEventListener('click', () => openWalletModal());
document.getElementById('wallet-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  const w = getState().data.wallets.find(x => x.id === id);
  if (btn.dataset.action === 'edit') openWalletModal(w);
  else if (btn.dataset.action === 'delete') {
    const hasTx = getState().data.transactions.some(t => t.walletId === id);
    if (hasTx) return showToast('Ví đang chứa giao dịch, không thể xóa', 'error');
    if (await confirmDialog('Xóa ví "' + w.name + '"?', { danger: true, okText: 'Xóa' })) {
      deleteWallet(id); showToast('Đã xóa', 'success'); render();
    }
  }
});

render();
mountIcons();
window.addEventListener('lang-changed', render);
window.addEventListener('currency-changed', render);
