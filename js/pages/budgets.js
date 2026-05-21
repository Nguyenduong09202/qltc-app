// budgets.js
import { initStore, getState, getCategoryById, addBudget, updateBudget, deleteBudget } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatPercent, escapeHTML } from '../modules/format.js';
import { getCurrencySymbol, toBaseVND, fromBaseVND, t, applyLang } from '../modules/i18n.js';
import { showToast, openModal, confirmDialog, renderEmptyState } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'budgets', title: t('app.nav.budgets') });

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
    { label: t('budget.total'), value: formatVND(totalLimit), icon: 'wallet-cards', tone: 'primary' },
    { label: t('budget.spent'), value: formatVND(totalSpent), icon: 'arrow-up-circle', tone: 'danger' },
    { label: t('budget.remain'), value: formatVND(remaining), icon: 'piggy-bank', tone: 'success' },
    { label: t('budget.over'), value: overCount + ' ' + t('budget.cat.count'), icon: 'alert-triangle', tone: 'warning' }
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
    renderEmptyState(list, { icon: 'wallet-cards', title: t('budget.empty.title'), desc: t('budget.empty.desc'), ctaLabel: t('budget.add'), ctaAction: () => openBudgetModal() });
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
          <span class="tag tag-${tone}">${over ? t('budget.over.short') : Math.round(pct) + '%'}</span>
        </div>
        <div class="b-amounts">
          <span class="spent">${formatVND(b.spent)}</span>
          <span class="total">/ ${formatVND(b.limit)}</span>
        </div>
        <div class="progress progress-lg"><div class="progress-fill ${tone}" style="width:${pct}%"></div></div>
        <div class="b-status">
          <span class="text-muted">${t('budget.monthly')}</span>
          <span class="${over ? 'text-danger' : 'text-muted'}">${over ? t('budget.over.short') + ' ' + formatVND(b.spent - b.limit) : t('budget.remain.short') + ' ' + formatVND(b.limit - b.spent)}</span>
        </div>
        <div class="b-actions">
          <button class="btn btn-secondary btn-sm" data-action="edit"><i data-lucide="pencil"></i>${t('common.edit')}</button>
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
    return `<option value="${c.id}" ${c.id === b.categoryId ? 'selected' : ''} ${used ? 'disabled' : ''}>${escapeHTML(c.name)}${used ? ' ' + t('budget.cat.used') : ''}</option>`;
  }).join('');
  openModal({
    title: isEdit ? t('budget.edit') : t('budget.add'),
    body: `
      <form id="bf">
        <div class="form-field">
          <label class="form-label">${t('common.category')}</label>
          <select class="select" id="bf-cat" ${isEdit ? 'disabled' : ''}><option value="">${t('budget.cat.select')}</option>${catOptions}</select>
        </div>
        <div class="form-field">
          <label class="form-label">${t('budget.limit.month')} (${getCurrencySymbol()})</label>
          <input class="input" type="number" min="0" step="any" id="bf-limit" value="${b.limit ? fromBaseVND(b.limit) : ''}" />
        </div>
      </form>
    `,
    actions: `<button class="btn btn-secondary" data-close>${t('common.cancel')}</button><button class="btn btn-primary" id="bf-save">${isEdit ? t('common.update') : t('common.save')}</button>`
  });
  setTimeout(() => {
    document.getElementById('bf-save').addEventListener('click', () => {
      const cat = document.getElementById('bf-cat')?.value || b.categoryId;
      const limitInput = parseFloat(document.getElementById('bf-limit').value);
      const limit = toBaseVND(limitInput);
      if (!cat) return showToast(t('budget.toast.cat'), 'error');
      if (!limit || limit <= 0) return showToast(t('budget.toast.invalid'), 'error');
      if (isEdit) { updateBudget(existing.id, { limit }); showToast(t('budget.toast.updated'), 'success'); }
      else { addBudget({ categoryId: cat, limit, period: 'monthly', startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() }); showToast(t('budget.toast.added'), 'success'); }
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
    if (await confirmDialog(t('budget.confirm.delete'), { danger: true, okText: t('common.delete') })) {
      deleteBudget(id); showToast(t('budget.toast.deleted'), 'success'); render();
    }
  }
});

render();
mountIcons();

// Re-render dynamic content on language/currency change so labels and amounts refresh
window.addEventListener('lang-changed', render);
window.addEventListener('currency-changed', render);
