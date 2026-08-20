# RESPONSIVE DESIGN - AJA LOGISTICS

## Viewport Strategy
- **Mobile First**: Minimum touch target size 44x44px. Bottom navigation bar (`BottomNav.tsx`) for handheld customer viewports.
- **Desktop Grid**: Expanded persistent sidebar (`Sidebar.tsx`) for operations team and power users.
- **RTL / LTR**: Dynamic flex order and text alignment based on `dir="rtl"` or `dir="ltr"`.
