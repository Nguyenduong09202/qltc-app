// charts.js — Chart.js factory + theme color sync

const registry = new Set();

export function getChartColors() {
  const css = getComputedStyle(document.documentElement);
  return {
    primary:   css.getPropertyValue('--color-primary').trim(),
    success:   css.getPropertyValue('--color-success').trim(),
    danger:    css.getPropertyValue('--color-danger').trim(),
    warning:   css.getPropertyValue('--color-warning').trim(),
    info:      css.getPropertyValue('--color-info').trim(),
    text:      css.getPropertyValue('--text-primary').trim(),
    textMuted: css.getPropertyValue('--text-secondary').trim(),
    border:    css.getPropertyValue('--border-default').trim(),
    bg:        css.getPropertyValue('--bg-surface').trim()
  };
}

export function createChart(ctx, config) {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return null;
  }
  applyThemeToConfig(config);
  const chart = new Chart(ctx, config);
  registry.add(chart);
  return chart;
}

function applyThemeToConfig(config) {
  const c = getChartColors();
  config.options = config.options || {};
  config.options.plugins = config.options.plugins || {};
  config.options.plugins.legend = config.options.plugins.legend || {};
  config.options.plugins.legend.labels = { color: c.textMuted, font: { family: 'Be Vietnam Pro, Inter, sans-serif' } };

  if (config.options.scales) {
    Object.values(config.options.scales).forEach(s => {
      s.ticks = { ...(s.ticks || {}), color: c.textMuted };
      s.grid = { ...(s.grid || {}), color: c.border };
    });
  }
}

// On theme change, recolor existing charts
window.addEventListener('theme-changed', () => {
  registry.forEach(chart => {
    try {
      applyThemeToConfig(chart.config);
      chart.update();
    } catch (e) { console.warn('chart recolor failed', e); }
  });
});

export function destroyAllCharts() {
  registry.forEach(c => { try { c.destroy(); } catch {} });
  registry.clear();
}
