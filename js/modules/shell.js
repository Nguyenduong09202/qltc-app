// shell.js — sidebar + topbar render, theme toggle, mobile drawer

import { getState, setAuth } from './store.js';
import { toggleTheme, getTheme } from './theme.js';
import { mountIcons } from './icons.js';
import { escapeHTML } from './format.js';
import { registerServiceWorker, initInstallPrompt, initOfflineBadge, promptInstall, canInstall } from './pwa.js';
import { t, applyLang, mountLangSwitch } from './i18n.js';

const NAV = [
  { key: 'dashboard',    i18n: 'app.nav.dashboard',    icon: 'layout-dashboard', href: 'dashboard.html' },
  { key: 'transactions', i18n: 'app.nav.transactions', icon: 'arrow-left-right', href: 'transactions.html' },
  { key: 'budgets',      i18n: 'app.nav.budgets',      icon: 'wallet-cards',     href: 'budgets.html' },
  { key: 'goals',        i18n: 'app.nav.goals',        icon: 'target',           href: 'goals.html' },
  { key: 'reports',      i18n: 'app.nav.reports',      icon: 'bar-chart-3',      href: 'reports.html' },
  { key: 'accounts',     i18n: 'app.nav.accounts',     icon: 'landmark',         href: 'accounts.html' },
  { key: 'splits',       i18n: 'app.nav.splits',       icon: 'users',            href: 'splits.html' },
  { key: 'settings',     i18n: 'app.nav.settings',     icon: 'settings',         href: 'settings.html' }
];

// Map active page → i18n key for topbar title, so it auto-updates on lang change
const PAGE_TITLE_KEY = {
  dashboard: 'app.nav.dashboard',
  transactions: 'app.nav.transactions',
  budgets: 'app.nav.budgets',
  goals: 'app.nav.goals',
  reports: 'app.nav.reports',
  accounts: 'acc.title',
  splits: 'split.title',
  settings: 'set.title'
};

export function renderShell({ activePage, title, subtitle = '' }) {
  const state = getState();
  const user = state.auth?.user || { name: 'Khách', email: '', avatar: 'K' };
  const themeIcon = getTheme() === 'dark' ? 'sun' : 'moon';

  const body = document.body;
  // Build sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';
  sidebar.innerHTML = `
    <a href="dashboard.html" class="sidebar-brand">
      <img class="brand-full" src="assets/images/brand.png" alt="QLTC" onload="this.parentElement.classList.add('has-brand-full')" onerror="this.remove()" />
      <span class="brand-mark">₫</span>
      <span class="brand-text">QLTC</span>
    </a>
    <nav class="sidebar-nav">
      ${NAV.map(n => `
        <a href="${n.href}" class="sidebar-link ${n.key === activePage ? 'is-active' : ''}">
          <i data-lucide="${n.icon}"></i>
          <span data-i18n="${n.i18n}">${t(n.i18n)}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div>Quản lý Tài chính</div>
      <div>v1.0 — Demo UI</div>
    </div>
  `;

  // Backdrop for mobile
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.id = 'sidebar-backdrop';

  // Topbar
  const topbar = document.createElement('header');
  topbar.className = 'app-topbar';
  topbar.id = 'app-topbar';
  topbar.innerHTML = `
    <button class="icon-btn hamburger" id="hamburger" aria-label="Mở menu"><i data-lucide="menu"></i></button>
    <div>
      <div class="topbar-title" id="topbar-title"${PAGE_TITLE_KEY[activePage] ? ` data-i18n="${PAGE_TITLE_KEY[activePage]}"` : ''}>${escapeHTML(title || '')}</div>
      ${subtitle ? `<div class="text-muted fs-xs">${escapeHTML(subtitle)}</div>` : ''}
    </div>
    <div class="topbar-search">
      <i data-lucide="search"></i>
      <input id="topbar-search" type="search" placeholder="${t('app.topbar.search')}" aria-label="${t('app.topbar.search')}" data-i18n-attr="placeholder" data-i18n-key="app.topbar.search" />
    </div>
    <div class="topbar-actions">
      <div class="lang-switch lang-switch-topbar" id="topbar-lang-switch"></div>
      <button class="icon-btn" id="pwa-install-btn" aria-label="Cài đặt ứng dụng" title="Cài đặt ứng dụng" hidden><i data-lucide="download"></i></button>
      <button class="icon-btn" id="theme-toggle" aria-label="Đổi giao diện"><i data-lucide="${themeIcon}"></i></button>
      <button class="icon-btn" aria-label="Thông báo"><i data-lucide="bell"></i><span class="badge-dot"></span></button>
      <div class="dropdown" id="user-menu">
        <div class="user-avatar" id="user-avatar" title="${escapeHTML(user.email || user.name)}">${escapeHTML(user.avatar || (user.name || 'U').charAt(0).toUpperCase())}</div>
      </div>
    </div>
  `;

  const main = document.createElement('main');
  main.className = 'app-main';
  main.id = 'app-main';

  // Move existing body children into main
  const existing = Array.from(body.children).filter(c => c.tagName !== 'SCRIPT');
  existing.forEach(c => main.appendChild(c));

  const wrap = document.createElement('div');
  wrap.className = 'app';
  wrap.appendChild(sidebar);
  wrap.appendChild(topbar);
  wrap.appendChild(main);
  body.insertBefore(wrap, body.firstChild);
  body.appendChild(backdrop);

  mountIcons();
  bindShellEvents();

  // Mount language switcher in topbar then apply current language to all tagged elements
  mountLangSwitch(document.getElementById('topbar-lang-switch'));
  applyLang();

  registerServiceWorker();
  initInstallPrompt();
  initOfflineBadge();
}

function bindShellEvents() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const hamburger = document.getElementById('hamburger');
  const themeBtn = document.getElementById('theme-toggle');
  const avatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const topbarSearch = document.getElementById('topbar-search');

  if (topbarSearch) {
    const localSearch = document.getElementById('f-search');
    if (localSearch) {
      topbarSearch.addEventListener('input', (e) => {
        localSearch.value = e.target.value;
        localSearch.dispatchEvent(new Event('input', { bubbles: true }));
      });
    } else {
      topbarSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = topbarSearch.value.trim();
          window.location.href = 'transactions.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        }
      });
    }
  }

  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
    backdrop.classList.toggle('is-open');
  });
  backdrop?.addEventListener('click', () => {
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('is-open');
  });

  const installBtn = document.getElementById('pwa-install-btn');
  installBtn?.addEventListener('click', async () => {
    const ok = await promptInstall();
    if (ok) installBtn.hidden = true;
  });
  if (canInstall() && installBtn) installBtn.hidden = false;

  themeBtn?.addEventListener('click', () => {
    toggleTheme();
    const icon = getTheme() === 'dark' ? 'sun' : 'moon';
    themeBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
    mountIcons();
  });

  avatar?.addEventListener('click', (e) => {
    e.stopPropagation();
    let menu = userMenu.querySelector('.dropdown-menu');
    if (menu) { menu.remove(); return; }
    menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.innerHTML = `
      <a href="settings.html" class="dropdown-item"><i data-lucide="user"></i>${t('app.menu.profile')}</a>
      <a href="settings.html" class="dropdown-item"><i data-lucide="settings"></i>${t('app.menu.settings')}</a>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" id="logout-btn"><i data-lucide="log-out"></i>${t('app.menu.logout')}</button>
    `;
    userMenu.appendChild(menu);
    mountIcons();
    menu.querySelector('#logout-btn').addEventListener('click', () => {
      setAuth({ ...getState().auth, isLoggedIn: false, user: null });
      window.location.href = 'login.html';
    });
    document.addEventListener('click', () => menu.remove(), { once: true });
  });
}
