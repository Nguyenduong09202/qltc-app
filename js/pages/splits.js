// splits.js — chia hóa đơn (split bill)
import { initStore, getState, addSplit, updateSplit, deleteSplit, toggleSettlement, addFriend, updateFriend, deleteFriend } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatDate, escapeHTML } from '../modules/format.js';
import { getCurrencySymbol, toBaseVND, fromBaseVND, t } from '../modules/i18n.js';
import { showToast, openModal, confirmDialog, renderEmptyState } from '../modules/ui.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'splits', title: t('split.title') });

const FRIEND_COLORS = ['#4F46E5','#16A34A','#F59E0B','#EC4899','#0EA5E9','#8B5CF6','#DC2626','#10B981'];

function getMe() {
  const s = getState();
  return { id: 'me', name: s.auth?.user?.name || 'Bạn', color: '#6366F1' };
}

function getPersonById(id) {
  if (id === 'me') return getMe();
  return (getState().data.friends || []).find(f => f.id === id) || { id, name: 'Đã xóa', color: '#94A3B8' };
}

function avatarInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function computeBalances() {
  const splits = getState().data.splits || [];
  let owed = 0;   // người khác nợ mình
  let owe = 0;    // mình nợ người khác

  splits.forEach(s => {
    s.participants.forEach(p => {
      if (p.settled) return;
      if (s.paidBy === 'me' && p.id !== 'me') owed += p.share;
      if (s.paidBy !== 'me' && p.id === 'me') owe += p.share;
    });
  });

  return { owed, owe, net: owed - owe };
}

function renderSummary() {
  const { owed, owe, net } = computeBalances();
  const c = document.getElementById('split-summary');
  c.innerHTML = `
    <div class="split-summary-card owed">
      <div class="label"><i data-lucide="arrow-down-left"></i>${t('split.owed')}</div>
      <div class="value text-success">${formatVND(owed)}</div>
    </div>
    <div class="split-summary-card owe">
      <div class="label"><i data-lucide="arrow-up-right"></i>${t('split.owe')}</div>
      <div class="value text-danger">${formatVND(owe)}</div>
    </div>
    <div class="split-summary-card net">
      <div class="label"><i data-lucide="scale"></i>${t('split.net')}</div>
      <div class="value" style="color:${net >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${(net >= 0 ? '+' : '−') + formatVND(Math.abs(net))}</div>
    </div>
  `;
  mountIcons();
}

function renderSplits() {
  const splits = getState().data.splits || [];
  const list = document.getElementById('splits-list');
  if (splits.length === 0) {
    renderEmptyState(list, {
      icon: 'users',
      title: t('split.empty.title'),
      desc: t('split.empty.desc'),
      ctaLabel: t('split.new'),
      ctaAction: () => openSplitModal()
    });
    return;
  }

  list.innerHTML = splits.map(s => {
    const payer = getPersonById(s.paidBy);
    const unsettledCount = s.participants.filter(p => !p.settled).length;
    return `
      <div class="split-card" data-id="${s.id}">
        <div class="split-head">
          <div class="split-head-info">
            <div class="split-title">${escapeHTML(s.title)}</div>
            <div class="split-meta">
              <span><i data-lucide="calendar"></i>${formatDate(s.date)}</span>
              <span><i data-lucide="wallet"></i>${escapeHTML(payer.name)} ${t('split.paid')}</span>
              <span><i data-lucide="users"></i>${s.participants.length} ${t('split.people')}</span>
              ${unsettledCount > 0
                ? `<span style="color:var(--color-warning)"><i data-lucide="clock"></i>${t('split.unsettled.left')} ${unsettledCount} ${t('split.unsettled.right')}</span>`
                : `<span style="color:var(--color-success)"><i data-lucide="check-circle-2"></i>${t('split.settled')}</span>`}
            </div>
            ${s.note ? `<div class="text-secondary fs-sm" style="margin-top:6px;">${escapeHTML(s.note)}</div>` : ''}
          </div>
          <div class="split-total">${formatVND(s.totalAmount)}</div>
        </div>

        <div class="split-participants">
          ${s.participants.map(p => {
            const person = getPersonById(p.id);
            const isPayer = s.paidBy === p.id;
            const classes = ['split-participant'];
            if (p.settled) classes.push('is-settled');
            if (isPayer) classes.push('is-paid-by');
            return `
              <div class="${classes.join(' ')}">
                <div class="sp-avatar" style="background:${person.color}">${avatarInitial(person.name)}</div>
                <div class="sp-info">
                  <div class="sp-name">${escapeHTML(person.name)}${isPayer ? ' · ' + t('split.paid.label') : ''}</div>
                  <div class="sp-share">${formatVND(p.share)}</div>
                </div>
                ${isPayer ? '' : `
                  <button class="sp-toggle ${p.settled ? 'is-settled' : ''}" data-toggle data-pid="${p.id}" title="${p.settled ? 'Đã thanh toán' : 'Đánh dấu đã thanh toán'}">
                    ${p.settled ? '<i data-lucide="check"></i>' : ''}
                  </button>
                `}
              </div>
            `;
          }).join('')}
        </div>

        <div class="split-actions">
          <button class="btn btn-ghost btn-sm" data-action="edit"><i data-lucide="pencil"></i>${t('common.edit')}</button>
          <button class="btn btn-ghost btn-sm" data-action="delete" style="color:var(--color-danger)"><i data-lucide="trash-2"></i>${t('common.delete')}</button>
        </div>
      </div>
    `;
  }).join('');
  mountIcons();
}

function render() {
  renderSummary();
  renderSplits();
}

// ===== Split modal =====
function openSplitModal(existing) {
  const isEdit = !!existing;
  const friends = getState().data.friends || [];
  const me = getMe();
  const allPeople = [me, ...friends];

  const initial = existing || {
    title: '',
    totalAmount: 0,
    date: new Date().toISOString().slice(0, 10),
    paidBy: 'me',
    note: '',
    participants: allPeople.map(p => ({ id: p.id, share: 0, settled: p.id === 'me' }))
  };

  // Selected participants set
  const selectedIds = new Set(initial.participants.map(p => p.id));

  // totalDisplay is in the current displayed currency (not VND)
  function renderParticipantsList(totalDisplay, paidBy) {
    const equalShare = selectedIds.size > 0 ? Math.round(totalDisplay / selectedIds.size) : 0;
    return allPeople.map(person => {
      const isSelected = selectedIds.has(person.id);
      const existingP = initial.participants.find(p => p.id === person.id);
      const share = existingP && isEdit ? fromBaseVND(existingP.share) : equalShare;
      const isPayer = paidBy === person.id;
      return `
        <label class="split-form-participant ${isPayer ? 'is-paid-by' : ''}">
          <input type="checkbox" data-participant="${person.id}" ${isSelected ? 'checked' : ''} ${person.id === 'me' ? 'disabled' : ''} />
          <span style="display:flex;align-items:center;gap:8px;">
            <span class="sp-avatar" style="background:${person.color};width:24px;height:24px;font-size:11px;">${avatarInitial(person.name)}</span>
            <span>${escapeHTML(person.name)}${isPayer ? ' · trả' : ''}</span>
          </span>
          <input type="number" class="input" data-share="${person.id}" min="0" step="any" value="${isSelected ? share : 0}" ${isSelected ? '' : 'disabled'} />
        </label>
      `;
    }).join('');
  }

  const friendOptions = allPeople.map(p =>
    `<option value="${p.id}" ${p.id === initial.paidBy ? 'selected' : ''}>${escapeHTML(p.name)}</option>`
  ).join('');

  openModal({
    title: isEdit ? t('split.modal.edit') : t('split.modal.new'),
    size: 'lg',
    body: `
      ${friends.length === 0 ? `
        <div class="card" style="background:var(--color-warning-soft);border:1px solid var(--color-warning);margin-bottom:var(--s-3);">
          <div class="flex" style="align-items:center;gap:var(--s-2);">
            <i data-lucide="info" style="color:var(--color-warning);"></i>
            <div class="fs-sm">${t('split.friend.warn')}</div>
          </div>
        </div>
      ` : ''}
      <div class="form-field">
        <label class="form-label">${t('split.f.title')}</label>
        <input class="input" id="sp-title" value="${escapeHTML(initial.title)}" placeholder="${t('split.f.title.ph')}" />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">${t('split.f.total')} (${getCurrencySymbol()})</label>
          <input class="input" type="number" min="0" step="any" id="sp-total" value="${initial.totalAmount ? fromBaseVND(initial.totalAmount) : ''}" />
        </div>
        <div class="form-field">
          <label class="form-label">${t('split.f.date')}</label>
          <input class="input" type="date" id="sp-date" value="${(initial.date || '').slice(0, 10)}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">${t('split.f.paidby')}</label>
          <select class="select" id="sp-paidby">${friendOptions}</select>
        </div>
        <div class="form-field">
          <label class="form-label">${t('split.f.mode')}</label>
          <select class="select" id="sp-split-mode">
            <option value="equal">${t('split.f.mode.equal')}</option>
            <option value="custom">${t('split.f.mode.custom')}</option>
          </select>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">${t('split.f.participants')}</label>
        <div class="split-form-participants" id="sp-participants">${renderParticipantsList(fromBaseVND(initial.totalAmount || 0), initial.paidBy)}</div>
        <div class="text-muted fs-xs" style="margin-top:6px;">
          ${t('split.f.sum')}: <strong id="sp-sum">${formatVND(0)}</strong> · ${t('split.f.target')}: <strong id="sp-target">${formatVND(initial.totalAmount || 0)}</strong>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">${t('split.f.note')}</label>
        <textarea class="input" id="sp-note" rows="2">${escapeHTML(initial.note || '')}</textarea>
      </div>
    `,
    actions: `<button class="btn btn-secondary" data-close>${t('common.cancel')}</button><button class="btn btn-primary" id="sp-save">${isEdit ? t('common.update') : t('common.save')}</button>`
  });

  setTimeout(() => {
    const totalEl = document.getElementById('sp-total');
    const paidByEl = document.getElementById('sp-paidby');
    const modeEl = document.getElementById('sp-split-mode');
    const partsEl = document.getElementById('sp-participants');
    const sumEl = document.getElementById('sp-sum');
    const targetEl = document.getElementById('sp-target');

    function recomputeShares() {
      const totalDisplay = parseFloat(totalEl.value) || 0;
      targetEl.textContent = formatVND(toBaseVND(totalDisplay));
      if (modeEl.value === 'equal' && selectedIds.size > 0) {
        const equal = Math.round(totalDisplay / selectedIds.size);
        selectedIds.forEach(id => {
          const inp = partsEl.querySelector(`[data-share="${id}"]`);
          if (inp) inp.value = equal;
        });
      }
      updateSum();
    }

    function updateSum() {
      let sumDisplay = 0;
      partsEl.querySelectorAll('[data-share]').forEach(inp => {
        if (!inp.disabled) sumDisplay += parseFloat(inp.value) || 0;
      });
      sumEl.textContent = formatVND(toBaseVND(sumDisplay));
      const totalDisplay = parseFloat(totalEl.value) || 0;
      sumEl.style.color = Math.abs(sumDisplay - totalDisplay) > 1 ? 'var(--color-warning)' : 'var(--color-success)';
    }

    function rerenderParts() {
      partsEl.innerHTML = renderParticipantsList(parseFloat(totalEl.value) || 0, paidByEl.value);
      attachPartEvents();
      recomputeShares();
    }

    function attachPartEvents() {
      partsEl.querySelectorAll('[data-participant]').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) selectedIds.add(cb.dataset.participant);
          else selectedIds.delete(cb.dataset.participant);
          const row = cb.closest('.split-form-participant');
          const share = row.querySelector('[data-share]');
          share.disabled = !cb.checked;
          if (!cb.checked) share.value = 0;
          recomputeShares();
        });
      });
      partsEl.querySelectorAll('[data-share]').forEach(inp => {
        inp.addEventListener('input', updateSum);
      });
    }

    attachPartEvents();
    updateSum();

    totalEl.addEventListener('input', recomputeShares);
    paidByEl.addEventListener('change', rerenderParts);
    modeEl.addEventListener('change', recomputeShares);

    document.getElementById('sp-save').addEventListener('click', () => {
      const title = document.getElementById('sp-title').value.trim();
      const totalDisplay = parseFloat(totalEl.value);
      const date = document.getElementById('sp-date').value;
      const paidBy = paidByEl.value;
      const note = document.getElementById('sp-note').value.trim();

      if (!title) return showToast(t('split.toast.title'), 'error');
      if (!totalDisplay || totalDisplay <= 0) return showToast(t('split.toast.total'), 'error');
      if (selectedIds.size < 2) return showToast(t('split.toast.min'), 'error');

      const total = toBaseVND(totalDisplay);
      const participants = [];
      selectedIds.forEach(id => {
        const inp = partsEl.querySelector(`[data-share="${id}"]`);
        const shareDisplay = parseFloat(inp.value) || 0;
        const share = toBaseVND(shareDisplay);
        const existingP = initial.participants.find(p => p.id === id);
        participants.push({
          id,
          share,
          settled: id === paidBy ? true : (existingP?.settled || false)
        });
      });

      const sumShares = participants.reduce((s, p) => s + p.share, 0);
      if (Math.abs(sumShares - total) > 1) {
        if (!confirm(t('split.confirm.unbalanced'))) return;
      }

      const data = { title, totalAmount: total, date, paidBy, note, participants };
      if (isEdit) {
        updateSplit(existing.id, data);
        showToast(t('split.toast.updated'), 'success');
      } else {
        addSplit(data);
        showToast(t('split.toast.added'), 'success');
      }
      document.querySelector('.modal-backdrop')?.remove();
      render();
    });
  }, 60);
}

// ===== Friends modal =====
function openFriendsModal() {
  const friends = getState().data.friends || [];
  openModal({
    title: t('split.friends.title'),
    body: `
      <div class="flex" style="margin-bottom:var(--s-3);align-items:stretch;gap:var(--s-2);">
        <input class="input" id="ff-name" placeholder="${t('split.friend.ph')}" style="flex:1;" />
        <button class="btn btn-primary" id="ff-add" style="white-space:nowrap;flex-shrink:0;"><i data-lucide="plus"></i>${t('common.add')}</button>
      </div>
      <div class="friends-list" id="ff-list"></div>
    `,
    actions: `<button class="btn btn-secondary" data-close>${t('common.close')}</button>`
  });

  setTimeout(() => {
    function renderFriends() {
      const list = document.getElementById('ff-list');
      const friends = getState().data.friends || [];
      if (friends.length === 0) {
        list.innerHTML = '<div class="text-muted fs-sm" style="text-align:center;padding:var(--s-4);">' + t('split.friend.none') + '</div>';
        return;
      }
      list.innerHTML = friends.map(f => `
        <div class="friend-row" data-id="${f.id}">
          <div class="sp-avatar" style="background:${f.color}">${avatarInitial(f.name)}</div>
          <div class="friend-row-name">${escapeHTML(f.name)}</div>
          <button class="icon-btn" data-action="edit" title="Sửa tên"><i data-lucide="pencil"></i></button>
          <button class="icon-btn" data-action="delete" title="Xóa" style="color:var(--color-danger)"><i data-lucide="trash-2"></i></button>
        </div>
      `).join('');
      mountIcons();
    }

    renderFriends();
    mountIcons();

    document.getElementById('ff-add').addEventListener('click', () => {
      const input = document.getElementById('ff-name');
      const name = input.value.trim();
      if (!name) return showToast('Nhập tên', 'error');
      const friends = getState().data.friends || [];
      const color = FRIEND_COLORS[friends.length % FRIEND_COLORS.length];
      addFriend({ name, color });
      input.value = '';
      renderFriends();
      showToast('Đã thêm ' + name, 'success');
    });

    document.getElementById('ff-list').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.closest('[data-id]').dataset.id;
      const f = (getState().data.friends || []).find(x => x.id === id);
      if (!f) return;
      if (btn.dataset.action === 'edit') {
        const name = prompt('Sửa tên:', f.name);
        if (name && name.trim()) {
          updateFriend(id, { name: name.trim() });
          renderFriends();
        }
      } else if (btn.dataset.action === 'delete') {
        if (await confirmDialog('Xóa "' + f.name + '"? Các hóa đơn đã có sẽ giữ nguyên dữ liệu.', { danger: true, okText: 'Xóa' })) {
          deleteFriend(id);
          renderFriends();
          showToast('Đã xóa', 'success');
        }
      }
    });
  }, 60);
}

// ===== Wire up =====
document.getElementById('btn-add-split').addEventListener('click', () => openSplitModal());
document.getElementById('btn-friends').addEventListener('click', () => {
  openFriendsModal();
  // Re-render splits afterward in case names changed
  setTimeout(() => {
    const modal = document.querySelector('.modal-backdrop');
    if (modal) {
      const observer = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
          render();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true });
    }
  }, 100);
});

document.getElementById('splits-list').addEventListener('click', async (e) => {
  const card = e.target.closest('[data-id]');
  if (!card) return;
  const id = card.dataset.id;
  const s = (getState().data.splits || []).find(x => x.id === id);
  if (!s) return;

  const toggleBtn = e.target.closest('[data-toggle]');
  if (toggleBtn) {
    toggleSettlement(id, toggleBtn.dataset.pid);
    render();
    return;
  }

  const actionBtn = e.target.closest('[data-action]');
  if (!actionBtn) return;
  if (actionBtn.dataset.action === 'edit') openSplitModal(s);
  else if (actionBtn.dataset.action === 'delete') {
    if (await confirmDialog(t('split.confirm.delete') + ' "' + s.title + '"?', { danger: true, okText: t('common.delete') })) {
      deleteSplit(id);
      showToast(t('budget.toast.deleted'), 'success');
      render();
    }
  }
});

render();
mountIcons();
window.addEventListener('lang-changed', render);
window.addEventListener('currency-changed', render);
