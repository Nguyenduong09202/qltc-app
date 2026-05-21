// goals.js
import { initStore, getState, addGoal, updateGoal, deleteGoal } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatDate, escapeHTML } from '../modules/format.js';
import { getCurrencySymbol, toBaseVND, fromBaseVND, t } from '../modules/i18n.js';
import { showToast, openModal, confirmDialog, renderEmptyState } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'goals', title: t('app.nav.goals') });

const ICONS = ['target','shield','plane','laptop','home','car','heart','graduation-cap','gift','smartphone'];
const COLORS = ['#4F46E5','#0EA5E9','#16A34A','#F59E0B','#EC4899','#8B5CF6','#DC2626','#22C55E'];

function render() {
  const goals = getState().data.goals;
  const list = document.getElementById('g-list');
  if (goals.length === 0) {
    renderEmptyState(list, { icon: 'target', title: t('goal.empty.title'), desc: t('goal.empty.desc'), ctaLabel: t('goal.add'), ctaAction: () => openGoalModal() });
    return;
  }
  list.innerHTML = goals.map(g => {
    const pct = Math.min(100, Math.round(g.currentAmount / g.targetAmount * 100));
    return `
      <div class="card goal-tile" data-id="${g.id}">
        <div class="g-head">
          <div class="g-icon" style="background:${g.color}22;color:${g.color}"><i data-lucide="${g.icon}"></i></div>
          <div class="g-name">${escapeHTML(g.name)}</div>
        </div>
        <div class="g-meta">
          <span class="text-secondary">${formatVND(g.currentAmount)} / ${formatVND(g.targetAmount)}</span>
          <span class="g-percent" style="color:${g.color}">${pct}%</span>
        </div>
        <div class="progress progress-lg"><div class="progress-fill" style="width:${pct}%;background:${g.color}"></div></div>
        <div class="g-deadline"><i data-lucide="calendar"></i><span>${t('goal.deadline.prefix')}: ${formatDate(g.deadline)}</span></div>
        ${g.note ? `<div class="text-secondary fs-sm">${escapeHTML(g.note)}</div>` : ''}
        <div class="g-actions">
          <button class="btn btn-secondary btn-sm" data-action="deposit"><i data-lucide="plus-circle"></i>${t('goal.deposit.btn')}</button>
          <button class="btn btn-ghost btn-sm" data-action="edit"><i data-lucide="pencil"></i></button>
          <button class="btn btn-ghost btn-sm" data-action="delete"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;
  }).join('');
  mountIcons();
}

function openGoalModal(existing) {
  const isEdit = !!existing;
  const g = existing || { name: '', targetAmount: '', currentAmount: 0, deadline: '', icon: 'target', color: COLORS[0], note: '' };
  openModal({
    title: isEdit ? t('goal.modal.edit') : t('goal.modal.add'),
    body: `
      <div class="form-field">
        <label class="form-label">${t('common.name')}</label>
        <input class="input" id="gf-name" value="${escapeHTML(g.name)}" placeholder="${t('goal.name.placeholder')}" />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">${t('goal.target.amount')} (${getCurrencySymbol()})</label>
          <input class="input" type="number" min="0" step="any" id="gf-target" value="${g.targetAmount ? fromBaseVND(g.targetAmount) : ''}" />
        </div>
        <div class="form-field">
          <label class="form-label">${t('goal.saved.amount')} (${getCurrencySymbol()})</label>
          <input class="input" type="number" min="0" step="any" id="gf-current" value="${g.currentAmount ? fromBaseVND(g.currentAmount) : 0}" />
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">${t('common.deadline')}</label>
        <input class="input" type="date" id="gf-deadline" value="${(g.deadline || '').slice(0, 10)}" />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">${t('common.icon')}</label>
          <select class="select" id="gf-icon">${ICONS.map(i => `<option value="${i}" ${i === g.icon ? 'selected' : ''}>${i}</option>`).join('')}</select>
        </div>
        <div class="form-field">
          <label class="form-label">${t('common.color')}</label>
          <select class="select" id="gf-color">${COLORS.map(c => `<option value="${c}" ${c === g.color ? 'selected' : ''}>${c}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">${t('common.note')}</label>
        <textarea class="input" id="gf-note" rows="2">${escapeHTML(g.note || '')}</textarea>
      </div>
    `,
    actions: `<button class="btn btn-secondary" data-close>${t('common.cancel')}</button><button class="btn btn-primary" id="gf-save">${isEdit ? t('common.update') : t('common.save')}</button>`
  });
  setTimeout(() => {
    document.getElementById('gf-save').addEventListener('click', () => {
      const data = {
        name: document.getElementById('gf-name').value.trim(),
        targetAmount: toBaseVND(parseFloat(document.getElementById('gf-target').value)),
        currentAmount: toBaseVND(parseFloat(document.getElementById('gf-current').value) || 0),
        deadline: document.getElementById('gf-deadline').value,
        icon: document.getElementById('gf-icon').value,
        color: document.getElementById('gf-color').value,
        note: document.getElementById('gf-note').value.trim()
      };
      if (!data.name) return showToast(t('goal.toast.empty.name'), 'error');
      if (!data.targetAmount || data.targetAmount <= 0) return showToast(t('goal.toast.invalid'), 'error');
      if (isEdit) { updateGoal(existing.id, data); showToast(t('goal.toast.updated'), 'success'); }
      else { addGoal(data); showToast(t('goal.toast.added'), 'success'); }
      document.querySelector('.modal-backdrop')?.remove();
      render();
    });
  }, 60);
}

function openDepositModal(g) {
  openModal({
    title: t('goal.deposit.title') + ' "' + g.name + '"',
    body: `
      <div class="form-field">
        <label class="form-label">${t('goal.deposit.current')}: ${formatVND(g.currentAmount)}</label>
      </div>
      <div class="form-field">
        <label class="form-label">${t('goal.deposit.amount')} (${getCurrencySymbol()})</label>
        <input class="input" type="number" min="0" step="any" id="dep-amt" />
      </div>
    `,
    actions: `<button class="btn btn-secondary" data-close>${t('common.cancel')}</button><button class="btn btn-primary" id="dep-save">${t('goal.deposit.do')}</button>`
  });
  setTimeout(() => {
    document.getElementById('dep-save').addEventListener('click', () => {
      const input = parseFloat(document.getElementById('dep-amt').value);
      const v = toBaseVND(input);
      if (!v || v <= 0) return showToast(t('goal.toast.empty.amt'), 'error');
      updateGoal(g.id, { currentAmount: g.currentAmount + v });
      showToast(t('goal.deposit.added') + ' ' + formatVND(v), 'success');
      document.querySelector('.modal-backdrop')?.remove();
      render();
    });
  }, 60);
}

document.getElementById('btn-add').addEventListener('click', () => openGoalModal());
document.getElementById('g-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  const g = getState().data.goals.find(x => x.id === id);
  if (btn.dataset.action === 'edit') openGoalModal(g);
  else if (btn.dataset.action === 'deposit') openDepositModal(g);
  else if (btn.dataset.action === 'delete') {
    if (await confirmDialog(t('goal.confirm.delete') + ' "' + g.name + '"?', { danger: true, okText: t('common.delete') })) {
      deleteGoal(id); showToast(t('budget.toast.deleted'), 'success'); render();
    }
  }
});

render();
mountIcons();
window.addEventListener('lang-changed', render);
window.addEventListener('currency-changed', render);
