// budgets.js
import { initStore, getState, getCategoryById, addBudget, updateBudget, deleteBudget } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatPercent, escapeHTML } from '../modules/format.js';
import { showToast, openModal, confirmDialog, renderEmptyState } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'budgets', title: 'Ngân sách' });

function computeSpent(b) {
  const start = new Date(b.startDate);
  return getState().data.transactions
    .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && new Date(t.date) >= start)
    .reduce((s, t) => s + t.amount, 0);
}

function render() {
  const budgets = getState().data.budgets.map(b => ({ ...b, spent: computeSpent(b) }));
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount = budgets.filter(b => b.spent > b.limit).length;
  const remaining = Math.max(0, totalLimit - totalSpent);

  document.getElementById('b-summary').innerHTML = [
    { label: 'Tổng ngân sách', value: formatVND(totalLimit), icon: 'wallet-cards', tone: 'primary' },
    { label: 'Đã chi', value: formatVND(totalSpent), icon: 'arrow-up-circle', tone: 'danger' },
    { label: 'Còn lại', value: formatVND(remaining), icon: 'piggy-bank', tone: 'success' },
    { label: 'Vượt mức', value: overCount + ' danh mục', icon: 'alert-triangle', tone: 'warning' }
  ].map(s => `
    <div class="stat-card">
      <div class="stat-header">
        <div class="stat-label">${s.label}</div>
        <div class="stat-icon ${s.tone}"><i data-lucide="${s.icon}"></i></div>
      </div>
      <div class="stat-value">${s.value}</div>
    </div>
  `).join('');

  const list = document.getElementById('b-list');
  if (budgets.length === 0) {
    renderEmptyState(list, { icon: 'wallet-cards', title: 'Chưa có ngân sách nào', desc: 'Thiết lập ngân sách để kiểm soát chi tiêu hàng tháng.', ctaLabel: 'Thêm ngân sách', ctaAction: () => openBudgetModal() });
    return;
  }

  list.innerHTML = budgets.map(b => {
    const cat = getCategoryById(b.categoryId);
    const pct = Math.min(100, (b.spent / b.limit) * 100);
    const over = b.spent > b.limit;
    const tone = over ? 'danger' : pct > 80 ? 'warning' : 'success';
    return `
      <div class="card budget-card" data-id="${b.id}">
        <div class="b-head">
          <div class="b-icon" style="background:${cat?.color}22;color:${cat?.color}"><i data-lucide="${cat?.icon || 'circle'}"></i></div>
          <div class="b-name">${escapeHTML(cat?.name || '—')}</div>
          <span class="tag tag-${tone}">${over ? 'Vượt' : Math.round(pct) + '%'}</span>
        </div>
        <div class="b-amounts">
          <span class="spent">${formatVND(b.spent)}</span>
          <span class="total">/ ${formatVND(b.limit)}</span>
        </div>
        <div class="progress progress-lg"><div class="progress-fill ${tone}" style="width:${pct}%"></div></div>
        <div class="b-status">
          <span class="text-muted">Hàng tháng</span>
          <span class="${over ? 'text-danger' : 'text-muted'}">${over ? 'Vượt ' + formatVND(b.spent - b.limit) : 'Còn ' + formatVND(b.limit - b.spent)}</span>
        </div>
        <div class="b-actions">
          <button class="btn btn-secondary btn-sm" data-action="edit"><i data-lucide="pencil"></i>Sửa</button>
          <button class="btn btn-ghost btn-sm" data-action="delete"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;
  }).join('');
  mountIcons();
}

function openBudgetModal(existing) {
  const isEdit = !!existing;
  const b = existing || { categoryId: '', limit: '', period: 'monthly', startDate: new Date().toISOString().slice(0, 10) };
  const expCats = getState().data.categories.filter(c => c.type === 'expense');
  const usedCatIds = new Set(getState().data.budgets.map(x => x.categoryId));
  const catOptions = expCats.map(c => {
    const used = !isEdit && usedCatIds.has(c.id);
    return `<option value="${c.id}" ${c.id === b.categoryId ? 'selected' : ''} ${used ? 'disabled' : ''}>${escapeHTML(c.name)}${used ? ' (đã có)' : ''}</option>`;
  }).join('');
  openModal({
    title: isEdit ? 'Sửa ngân sách' : 'Thêm ngân sách',
    body: `
      <form id="bf">
        <div class="form-field">
          <label class="form-label">Danh mục</label>
          <select class="select" id="bf-cat" ${isEdit ? 'disabled' : ''}><option value="">Chọn danh mục</option>${catOptions}</select>
        </div>
        <div class="form-field">
          <label class="form-label">Hạn mức/tháng (₫)</label>
          <input class="input" type="number" min="0" step="10000" id="bf-limit" value="${b.limit || ''}" />
        </div>
      </form>
    `,
    actions: `<button class="btn btn-secondary" data-close>Hủy</button><button class="btn btn-primary" id="bf-save">${isEdit ? 'Cập nhật' : 'Lưu'}</button>`
  });
  setTimeout(() => {
    document.getElementById('bf-save').addEventListener('click', () => {
      const cat = document.getElementById('bf-cat')?.value || b.categoryId;
      const limit = parseFloat(document.getElementById('bf-limit').value);
      if (!cat) return showToast('Chọn danh mục', 'error');
      if (!limit || limit <= 0) return showToast('Nhập hạn mức hợp lệ', 'error');
      if (isEdit) { updateBudget(existing.id, { limit }); showToast('Đã cập nhật ngân sách', 'success'); }
      else { addBudget({ categoryId: cat, limit, period: 'monthly', startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() }); showToast('Đã thêm ngân sách', 'success'); }
      document.querySelector('.modal-backdrop')?.remove();
      render();
    });
  }, 60);
}

document.getElementById('btn-add').addEventListener('click', () => openBudgetModal());
document.getElementById('b-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  if (btn.dataset.action === 'edit') {
    openBudgetModal(getState().data.budgets.find(x => x.id === id));
  } else if (btn.dataset.action === 'delete') {
    if (await confirmDialog('Xóa ngân sách này?', { danger: true, okText: 'Xóa' })) {
      deleteBudget(id); showToast('Đã xóa', 'success'); render();
    }
  }
});

render();
mountIcons();
