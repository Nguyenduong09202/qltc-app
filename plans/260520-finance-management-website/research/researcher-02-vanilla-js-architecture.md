# Vanilla JS Architecture & Chart.js for Vietnamese Finance Website

## 1. ES6 Module Organization (Multi-Page State Management)

**Pattern: Module + localStorage sync**
```javascript
// store.js - single source of truth
export const store = {
  user: null,
  transactions: [],
  
  load() {
    const saved = localStorage.getItem('appState');
    if (saved) {
      const state = JSON.parse(saved);
      Object.assign(this, state);
    }
  },
  
  save() {
    localStorage.setItem('appState', JSON.stringify({
      user: this.user,
      transactions: this.transactions
    }));
  }
};

// Each page (dashboard.html) imports and uses:
import { store } from './modules/store.js';
store.load();
renderDashboard(store.transactions);
```

**Cross-page sync:** Use `storage` event listener for multi-tab updates:
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === 'appState') store.load();
});
```

**File structure:**
```
/js/
  modules/
    api.js         // fetch wrappers
    store.js       // state + localStorage
    ui.js          // DOM helpers
    charts.js      // Chart.js wrappers
    validators.js  // form validation
  pages/
    login.js       // page-specific logic
    dashboard.js
    transactions.js
```

**localStorage schema versioning:**
```javascript
const STORAGE_VERSION = 1;
function save() {
  localStorage.setItem('appState', JSON.stringify({
    version: STORAGE_VERSION,
    data: store
  }));
}
// On load, check version and migrate if needed
```

---

## 2. Chart.js v4 + CSS Variables

**CDN:** `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0"></script>`

**Dark mode theming (no build tools needed):**
```javascript
// charts.js
function getChartColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    text: cs.getPropertyValue('--color-text').trim(),
    border: cs.getPropertyValue('--color-border').trim(),
    primary: cs.getPropertyValue('--color-primary').trim(),
  };
}

const ctx = document.getElementById('incomeChart').getContext('2d');
const colors = getChartColors();

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Income',
      data: [1000, 1200, 1500],
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: colors.text } }
    },
    scales: {
      y: { ticks: { color: colors.text } }
    }
  }
});
```

**CSS in root (avoid FOUC):**
```css
:root {
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  --color-primary: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f3f4f6;
    --color-border: #374151;
    --color-primary: #60a5fa;
  }
}
```

**Doughnut (spending by category):** Same pattern, type: 'doughnut'
**Bar chart (monthly comparison):** type: 'bar'
**Responsive:** Set `responsive: true` + container with `position: relative; height: 300px`

---

## 3. Day.js + Vietnamese Locale

**CDN:** `<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10"></script>`
**Locale:** `<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/vi.js"></script>`

```javascript
dayjs.locale('vi');
dayjs().format('DD MMMM YYYY');  // "20 tháng 5 2026"
dayjs().fromNow();                 // "vài giây trước"
```

**Vietnamese date format:** DD/MM/YYYY (3/12/2014 = Dec 3)

---

## 4. Reusable Component Patterns

**Template literals + insertAdjacentHTML (no virtualDOM):**
```javascript
function renderTransactionRow(tx) {
  const html = `
    <tr data-id="${tx.id}">
      <td>${dayjs(tx.date).format('DD/MM')}</td>
      <td>${tx.category}</td>
      <td class="${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}">
        ${tx.amount.toLocaleString('vi-VN')}₫
      </td>
    </tr>
  `;
  document.getElementById('transTable').insertAdjacentHTML('beforeend', html);
}
```

**Event delegation for dynamic rows:**
```javascript
document.getElementById('transTable').addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (row) handleRowClick(row.dataset.id);
});
```

**Custom elements vs functions:** Skip custom elements for simplicity; use functions + plain objects. Reduces complexity and memory overhead.

**Modal a11y pattern:**
```javascript
function showModal(content) {
  const modal = document.createElement('div');
  modal.role = 'dialog';
  modal.ariaModal = true;
  modal.innerHTML = content + '<button class="btn-close">Đóng</button>';
  
  const firstBtn = modal.querySelector('button');
  const lastBtn = modal.querySelector('.btn-close');
  
  // Focus trap
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal(modal);
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstBtn) {
        e.preventDefault();
        lastBtn.focus();
      } else if (!e.shiftKey && document.activeElement === lastBtn) {
        e.preventDefault();
        firstBtn.focus();
      }
    }
  });
  
  document.body.appendChild(modal);
  firstBtn.focus();
}
```

---

## 5. Form Validation + Toast Notifications

**Simple validation:**
```javascript
function validateAmount(val) {
  const num = parseFloat(val);
  return !isNaN(num) && num > 0;
}
```

**Toast queue (auto-dismiss after 3s):**
```javascript
const toastQueue = [];
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  toastQueue.push(toast);
  
  setTimeout(() => {
    toast.remove();
    toastQueue.splice(toastQueue.indexOf(toast), 1);
  }, 3000);
}
```

---

## 6. Table Pagination + Sort/Filter (100-1000 rows)

**Pagination helper:**
```javascript
function paginate(arr, page, size) {
  return arr.slice((page - 1) * size, page * size);
}

// On filter/sort, reset to page 1
function applyFilter(query) {
  filtered = store.transactions.filter(t => 
    t.category.toLowerCase().includes(query)
  );
  currentPage = 1;
  render();
}
```

**Sort by column:**
```javascript
function sortBy(col, direction = 'asc') {
  store.transactions.sort((a, b) => {
    const diff = a[col] > b[col] ? 1 : -1;
    return direction === 'asc' ? diff : -diff;
  });
}
```

---

## 7. Icon Library: Lucide vs Feather

| Feature | Lucide | Feather |
|---------|--------|---------|
| CDN | cdn.jsdelivr.net/npm/lucide@0.378.0 | cdn.jsdelivr.net/npm/feather-icons@4.29.0 |
| Replace API | `lucide.replace()` (auto) | Manual: `feather.replace()` |
| Icons | 1000+ | 286 |
| Performance | Lighter SVG payload | Minimal |

**Recommendation:** Lucide for finance (more icons). Use CDN: `<script src="https://cdn.jsdelivr.net/npm/lucide@latest"></script>` then:
```html
<i data-lucide="trending-up"></i>
<i data-lucide="wallet"></i>
```

VN-friendly coverage: Both have adequate icons (wallet, trending, calendar, etc.).

---

## 8. Dev Workflow (No Build Tools)

**Live Server approach:**
```bash
python -m http.server 8000  # Python built-in
# Then http://localhost:8000/index.html
```

**FOUC prevention:** Put theme script in `<head>`:
```html
<script>
  const dark = localStorage.getItem('theme') === 'dark' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
</script>
```

**localStorage limits:** ~5-10MB per domain; for 1000 transactions (~1KB each) = safe.

---

## Summary

**Go-live checklist:**
1. Module structure: `store.js` + `api.js` + page-specific JS ✓
2. localStorage + version tracking ✓
3. Chart.js v4 via CDN, read CSS vars with `getComputedStyle()` ✓
4. Day.js + vi locale for dates ✓
5. Component pattern: template literals + insertAdjacentHTML ✓
6. Modal focus trap + ESC close ✓
7. Toast queue + form validation ✓
8. Table pagination + sort ✓
9. Lucide icons via CDN ✓
10. Python http.server for dev, FOUC prevention in `<head>` ✓

---

## Unresolved Questions

1. **Day.js Vietnamese locale availability:** Confirm via [Day.js GitHub](https://github.com/iamkun/dayjs/) that vi locale exists; if not, use custom translations.
2. **localStorage quota on mobile:** Test actual 5MB limit on target devices (iOS Safari may have stricter limits).
3. **Chart.js color animation:** When theme toggles mid-view, does Chart.js auto-re-render with new CSS vars, or require manual `chart.update()`?
4. **Relative time format:** Day.js `fromNow()` Vietnamese output accuracy ("2 ngày trước" vs other variants).

---

**Sources:**
- [GoMakeThings: Persisting state across views](https://gomakethings.com/persisting-state-across-views-in-a-multi-page-app-with-vanilla-js/)
- [CSS-Tricks: State management in vanilla JS](https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/)
- [Day.js Locale Docs](https://day.js.org/docs/en/i18n/changing-locale)
- [Chart.js v4 Documentation](https://www.chartjs.org/docs/latest/)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Lucide Icons CDN](https://lucide.dev/)
