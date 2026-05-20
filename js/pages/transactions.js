// transactions.js
import { initStore, getState, getCategoryById, getWalletById, addTransaction, updateTransaction, deleteTransaction } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatSigned, formatDate, escapeHTML } from '../modules/format.js';
import { showToast, openModal, confirmDialog } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'transactions', title: 'Giao dịch' });

const PAGE_SIZE = 10;
let page = 1;
let sortKey = 'date';
let sortDir = 'desc';
const filters = { q: '', type: '', category: '', wallet: '', from: '', to: '' };

// Populate filter selects
const state = getState();
document.getElementById('f-category').insertAdjacentHTML('beforeend',
  state.data.categories.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('')
);
document.getElementById('f-wallet').insertAdjacentHTML('beforeend',
  state.data.wallets.map(w => `<option value="${w.id}">${escapeHTML(w.name)}</option>`).join('')
);

function applyFilters(list) {
  return list.filter(t => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.category && t.categoryId !== filters.category) return false;
    if (filters.wallet && t.walletId !== filters.wallet) return false;
    if (filters.from && new Date(t.date) < new Date(filters.from)) return false;
    if (filters.to && new Date(t.date) > new Date(filters.to + 'T23:59:59')) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const cat = getCategoryById(t.categoryId);
      if (!(t.note || '').toLowerCase().includes(q) && !(cat?.name || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function applySort(list) {
  return [...list].sort((a, b) => {
    let av, bv;
    switch (sortKey) {
      case 'amount': av = a.amount; bv = b.amount; break;
      case 'category': av = getCategoryById(a.categoryId)?.name || ''; bv = getCategoryById(b.categoryId)?.name || ''; break;
      case 'wallet':   av = getWalletById(a.walletId)?.name || '';      bv = getWalletById(b.walletId)?.name || ''; break;
      case 'note':     av = a.note || ''; bv = b.note || ''; break;
      default: av = new Date(a.date); bv = new Date(b.date);
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

function render() {
  const all = applySort(applyFilters(getState().data.transactions));
  const total = all.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) page = pages;
  const slice = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tbody = document.getElementById('tx-body');
  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
      <div class="empty-icon"><i data-lucide="inbox"></i></div>
      <h3>Không có giao dịch</h3>
      <p>Hãy thêm giao dịch đầu tiên hoặc thay đổi bộ lọc.</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = slice.map(t => {
      const cat = getCategoryById(t.categoryId);
      const w = getWalletById(t.walletId);
      return `
        <tr data-id="${t.id}">
          <td>${formatDate(t.date)}</td>
          <td><div class="font-semibold">${escapeHTML(t.note || '—')}</div></td>
          <td><div class="tx-row-cat"><span class="dot" style="background:${cat?.color || '#94A3B8'}"></span>${escapeHTML(cat?.name || '—')}</div></td>
          <td>${escapeHTML(w?.name || '—')}</td>
          <td class="text-right"><span class="tx-row-amount ${t.type}">${formatSigned(t.amount, t.type)}</span></td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-action="edit" aria-label="Sửa"><i data-lucide="pencil"></i></button>
              <button class="icon-btn" data-action="delete" aria-label="Xóa"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
  renderPagination(total, pages);
  mountIcons();
}

function renderPagination(total, pages) {
  const el = document.getElementById('pagination');
  if (total === 0) { el.innerHTML = ''; return; }
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  let pagesHtml = '';
  const max = 5;
  let from = Math.max(1, page - 2);
  let to = Math.min(pages, from + max - 1);
  from = Math.max(1, to - max + 1);
  for (let p = from; p <= to; p++) {
    pagesHtml += `<button class="pagination-btn ${p === page ? 'is-active' : ''}" data-page="${p}">${p}</button>`;
  }
  el.innerHTML = `
    <div class="text-muted fs-sm">Hiển thị ${start}–${end} / ${total} giao dịch</div>
    <div class="pagination-pages">
      <button class="pagination-btn" data-page="prev" ${page === 1 ? 'disabled' : ''}><i data-lucide="chevron-left"></i></button>
      ${pagesHtml}
      <button class="pagination-btn" data-page="next" ${page === pages ? 'disabled' : ''}><i data-lucide="chevron-right"></i></button>
    </div>
  `;
}

// ---------- Modal: Add / Edit ----------
function openTxModal(existing) {
  const isEdit = !!existing;
  const t = existing || { type: 'expense', amount: '', walletId: state.data.wallets[0].id, categoryId: '', date: new Date().toISOString().slice(0, 10), note: '' };
  const catOptions = (type) => state.data.categories.filter(c => c.type === type).map(c => `<option value="${c.id}" ${c.id === t.categoryId ? 'selected' : ''}>${escapeHTML(c.name)}</option>`).join('');
  const walOptions = state.data.wallets.map(w => `<option value="${w.id}" ${w.id === t.walletId ? 'selected' : ''}>${escapeHTML(w.name)}</option>`).join('');

  const body = `
    <form id="tx-form">
      <div class="form-field">
        <label class="form-label">Loại giao dịch</label>
        <div class="segmented" id="seg-type">
          <button type="button" data-type="expense" class="${t.type === 'expense' ? 'is-active' : ''}">Chi</button>
          <button type="button" data-type="income" class="${t.type === 'income' ? 'is-active' : ''}">Thu</button>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Số tiền (₫)</label>
        <input class="input" id="f-amount" type="number" min="0" step="1000" required value="${t.amount || ''}" placeholder="0" />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Danh mục</label>
          <select class="select" id="f-cat">${catOptions(t.type)}</select>
        </div>
        <div class="form-field">
          <label class="form-label">Ví</label>
          <select class="select" id="f-wal">${walOptions}</select>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Ngày</label>
        <input class="input" id="f-date" type="date" required value="${(t.date || '').slice(0, 10)}" />
      </div>
      <div class="form-field">
        <label class="form-label">Ghi chú</label>
        <textarea class="input" id="f-note" rows="2" placeholder="VD: Bữa trưa với khách hàng">${escapeHTML(t.note || '')}</textarea>
      </div>
    </form>
  `;

  openModal({
    title: isEdit ? 'Sửa giao dịch' : 'Thêm giao dịch',
    body,
    actions: `
      <button class="btn btn-secondary" data-close>Hủy</button>
      <button class="btn btn-primary" id="btn-save">${isEdit ? 'Cập nhật' : 'Lưu'}</button>
    `
  });

  // Bind type toggle
  setTimeout(() => {
    let currentType = t.type;
    document.querySelectorAll('#seg-type button').forEach(b => {
      b.addEventListener('click', () => {
        currentType = b.dataset.type;
        document.querySelectorAll('#seg-type button').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        document.getElementById('f-cat').innerHTML = catOptions(currentType);
      });
    });
    document.getElementById('btn-save').addEventListener('click', () => {
      const data = {
        type: currentType,
        amount: parseFloat(document.getElementById('f-amount').value),
        categoryId: document.getElementById('f-cat').value,
        walletId: document.getElementById('f-wal').value,
        date: new Date(document.getElementById('f-date').value).toISOString(),
        note: document.getElementById('f-note').value.trim()
      };
      if (!data.amount || data.amount <= 0) { showToast('Vui lòng nhập số tiền hợp lệ', 'error'); return; }
      if (!data.categoryId) { showToast('Chọn danh mục', 'error'); return; }
      if (isEdit) { updateTransaction(existing.id, data); showToast('Đã cập nhật giao dịch', 'success'); }
      else { addTransaction(data); showToast('Đã thêm giao dịch', 'success'); }
      document.querySelector('.modal-backdrop')?.remove();
      render();
    });
  }, 60);
}

// ---------- Bind UI ----------
document.getElementById('btn-add').addEventListener('click', () => openTxModal());
document.getElementById('f-search').addEventListener('input', (e) => { filters.q = e.target.value; page = 1; render(); });

// Pre-fill search from ?q= URL param (e.g., from topbar search)
const urlQ = new URLSearchParams(window.location.search).get('q');
if (urlQ) {
  const fSearch = document.getElementById('f-search');
  const topSearch = document.getElementById('topbar-search');
  fSearch.value = urlQ;
  if (topSearch) topSearch.value = urlQ;
  filters.q = urlQ;
}
['f-type','f-category','f-wallet','f-from','f-to'].forEach(id => {
  document.getElementById(id).addEventListener('change', (e) => {
    const key = id.replace('f-','');
    filters[key === 'category' ? 'category' : key === 'wallet' ? 'wallet' : key] = e.target.value;
    page = 1; render();
  });
});
document.getElementById('f-reset').addEventListener('click', () => {
  Object.keys(filters).forEach(k => filters[k] = '');
  document.querySelectorAll('.filter-bar input, .filter-bar select').forEach(el => el.value = '');
  page = 1; render();
});

document.querySelectorAll('#tx-table thead th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortKey = k; sortDir = 'desc'; }
    render();
  });
});

document.getElementById('tx-body').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.closest('tr').dataset.id;
  if (btn.dataset.action === 'edit') {
    const t = getState().data.transactions.find(x => x.id === id);
    openTxModal(t);
  } else if (btn.dataset.action === 'delete') {
    const ok = await confirmDialog('Bạn chắc chắn muốn xóa giao dịch này?', { danger: true, okText: 'Xóa' });
    if (ok) { deleteTransaction(id); showToast('Đã xóa giao dịch', 'success'); render(); }
  }
});

document.getElementById('pagination').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (!btn || btn.disabled) return;
  const all = applyFilters(getState().data.transactions);
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  if (btn.dataset.page === 'prev') page = Math.max(1, page - 1);
  else if (btn.dataset.page === 'next') page = Math.min(pages, page + 1);
  else page = parseInt(btn.dataset.page, 10);
  render();
});

render();
mountIcons();
