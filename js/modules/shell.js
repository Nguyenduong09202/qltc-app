// shell.js — sidebar + topbar render, theme toggle, mobile drawer

import { getState, setAuth } from './store.js';
import { toggleTheme, getTheme } from './theme.js';
import { mountIcons } from './icons.js';
import { escapeHTML } from './format.js';

const NAV = [
  { key: 'dashboard',    label: 'Tổng quan',   icon: 'layout-dashboard', href: 'dashboard.html' },
  { key: 'transactions', label: 'Giao dịch',   icon: 'arrow-left-right', href: 'transactions.html' },
  { key: 'budgets',      label: 'Ngân sách',   icon: 'wallet-cards',     href: 'budgets.html' },
  { key: 'goals',        label: 'Mục tiêu',    icon: 'target',           href: 'goals.html' },
  { key: 'reports',      label: 'Báo cáo',     icon: 'bar-chart-3',      href: 'reports.html' },
  { key: 'accounts',     label: 'Ví & TK',     icon: 'landmark',         href: 'accounts.html' },
  { key: 'settings',     label: 'Cài đặt',     icon: 'settings',         href: 'settings.html' }
];

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
          <span>${n.label}</span>
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
      <div class="topbar-title">${escapeHTML(title || '')}</div>
      ${subtitle ? `<div class="text-muted fs-xs">${escapeHTML(subtitle)}</div>` : ''}
    </div>
    <div class="topbar-search">
      <i data-lucide="search"></i>
      <input id="topbar-search" type="search" placeholder="Tìm kiếm giao dịch, danh mục..." aria-label="Tìm kiếm" />
    </div>
    <div class="topbar-actions">
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
      <a href="settings.html" class="dropdown-item"><i data-lucide="user"></i>Hồ sơ</a>
      <a href="settings.html" class="dropdown-item"><i data-lucide="settings"></i>Cài đặt</a>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" id="logout-btn"><i data-lucide="log-out"></i>Đăng xuất</button>
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
