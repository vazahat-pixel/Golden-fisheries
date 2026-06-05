/** Apply DB-driven theme tokens to CSS variables (all panels). */
export function applySystemThemes(themes) {
  if (!themes || typeof document === 'undefined') return;
  const root = document.documentElement;

  const admin = themes.admin || {};
  if (admin.primary) {
    root.style.setProperty('--color-brand-olive', admin.primary);
    root.style.setProperty('--color-primary', admin.primary);
    root.style.setProperty('--color-accent', admin.primary);
    root.style.setProperty('--color-accent-olive', admin.primary);
  }
  if (admin.accent) {
    root.style.setProperty('--color-brand-yellow', admin.accent);
  }
  if (admin.pageBg) root.style.setProperty('--color-page-bg', admin.pageBg);
  if (admin.sidebarBg) root.style.setProperty('--color-sidebar-bg', admin.sidebarBg);
  if (admin.cardBorder) root.style.setProperty('--color-card-border', admin.cardBorder);

  const driver = themes.driver || {};
  if (driver.accent) root.style.setProperty('--fa-accent', driver.accent);
  if (driver.accentSoft) root.style.setProperty('--fa-accent-soft', driver.accentSoft);
  if (driver.background) root.style.setProperty('--fa-bg', driver.background);
  if (driver.surface) root.style.setProperty('--fa-surface', driver.surface);

  const restaurant = themes.restaurant || {};
  if (restaurant.primary) root.style.setProperty('--rest-primary', restaurant.primary);
  if (restaurant.accent) root.style.setProperty('--rest-accent', restaurant.accent);
  if (restaurant.pageBg) root.style.setProperty('--rest-page-bg', restaurant.pageBg);

  const fishmall = themes.fishmall || {};
  if (fishmall.primary) root.style.setProperty('--fm-primary', fishmall.primary);
  if (fishmall.accent) root.style.setProperty('--fm-accent', fishmall.accent);
  if (fishmall.pageBg) root.style.setProperty('--fm-page-bg', fishmall.pageBg);
}

export function applyBrandingToDocument(branding) {
  if (!branding?.companyName) return;
  document.title = `${branding.companyName} — ERP`;
}
