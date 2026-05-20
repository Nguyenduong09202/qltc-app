# Fintech Personal Finance UI/UX Research (2024-2026)

## 1. Dashboard Design Patterns

**Card-Based Layouts** (2026 standard): Hero metric at top (total balance + daily performance), stat cards below in grid (2–3 cols), each encapsulating one metric with inline micro-graphs. Avoid static dashboards; include interactive date-range filters, real-time updates. Side panels group scheduled payments/alerts.

**Sidebar + Topbar Shell**: Collapsible sidebar on desktop (1280+), hamburger drawer on tablet (768–1279), full-screen drawer on mobile (375–767). Mobile-first media queries (min-width) for smaller payloads. Sidebar remains persistent on 1280+ unless toggled.

## 2. Data Visualization

**Chart Selection**:
- Line charts: income/expense trends over time
- Donut/pie: budget allocation (category splits)
- Bar charts: monthly comparisons, category spending

**Accessibility**: Color + shape (arrows, patterns, hatching) for colorblind users (~8% male, 0.5% female). WCAG 1.4.3: text 4.5:1 contrast minimum. Direct labels on charts improve readability for all users.

**Finance Color Coding**: Green (#16A34A per your palette) for income, Red (#DC2626) for expenses, Yellow for pending, Neutral-gray for transfers.

## 3. Dark Mode with CSS Variables

Leading fintech (Revolut, Monzo, MoMo) use CSS custom properties `--bg-primary`, `--text-primary`, `--border-color`, etc., toggled via `prefers-color-scheme` media query. Icon libraries (Lucide, Feather) use `currentColor` + SVG-level media queries for dark compatibility. Zero flash on theme switch when CSS vars control all colors.

**Implementation**: Define tokens in `:root` (light) and `:root[data-theme="dark"]` (dark). Charts (Chart.js) require manual color updates via JS listener.

## 4. Transaction List Patterns

Layout: date group header → list of items (icon + category + amount + timestamp). Amount right-aligned, icon 24px (Lucide/Feather), category color-coded. Pending state uses yellow icon overlay. Tap for modal detail. No pagination; load more on scroll.

**Icons**: category-specific (fork+knife for food, fuel pump for transport) vs. generic (chevron). Feather icons' consistent 24px @ 2px stroke work well at all breakpoints.

## 5. Vietnamese Locale

**Currency**: ₫ symbol right-aligned (e.g., "1.500.000 ₫" not "₫1.5M"). Thousand separator = dot (.) per Vietnamese standard. No ISO code suffix on main dashboard.

**Font**: Be Vietnam Pro (Google Fonts, open-source) handles Vietnamese diacritics precisely. Use Inter for English fallback. Weights: 400 regular, 600 headings.

**Date Format**: dd/MM/yyyy (e.g., "20/05/2026"). Day.js `.format('DD/MM/YYYY')` supports this natively.

## 6. Modal & Forms

"Add Transaction" form: single column, 300px max-width on mobile (fits 375 viewport). Field order: category → amount → date → note (optional). Inline validation (red text below field). Submit button disabled until amount > 0 + category selected. Close via X or Esc key.

## 7. Empty States & Skeletons

**Empty State**: illustration (SVG) + "No transactions yet" + CTA button (Add Transaction). Center-aligned, 200px height max.

**Skeleton**: gray pulse animation (CSS `@keyframes pulse`), card-shaped (match real card height), 3–4 rows. Fade out when real data arrives. Avoid skeleton spinners; cards build faster perception of readiness.

## 8. Breakpoint Strategy (Your 3 Points)

| Breakpoint | Pattern |
|-----------|---------|
| 1280+     | Persistent sidebar (220px), main content grid, 3-col card layouts |
| 768–1279  | Collapsible sidebar (hamburger toggle), 2-col card grids, modal-friendly |
| 375–767   | Full-width single column, drawer nav, 1-col cards, thumb-friendly buttons (48px min) |

Use `@media (max-width: 767px)`, `@media (min-width: 768px)`, `@media (min-width: 1280px)` in vanilla CSS.

---

## Source Citations

- [Fintech Design Guide 2026 - Eleken](https://www.eleken.co/blog-posts/modern-fintech-design-guide)
- [Fintech UX Best Practices 2026 - WildNetEdge](https://www.wildnetedge.com/blogs/fintech-ux-design-best-practices-for-financial-dashboards)
- [Color Theory in Finance Dashboards - Extej Agency](https://medium.com/@extej/the-role-of-color-theory-in-finance-dashboard-design-d2942aec9fff)
- [Accessible Chart Design - Smashing Magazine](https://www.smashingmagazine.com/2024/02/accessibility-standards-empower-better-chart-visual-design/)
- [Accessible Data Visualizations - A11Y Collective](https://www.a11y-collective.com/blog/accessible-charts/)
- [Be Vietnam Pro Font - Google Fonts](https://fonts.google.com/specimen/Be+Vietnam+Pro)
- [Vietnamese Locale Standards - Freeformatter](https://freeformatter.com/vietnam-standards-code-snippets.html)
- [Responsive Breakpoints 2026 - Framer](https://www.framer.com/blog/responsive-breakpoints/)
- [CSS Breakpoints Guide - Penpot](https://penpot.app/blog/how-to-use-css-and-media-query-breakpoints-to-create-responsive-layouts/)

---

## Unresolved Questions

- How to optimize Chart.js dark mode sync without jank (debounce theme listener)?
- Best practice for VND formatting with Day.js (custom locale or number formatter)?
- Should skeleton loaders use actual chart shapes or generic cards for consistency?
