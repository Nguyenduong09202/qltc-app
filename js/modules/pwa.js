// pwa.js — service worker registration, install prompt, online/offline indicator

let deferredPrompt = null;

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((err) => {
      console.warn('[pwa] SW register failed', err);
    });
  });
}

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.hidden = true;
  });
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

export function canInstall() {
  return Boolean(deferredPrompt);
}

export function initOfflineBadge() {
  const update = () => {
    let badge = document.getElementById('offline-badge');
    if (!navigator.onLine) {
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'offline-badge';
        badge.className = 'offline-badge';
        badge.innerHTML = '<span class="dot"></span>Đang ngoại tuyến — dữ liệu vẫn được lưu cục bộ';
        document.body.appendChild(badge);
      }
      badge.classList.add('is-visible');
    } else if (badge) {
      badge.classList.remove('is-visible');
      setTimeout(() => badge.remove(), 300);
    }
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}
