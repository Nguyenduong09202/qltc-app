// dashboard.js
import { initStore, getState, getCategoryById, getWalletById } from '../modules/store.js';
import { renderShell } from '../modules/shell.js';
import { requireAuth } from '../modules/router.js';
import { formatVND, formatVNDShort, formatDate, formatSigned, formatChange, escapeHTML } from '../modules/format.js';
import { createChart, getChartColors, destroyAllCharts } from '../modules/charts.js';
import { mountIcons } from '../modules/icons.js';
import { openModal } from '../modules/ui.js';

initStore();
if (!requireAuth()) { /* redirected */ }
renderShell({ activePage: 'dashboard', title: 'Tổng quan' });

const state = getState();
const tx = state.data.transactions;

// ---------- Welcome title — time-aware greeting + insight ----------
const userName = state.auth?.user?.name || 'bạn';
const firstName = userName.trim().split(/\s+/).pop();
const welcomeEl = document.getElementById('welcome-title');
const insightEl = document.getElementById('welcome-insight');
if (welcomeEl) {
  const h = new Date().getHours();
  let greet = 'Chào mừng trở lại', emoji = '👋';
  if (h >= 5 && h < 11)       { greet = 'Chào buổi sáng';  emoji = '🌅'; }
  else if (h >= 11 && h < 17) { greet = 'Chào buổi chiều'; emoji = '☀️'; }
  else if (h >= 17 && h < 22) { greet = 'Chào buổi tối';   emoji = '🌆'; }
  else                         { greet = 'Khuya rồi';       emoji = '🌙'; }
  welcomeEl.innerHTML = `${greet}, ${escapeHTML(firstName)} ${emoji}`;
}

// Smart insight: compare this week vs last week, pick most interesting fact
function computeInsight() {
  const now = new Date();
  const startThisWeek = new Date(now); startThisWeek.setDate(now.getDate() - 7);
  const startLastWeek = new Date(now); startLastWeek.setDate(now.getDate() - 14);
  const inRange = (d, s, e) => { const dt = new Date(d); return dt >= s && dt < e; };

  const thisExp = tx.filter(t => t.type === 'expense' && inRange(t.date, startThisWeek, now));
  const lastExp = tx.filter(t => t.type === 'expense' && inRange(t.date, startLastWeek, startThisWeek));
  const thisInc = tx.filter(t => t.type === 'income'  && inRange(t.date, startThisWeek, now)).reduce((s, t) => s + t.amount, 0);
  const lastInc = tx.filter(t => t.type === 'income'  && inRange(t.date, startLastWeek, startThisWeek)).reduce((s, t) => s + t.amount, 0);
  const thisExpSum = thisExp.reduce((s, t) => s + t.amount, 0);
  const lastExpSum = lastExp.reduce((s, t) => s + t.amount, 0);

  if (lastExpSum === 0 && thisExpSum === 0) return 'Bắt đầu ghi giao dịch để xem xu hướng chi tiêu của bạn.';

  // Find top category change
  const byCat = (arr) => arr.reduce((m, t) => { m[t.categoryId] = (m[t.categoryId] || 0) + t.amount; return m; }, {});
  const thisCat = byCat(thisExp), lastCat = byCat(lastExp);
  let topId = null, topDelta = 0;
  for (const id of new Set([...Object.keys(thisCat), ...Object.keys(lastCat)])) {
    const delta = (thisCat[id] || 0) - (lastCat[id] || 0);
    if (Math.abs(delta) > Math.abs(topDelta)) { topDelta = delta; topId = id; }
  }

  const expPct = lastExpSum > 0 ? ((thisExpSum - lastExpSum) / lastExpSum) * 100 : 0;
  const incPct = lastInc > 0 ? ((thisInc - lastInc) / lastInc) * 100 : 0;
  const savings = thisInc - thisExpSum;
  const lastSavings = lastInc - lastExpSum;

  // Pick the most "interesting" message
  if (topId && Math.abs(topDelta) > 200000) {
    const cat = getCategoryById(topId);
    const dir = topDelta > 0 ? 'nhiều hơn' : 'ít hơn';
    const pct = lastCat[topId] > 0 ? Math.round((Math.abs(topDelta) / lastCat[topId]) * 100) : null;
    const emoji = topDelta > 0 ? '👀' : '👍';
    return `Tuần này bạn chi <strong>${escapeHTML(cat?.name || 'một danh mục')}</strong> ${dir} ${pct ? `<strong>${pct}%</strong> ` : ''}so với tuần trước ${emoji}`;
  }
  if (savings > lastSavings && lastSavings >= 0) {
    return `Tiết kiệm tuần này <strong>+${formatVND(savings - lastSavings)}</strong> so với tuần trước 🎯`;
  }
  if (Math.abs(expPct) > 10) {
    return `Chi tiêu tuần này ${expPct > 0 ? 'tăng' : 'giảm'} <strong>${Math.abs(Math.round(expPct))}%</strong> so với tuần trước ${expPct > 0 ? '⚠️' : '✨'}`;
  }
  return 'Đây là bức tranh tài chính của bạn hôm nay.';
}
if (insightEl) insightEl.innerHTML = computeInsight();

function sumByPeriod(start, end, type) {
  return tx
    .filter(t => t.type === type && new Date(t.date) >= start && new Date(t.date) < end)
    .reduce((s, t) => s + t.amount, 0);
}

// ---------- Period selector ----------
function presetRange(key) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  if (key === 'month')     return { start: new Date(y, m, 1),     end: now,                  prevStart: new Date(y, m - 1, 1), prevEnd: new Date(y, m, 1),  label: 'Tháng này' };
  if (key === 'lastMonth') return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1),    prevStart: new Date(y, m - 2, 1), prevEnd: new Date(y, m - 1, 1), label: 'Tháng trước' };
  if (key === 'year')      return { start: new Date(y, 0, 1),     end: now,                  prevStart: new Date(y - 1, 0, 1), prevEnd: new Date(y, 0, 1),  label: 'Năm nay' };
  if (key === '7d')        { const s = new Date(now); s.setDate(s.getDate() - 7); const ps = new Date(s); ps.setDate(ps.getDate() - 7); return { start: s, end: now, prevStart: ps, prevEnd: s, label: '7 ngày qua' }; }
  if (key === '30d')       { const s = new Date(now); s.setDate(s.getDate() - 30); const ps = new Date(s); ps.setDate(ps.getDate() - 30); return { start: s, end: now, prevStart: ps, prevEnd: s, label: '30 ngày qua' }; }
  if (key === '90d')       { const s = new Date(now); s.setDate(s.getDate() - 90); const ps = new Date(s); ps.setDate(ps.getDate() - 90); return { start: s, end: now, prevStart: ps, prevEnd: s, label: '90 ngày qua' }; }
  return presetRange('month');
}

let currentRange = presetRange('month');

function shortLabel(label) {
  return label.toLowerCase();
}

// ---------- Sparkline (pure SVG, no Chart.js) ----------
function buildSparklineData(type) {
  const days = 30;
  const buckets = new Array(days).fill(0);
  const startD = new Date(); startD.setHours(0,0,0,0); startD.setDate(startD.getDate() - (days - 1));
  tx.forEach(t => {
    const d = new Date(t.date); d.setHours(0,0,0,0);
    const idx = Math.round((d - startD) / 86400000);
    if (idx >= 0 && idx < days) {
      if (type === 'balance') buckets[idx] += (t.type === 'income' ? 1 : -1) * t.amount;
      else if (type === 'income' && t.type === 'income') buckets[idx] += t.amount;
      else if (type === 'expense' && t.type === 'expense') buckets[idx] += t.amount;
      else if (type === 'savings') buckets[idx] += (t.type === 'income' ? 1 : -1) * t.amount;
    }
  });
  if (type === 'balance' || type === 'savings') {
    for (let i = 1; i < buckets.length; i++) buckets[i] += buckets[i - 1];
  }
  return buckets;
}

function renderSparkline(values, color, mode = 'line') {
  const w = 100, h = 28, pad = 1;
  if (!values.length) return '';
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const xStep = (w - pad * 2) / (values.length - 1 || 1);
  const yFor = (v) => h - pad - ((v - min) / range) * (h - pad * 2);

  if (mode === 'bar') {
    const bw = xStep * 0.6;
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      ${values.map((v, i) => `<rect x="${pad + i * xStep - bw / 2}" y="${yFor(Math.max(0, v))}" width="${bw}" height="${Math.max(1, Math.abs(yFor(0) - yFor(v)))}" fill="${color}" rx="0.5"></rect>`).join('')}
    </svg>`;
  }
  // line + area
  const pts = values.map((v, i) => `${pad + i * xStep},${yFor(v)}`).join(' ');
  const area = `M ${pad},${yFor(0)} L ${pts.split(' ').join(' L ')} L ${pad + (values.length - 1) * xStep},${yFor(0)} Z`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${area}" fill="${color}" opacity="0.18"></path>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"></polyline>
  </svg>`;
}

// ---------- Animated counter ----------
function animateCount(el, target) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = formatVND(target);
    return;
  }
  const duration = 800;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const cur = from + (target - from) * eased;
    el.textContent = formatVND(cur);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = formatVND(target);
  }
  requestAnimationFrame(step);
}

function renderStats() {
  const { start, end, prevStart, prevEnd, label } = currentRange;
  const income = sumByPeriod(start, end, 'income');
  const expense = sumByPeriod(start, end, 'expense');
  const incomePrev = sumByPeriod(prevStart, prevEnd, 'income');
  const expensePrev = sumByPeriod(prevStart, prevEnd, 'expense');
  const totalBalance = state.data.wallets.reduce((s, w) => s + w.balance, 0);
  const savings = income - expense;
  const sl = shortLabel(label);
  const colors = getChartColors();

  const txCount = tx.filter(t => { const d = new Date(t.date); return d >= start && d < end; }).length;
  // Compute net-worth delta this period vs previous: roughly savings delta
  const savingsPrev = incomePrev - expensePrev;
  const netChange = formatChange(savings + totalBalance, savingsPrev + totalBalance);

  // -------- Hero card --------
  document.getElementById('hero-card').innerHTML = `
    <div class="hero-stat" style="--stagger:0ms">
      <div class="hero-stat-left">
        <div class="hero-stat-label"><i data-lucide="wallet"></i> Tổng tài sản · ${label}</div>
        <div class="hero-stat-value" data-target="${totalBalance}">${formatVND(0)}</div>
        <div class="hero-stat-badges">
          <span class="hero-badge ${netChange.dir}">
            <i data-lucide="${netChange.dir === 'up' ? 'trending-up' : netChange.dir === 'down' ? 'trending-down' : 'minus'}"></i>
            ${netChange.text} so với kỳ trước
          </span>
          <span class="hero-badge neutral"><i data-lucide="receipt"></i> ${txCount} giao dịch</span>
          <span class="hero-badge ${savings >= 0 ? 'positive' : 'negative'}"><i data-lucide="${savings >= 0 ? 'piggy-bank' : 'alert-triangle'}"></i> ${savings >= 0 ? 'Tiết kiệm' : 'Âm'} ${formatVND(Math.abs(savings))}</span>
        </div>
      </div>
      <div class="hero-stat-right">
        ${renderSparkline(buildSparklineData('balance'), colors.primary, 'line')}
      </div>
    </div>
  `;

  // -------- Mini cards --------
  const minis = [
    { label: `Thu ${sl}`,        value: income,  tone: 'success', icon: 'arrow-down-circle', change: formatChange(income, incomePrev),  sparkType: 'income',  sparkColor: colors.success },
    { label: `Chi ${sl}`,        value: expense, tone: 'danger',  icon: 'arrow-up-circle',   change: formatChange(expense, expensePrev), sparkType: 'expense', sparkColor: colors.danger  },
    { label: 'Tiết kiệm ròng',    value: savings, tone: 'warning', icon: 'piggy-bank',        change: null,                              sparkType: 'savings', sparkColor: '#F59E0B'      }
  ];
  document.getElementById('mini-cards').innerHTML = minis.map((s, i) => `
    <div class="mini-card" style="--stagger:${(i + 1) * 80}ms">
      <div class="mini-card-top">
        <div class="mini-label">${s.label}</div>
        <div class="mini-icon ${s.tone}"><i data-lucide="${s.icon}"></i></div>
      </div>
      <div class="mini-value" data-target="${s.value}">${formatVND(0)}</div>
      <div class="mini-spark">${renderSparkline(buildSparklineData(s.sparkType), s.sparkColor, 'bar')}</div>
      ${s.change ? `<div class="mini-change ${s.change.dir}">
          <i data-lucide="${s.change.dir === 'up' ? 'trending-up' : s.change.dir === 'down' ? 'trending-down' : 'minus'}"></i>
          <span>${s.change.text}</span>
        </div>` : '<div class="text-muted fs-xs">&nbsp;</div>'}
    </div>
  `).join('');

  // Animate counters
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    if (!isNaN(target)) animateCount(el, target);
  });

  const btnMonth = document.getElementById('btn-month');
  if (btnMonth) btnMonth.innerHTML = `<i data-lucide="calendar"></i><span>${label}</span>`;
  mountIcons();
}

renderStats();

// ---------- Period picker modal ----------
function openPeriodPicker() {
  const toInputDate = (d) => d.toISOString().slice(0, 10);
  const toInputMonth = (d) => d.toISOString().slice(0, 7);
  const body = `
    <div class="period-picker">
      <div class="form-label">Chọn nhanh</div>
      <div class="period-chips">
        <button type="button" class="chip" data-preset="month">Tháng này</button>
        <button type="button" class="chip" data-preset="lastMonth">Tháng trước</button>
        <button type="button" class="chip" data-preset="year">Năm nay</button>
        <button type="button" class="chip" data-preset="7d">7 ngày qua</button>
        <button type="button" class="chip" data-preset="30d">30 ngày qua</button>
        <button type="button" class="chip" data-preset="90d">90 ngày qua</button>
      </div>
      <div class="form-field" style="margin-top:var(--s-4);">
        <label class="form-label">Theo tháng cụ thể</label>
        <input class="input" type="month" id="pp-month" value="${toInputMonth(new Date())}" />
      </div>
      <div class="form-label" style="margin-top:var(--s-4);">Tùy chỉnh theo ngày</div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Từ ngày</label>
          <input class="input" type="date" id="pp-from" value="${toInputDate(currentRange.start)}" />
        </div>
        <div class="form-field">
          <label class="form-label">Đến ngày</label>
          <input class="input" type="date" id="pp-to" value="${toInputDate(currentRange.end)}" />
        </div>
      </div>
    </div>
  `;
  openModal({
    title: 'Chọn khoảng thời gian',
    body,
    actions: `
      <button class="btn btn-secondary" data-close>Hủy</button>
      <button class="btn btn-primary" id="pp-apply">Áp dụng</button>
    `
  });
  setTimeout(() => {
    document.querySelectorAll('.period-chips .chip').forEach(c => {
      c.addEventListener('click', () => {
        currentRange = presetRange(c.dataset.preset);
        document.querySelector('.modal-backdrop')?.remove();
        renderStats();
      });
    });
    document.getElementById('pp-month')?.addEventListener('change', (e) => {
      const [yy, mm] = e.target.value.split('-').map(Number);
      const s = new Date(yy, mm - 1, 1);
      const en = new Date(yy, mm, 1);
      const ps = new Date(yy, mm - 2, 1);
      currentRange = { start: s, end: en, prevStart: ps, prevEnd: s, label: `Tháng ${String(mm).padStart(2,'0')}/${yy}` };
    });
    document.getElementById('pp-apply')?.addEventListener('click', () => {
      const from = document.getElementById('pp-from').value;
      const to = document.getElementById('pp-to').value;
      const monthVal = document.getElementById('pp-month').value;
      // If user typed custom dates, prefer those
      if (from && to) {
        const s = new Date(from + 'T00:00:00');
        const en = new Date(to + 'T23:59:59');
        if (s > en) { return; }
        const days = Math.max(1, Math.round((en - s) / 86400000));
        const ps = new Date(s); ps.setDate(ps.getDate() - days);
        const pe = new Date(s);
        currentRange = { start: s, end: en, prevStart: ps, prevEnd: pe, label: `${from} → ${to}` };
      } else if (monthVal) {
        const [yy, mm] = monthVal.split('-').map(Number);
        const s = new Date(yy, mm - 1, 1);
        const en = new Date(yy, mm, 1);
        const ps = new Date(yy, mm - 2, 1);
        currentRange = { start: s, end: en, prevStart: ps, prevEnd: s, label: `Tháng ${String(mm).padStart(2,'0')}/${yy}` };
      }
      document.querySelector('.modal-backdrop')?.remove();
      renderStats();
    });
  }, 60);
}

const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
document.getElementById('btn-month')?.addEventListener('click', openPeriodPicker);

// ---------- Chart plugins ----------
const crosshairPlugin = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?._active;
    if (!active || !active.length) return;
    const { ctx, chartArea } = chart;
    const x = active[0].element.x;
    ctx.save();
    ctx.strokeStyle = getChartColors().textMuted || '#94A3B8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

const donutCenterPlugin = {
  id: 'donutCenter',
  beforeDraw(chart) {
    if (chart.config.type !== 'doughnut') return;
    const { ctx, chartArea } = chart;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    const total = chart.data.datasets[0].data.reduce((s, v) => s + v, 0);
    const active = chart.tooltip?._active?.[0];
    let topLabel = 'Tổng chi', valueText = formatVNDShort(total);
    if (active) {
      topLabel = chart.data.labels[active.index];
      const v = chart.data.datasets[0].data[active.index];
      const pct = total > 0 ? Math.round((v / total) * 100) : 0;
      valueText = `${formatVNDShort(v)} · ${pct}%`;
    }
    ctx.save();
    const colors = getChartColors();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.textMuted || '#94A3B8';
    ctx.font = '500 11px "Be Vietnam Pro", sans-serif';
    ctx.fillText(topLabel, cx, cy - 14);
    ctx.fillStyle = colors.text || '#0F172A';
    ctx.font = '700 22px "Be Vietnam Pro", sans-serif';
    ctx.fillText(valueText, cx, cy + 10);
    ctx.restore();
  }
};

// ---------- Trend line chart ----------
let trendChart;
function renderTrend(days = 30) {
  destroyAllCharts();
  trendChart = null;
  const canvas = document.getElementById('chart-trend');
  const ctx = canvas.getContext('2d');
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { income: 0, expense: 0 };
  }
  tx.forEach(t => {
    const key = t.date.slice(0, 10);
    if (buckets[key]) buckets[key][t.type] += t.amount;
  });
  const labels = Object.keys(buckets).map(k => formatDate(k, 'DD/MM'));
  const income = Object.values(buckets).map(b => b.income);
  const expense = Object.values(buckets).map(b => b.expense);
  const c = getChartColors();

  // Gradient fills
  const h = canvas.height;
  const incGrad = ctx.createLinearGradient(0, 0, 0, h);
  incGrad.addColorStop(0, c.success + '55');
  incGrad.addColorStop(1, c.success + '00');
  const expGrad = ctx.createLinearGradient(0, 0, 0, h);
  expGrad.addColorStop(0, c.danger + '55');
  expGrad.addColorStop(1, c.danger + '00');

  trendChart = createChart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Thu', data: income,  borderColor: c.success, backgroundColor: incGrad, tension: 0.35, fill: true, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: c.success, pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2 },
        { label: 'Chi', data: expense, borderColor: c.danger,  backgroundColor: expGrad, tension: 0.35, fill: true, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: c.danger,  pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true } },
        tooltip: {
          callbacks: { label: (ctx) => ctx.dataset.label + ': ' + formatVND(ctx.parsed.y) }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { callback: (v) => formatVNDShort(v) } }
      }
    },
    plugins: [crosshairPlugin]
  });
}
renderTrend(30);

document.querySelectorAll('#trend-range button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#trend-range button').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    renderTrend(parseInt(btn.dataset.range, 10));
  });
});

// ---------- Donut chart ----------
const expenseByCat = {};
tx.filter(t => t.type === 'expense' && new Date(t.date) >= startOfThisMonth).forEach(t => {
  expenseByCat[t.categoryId] = (expenseByCat[t.categoryId] || 0) + t.amount;
});
const donutCtx = document.getElementById('chart-donut').getContext('2d');
const labels = [], data = [], colors = [];
Object.entries(expenseByCat).forEach(([cid, amt]) => {
  const cat = getCategoryById(cid);
  if (!cat) return;
  labels.push(cat.name); data.push(amt); colors.push(cat.color);
});
if (data.length === 0) { labels.push('Chưa có chi tiêu'); data.push(1); colors.push(getChartColors().border); }

createChart(donutCtx, {
  type: 'doughnut',
  data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } },
      tooltip: { callbacks: { label: (ctx) => ctx.label + ': ' + formatVND(ctx.parsed) } }
    }
  },
  plugins: [donutCenterPlugin]
});

// ---------- Activity feed (mix transactions + achievements + warnings) ----------
function buildActivityFeed() {
  const items = [];
  const now = new Date();

  // Goal milestones — pick goals crossing 25/50/75/100% threshold
  state.data.goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
    const milestones = [100, 75, 50, 25];
    const passed = milestones.find(m => pct >= m);
    if (passed && passed >= 50) {
      const daysLeft = Math.ceil((new Date(g.deadline) - now) / 86400000);
      items.push({
        type: 'achievement',
        priority: passed === 100 ? 10 : passed === 75 ? 8 : 6,
        icon: g.icon || 'target',
        color: g.color,
        title: `Đạt <strong>${pct}%</strong> mục tiêu "${escapeHTML(g.name)}"`,
        meta: `Còn ${formatVND(Math.max(0, g.targetAmount - g.currentAmount))} · ${daysLeft > 0 ? `còn ${daysLeft} ngày` : 'đã quá hạn'}`,
        amount: null,
        date: now
      });
    }
  });

  // Budget warnings — usage > 75%
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  state.data.budgets.forEach(b => {
    const spent = tx.filter(t => t.type === 'expense' && t.categoryId === b.categoryId && new Date(t.date) >= monthStart)
                    .reduce((s, t) => s + t.amount, 0);
    const usage = b.limit > 0 ? spent / b.limit : 0;
    if (usage >= 0.75) {
      const cat = getCategoryById(b.categoryId);
      items.push({
        type: usage >= 1 ? 'danger' : 'warning',
        priority: usage >= 1 ? 9 : 7,
        icon: cat?.icon || 'alert-triangle',
        color: usage >= 1 ? '#DC2626' : '#F59E0B',
        title: usage >= 1
          ? `Ngân sách <strong>${escapeHTML(cat?.name || '')}</strong> đã vượt ${Math.round((usage - 1) * 100)}%`
          : `Ngân sách <strong>${escapeHTML(cat?.name || '')}</strong> đã dùng ${Math.round(usage * 100)}%`,
        meta: `${formatVND(spent)} / ${formatVND(b.limit)} tháng này`,
        amount: null,
        date: now
      });
    }
  });

  // Recent transactions — top 4
  const recentTx = [...tx].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  recentTx.forEach(t => {
    const cat = getCategoryById(t.categoryId);
    const w = getWalletById(t.walletId);
    items.push({
      type: 'transaction',
      priority: t.amount > 5000000 ? 5 : 3,
      icon: cat?.icon || 'circle',
      color: cat?.color || '#94A3B8',
      title: escapeHTML(t.note || cat?.name || '—'),
      meta: `${escapeHTML(cat?.name || '')} · ${escapeHTML(w?.name || '')} · ${formatDate(t.date)}`,
      amount: { value: t.amount, type: t.type },
      date: new Date(t.date)
    });
  });

  // Balanced mix: max 2 achievements, max 2 warnings, fill rest with transactions
  const achievements = items.filter(i => i.type === 'achievement').sort((a, b) => b.priority - a.priority).slice(0, 2);
  const warnings = items.filter(i => i.type === 'warning' || i.type === 'danger').sort((a, b) => b.priority - a.priority).slice(0, 2);
  const txItems = items.filter(i => i.type === 'transaction').sort((a, b) => b.date - a.date).slice(0, 4);
  return [...achievements, ...warnings, ...txItems].slice(0, 6);
}

function renderActivityFeed() {
  const items = buildActivityFeed();
  const html = items.map((it, i) => `
    <div class="feed-item feed-${it.type}" style="--stagger:${i * 60}ms">
      <div class="feed-icon" style="background:${it.color}22;color:${it.color}">
        <i data-lucide="${it.icon}"></i>
      </div>
      <div class="feed-body">
        <div class="feed-title">${it.title}</div>
        <div class="feed-meta">${it.meta}</div>
      </div>
      ${it.amount ? `<div class="feed-amount ${it.amount.type}">${formatSigned(it.amount.value, it.amount.type)}</div>` : ''}
    </div>
  `).join('');
  document.getElementById('activity-feed').innerHTML = html;
  mountIcons();
}
renderActivityFeed();

// ---------- Top goals ----------
const topGoals = [...state.data.goals]
  .map(g => ({ ...g, pct: g.currentAmount / g.targetAmount }))
  .sort((a, b) => b.pct - a.pct).slice(0, 3);

document.getElementById('top-goals').innerHTML = topGoals.map(g => {
  const pct = Math.min(100, Math.round(g.pct * 100));
  return `
    <div class="goal-card">
      <div class="goal-head">
        <div class="goal-icon" style="background:${g.color}22;color:${g.color}"><i data-lucide="${g.icon}"></i></div>
        <div class="goal-name">${escapeHTML(g.name)}</div>
        <div class="goal-percent">${pct}%</div>
      </div>
      <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${g.color}"></div></div>
      <div class="goal-amounts">${formatVND(g.currentAmount)} / ${formatVND(g.targetAmount)}</div>
    </div>
  `;
}).join('');

mountIcons();
