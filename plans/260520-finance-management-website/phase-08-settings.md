# Phase 08 — Settings

## Context
- Overview: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-foundation-design-system.md)

## Overview
- **Date:** 2026-05-20
- **Description:** User preferences, theme, profile (UI-only), category management, data export/import/reset.
- **Priority:** P2
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Theme + language are the main toggles; rest are utility
- "Reset data" must be confirmed twice (destructive)
- Export = download JSON snapshot of localStorage state

## Requirements
**Functional**

Sections (tabs or stacked sections):
1. **Hồ sơ:** name, email (read-only or editable), avatar URL
2. **Giao diện:** theme radio (Sáng / Tối / Theo hệ thống), language (vi locked v1)
3. **Danh mục:** list of categories with add/edit/delete (icon picker via Lucide, color picker)
4. **Dữ liệu:**
   - Xuất dữ liệu (.json file download)
   - Nhập dữ liệu (file upload → validate version → replace state)
   - Đặt lại dữ liệu mẫu (reset to seed data — confirm twice)
   - Xóa toàn bộ dữ liệu (wipe localStorage — confirm twice)
5. **Giới thiệu:** version, links, "Đăng xuất"

**Non-functional**
- Changes persist immediately (no save button per section, except destructive)
- Theme change instant

## Architecture

### Export
```js
function exportData() {
  const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `qlct-backup-${dayjs().format('YYYYMMDD')}.json`;
  a.click(); URL.revokeObjectURL(url);
}
```

### Import
```js
function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const data = JSON.parse(e.target.result);
    if (data.version !== STORAGE_VERSION) throw 'Version mismatch';
    store.replace(data); showToast('Nhập thành công','success');
  };
  reader.readAsText(file);
}
```

### Category Management
- Add: name, icon (Lucide name search), color picker, type (income/expense)
- Edit: same fields
- Delete: block if any tx uses it (suggest reassign first) OR require user to reassign

## Related Code Files

**Create**
- `f:/App-Quan-Ly/settings.html`
- `f:/App-Quan-Ly/css/pages/settings.css`
- `f:/App-Quan-Ly/js/pages/settings.js`

**Modify**
- `f:/App-Quan-Ly/js/modules/store.js` — `addCategory`, `updateCategory`, `deleteCategory`, `replace(state)`, `resetToSeed()`, `wipe()`
- `f:/App-Quan-Ly/js/modules/theme.js` — support 'system' mode (listen `prefers-color-scheme`)

## Implementation Steps
1. `settings.html` scaffold with tab nav or stacked sections.
2. `settings.css` form rows, radio groups, list styles, destructive button red variant.
3. `settings.js`:
   - Profile form (bound to `store.state.auth.user`)
   - Theme radio: 3 options, calls `theme.setTheme()`
   - Categories list with CRUD
   - Export → download JSON
   - Import → file input → parse → replace
   - Reset seed → double confirm → re-seed
   - Wipe → double confirm → `localStorage.clear()` + reload
   - Logout → set `auth.isLoggedIn=false` + redirect `/login.html`
4. Update `theme.js` for system mode tracking.
5. Update `store.js` with category CRUD + data ops.

## Todo List
- [ ] `settings.html` scaffold
- [ ] `settings.css` sections
- [ ] Profile form binds to store
- [ ] Theme radio works (3 modes)
- [ ] Category CRUD with icon + color
- [ ] Export downloads JSON file
- [ ] Import validates + replaces state
- [ ] Reset to seed (double confirm)
- [ ] Wipe data (double confirm)
- [ ] Logout redirects to login

## Success Criteria
- Change theme to "Tối" → instant + persists on reload
- Add category "Học tập" → appears in transactions modal
- Export → JSON file with full state
- Import same file back → no data loss
- Reset seed → original mock data restored
- Logout → redirected to login page, sidebar hidden

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Malformed import crashes app | Try/catch + version check + toast error |
| Category delete breaks transactions | Block if in use; show count |
| Wipe accidental | Double confirm with typed phrase "XÓA" |

## Security Considerations
- Import file size limit (1MB)
- Validate imported JSON shape before replace
- Strip script tags from any string fields on import

## Next Steps
- Phase 11 polish may add keyboard shortcuts
