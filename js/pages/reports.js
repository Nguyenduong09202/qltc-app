// reports.js
import { initStore, getState, getCategoryById } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatVNDShort, formatDate, escapeHTML } from '../modules/format.js';
import { createChart, getChartColors, destroyAllCharts } from '../modules/charts.js';
import { t } from '../modules/i18n.js';
import { mountIcons } from '../modules/icons.js';

initStore();
if (!requireAuth()) {}
renderShell({ activePage: 'reports', title: t('app.nav.reports') });

let range = 'month';

function periodStart() {
  const now = new Date();
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth() - 5, 1); // last 6 months
  if (range === 'quarter') return new Date(now.getFullYear() - 1, now.getMonth(), 1); // last ~12 months
  return new Date(now.getFullYear() - 2, 0, 1); // last 3 years
}

function bucketLabel(d) {
  if (range === 'month') return formatDate(d, 'MM/YYYY');
  if (range === 'quarter') return 'Q' + (Math.floor(d.getMonth() / 3) + 1) + '/' + d.getFullYear();
  return String(d.getFullYear());
}

function render() {
  destroyAllCharts();
  const tx = getState().data.transactions;
  const start = periodStart();
  const inRange = tx.filter(t => new Date(t.date) >= start);

  // summary
  const income = inRange.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = inRange.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const txCount = inRange.length;
  document.getElementById('r-summary').innerHTML = [
    { label: t('report.total.income'),  value: formatVND(income),  icon: 'arrow-down-circle', tone: 'success' },
    { label: t('report.total.expense'), value: formatVND(expense), icon: 'arrow-up-circle',   tone: 'danger'  },
    { label: t('report.net'),           value: formatVND(net),     icon: 'scale',             tone: net >= 0 ? 'success' : 'danger' },
    { label: t('report.tx.count'),      value: txCount,            icon: 'list',              tone: 'primary' }
  ].map(s => `
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">${s.label}</div><div class="stat-icon ${s.tone}"><i data-lucide="${s.icon}"></i></div></div>
      <div class="stat-value">${s.value}</div>
    </div>
  `).join('');

  // bar chart — income vs expense per period
  const buckets = {};
  inRange.forEach(t => {
    const d = new Date(t.date);
    const k = bucketLabel(d);
    if (!buckets[k]) buckets[k] = { income: 0, expense: 0, sort: d.getFullYear() * 100 + d.getMonth() };
    buckets[k][t.type] += t.amount;
  });
  const sorted = Object.entries(buckets).sort((a, b) => a[1].sort - b[1].sort);
  const labels = sorted.map(([k]) => k);
  const incomeArr = sorted.map(([, v]) => v.income);
  const expenseArr = sorted.map(([, v]) => v.expense);
  const c = getChartColors();
  createChart(document.getElementById('chart-bar').getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: t('common.income'),  data: incomeArr,  backgroundColor: c.success, borderRadius: 6 },
        { label: t('common.expense'), data: expenseArr, backgroundColor: c.danger,  borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + formatVND(ctx.parsed.y) } }
      },
      scales: { y: { ticks: { callback: v => formatVNDShort(v) } }, x: { grid: { display: false } } }
    }
  });

  // category bar (horizontal)
  const byCat = {};
  inRange.filter(t => t.type === 'expense').forEach(t => { byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount; });
  const catRows = Object.entries(byCat).map(([cid, amt]) => ({ cat: getCategoryById(cid), amt })).filter(r => r.cat).sort((a,b) => b.amt - a.amt);
  createChart(document.getElementById('chart-cat').getContext('2d'), {
    type: 'bar',
    data: {
      labels: catRows.map(r => r.cat.name),
      datasets: [{ data: catRows.map(r => r.amt), backgroundColor: catRows.map(r => r.cat.color), borderRadius: 6 }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatVND(ctx.parsed.x) } } },
      scales: { x: { ticks: { callback: v => formatVNDShort(v) } }, y: { grid: { display: false } } }
    }
  });

  // top spending
  const top = [...inRange.filter(t => t.type === 'expense')].sort((a, b) => b.amount - a.amount).slice(0, 5);
  document.getElementById('top-spending').innerHTML = top.map(t => {
    const cat = getCategoryById(t.categoryId);
    return `<tr>
      <td><div class="font-semibold">${escapeHTML(t.note || '—')}</div></td>
      <td><div class="tx-row-cat"><span class="dot" style="background:${cat?.color};width:10px;height:10px;border-radius:50%;display:inline-block"></span>${escapeHTML(cat?.name || '—')}</div></td>
      <td>${formatDate(t.date)}</td>
      <td class="text-right text-danger font-semibold">${formatVND(t.amount)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="text-muted text-center" style="padding:var(--s-6)">Không có dữ liệu</td></tr>';
  mountIcons();
}

document.querySelectorAll('#range-seg button').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#range-seg button').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    range = b.dataset.range;
    render();
  });
});

render();
mountIcons();
window.addEventListener('lang-changed', render);
window.addEventListener('currency-changed', render);
