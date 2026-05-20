# QLTC — Quản lý Tài chính Cá nhân

Website quản lý tài chính cá nhân — **frontend-only**, xây dựng bằng HTML5 + CSS3 + Vanilla JavaScript ES6 (không build tools, không backend).

> ⚠️ Đây là **demo UI**. Mọi dữ liệu lưu trong `localStorage` của trình duyệt. Phần đăng nhập là giả lập (không xác thực thật).

## ✨ Tính năng

- 🏠 **Landing page** — giới thiệu sản phẩm, hero, features, testimonials
- 🔐 **Auth** — đăng nhập / đăng ký (UI giả lập)
- 📊 **Dashboard** — tổng quan tài sản, thu/chi tháng, biểu đồ xu hướng & cơ cấu, giao dịch gần đây, mục tiêu nổi bật
- 💸 **Transactions** — bảng giao dịch với lọc theo loại / danh mục / ví / ngày, tìm kiếm, sắp xếp, phân trang, CRUD modal
- 🎯 **Budgets** — ngân sách theo danh mục với progress bar, cảnh báo vượt mức
- 🚀 **Goals** — mục tiêu tiết kiệm với % hoàn thành, nạp thêm tiền nhanh
- 💼 **Accounts/Wallets** — quản lý ví tiền mặt, ngân hàng, e-wallet
- 📈 **Reports** — biểu đồ thu/chi theo tháng/quý/năm, phân tích danh mục, top 5 chi tiêu
- ⚙️ **Settings** — hồ sơ, đổi giao diện sáng/tối, ngôn ngữ, đơn vị tiền, xuất/nhập/khôi phục dữ liệu

## 🎨 Thiết kế

- **Style:** Modern, minimal, fintech
- **Light & Dark mode** — chuyển mượt, lưu trong localStorage, không FOUC (pre-paint script)
- **Responsive** — 3 breakpoint: 1280 / 768 / 375
- **Font:** Be Vietnam Pro (Google Fonts) — tối ưu cho tiếng Việt
- **Palette:** Primary `#4F46E5`, Success `#16A34A`, Danger `#DC2626`
- **Spacing scale 4px**, radius 8px (input/button) / 12-16px (card)

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| HTML | HTML5 semantic |
| CSS | CSS Variables, Flexbox, Grid, `@media` queries |
| JS | ES6 modules (`<script type="module">`) |
| Charts | [Chart.js v4](https://www.chartjs.org/) (CDN) |
| Icons | [Lucide](https://lucide.dev/) (CDN) |
| Date | [Day.js](https://day.js.org/) + locale `vi` (CDN) |
| Storage | `localStorage` (schema versioned) |

## 📁 Cấu trúc dự án

```
finance-app/
├── index.html              ← Landing
├── login.html              ← Auth
├── signup.html
├── dashboard.html          ← Tổng quan
├── transactions.html       ← Giao dịch
├── budgets.html            ← Ngân sách
├── goals.html              ← Mục tiêu
├── reports.html            ← Báo cáo
├── accounts.html           ← Ví & TK
├── settings.html           ← Cài đặt
├── css/
│   ├── base.css            ← Tokens + reset + typography
│   ├── layout.css          ← Shell (sidebar, topbar, grid)
│   ├── components.css      ← Buttons, cards, table, modal, toast, forms
│   └── pages/*.css         ← Per-page styles
├── js/
│   ├── modules/
│   │   ├── storage.js      ← localStorage wrapper + versioning
│   │   ├── store.js        ← In-memory state + CRUD
│   │   ├── mockdata.js     ← Seed: 22 transactions, 9 categories, 3 wallets, 3 goals, 5 budgets
│   │   ├── format.js       ← formatVND, formatDate, formatPercent, escapeHTML
│   │   ├── theme.js        ← toggle + persist + event
│   │   ├── charts.js       ← Chart.js factory + theme color sync
│   │   ├── ui.js           ← toast, modal, confirm, empty state, skeleton
│   │   ├── shell.js        ← Render sidebar + topbar
│   │   ├── icons.js        ← Lucide mount wrapper
│   │   └── router.js       ← Auth guard
│   └── pages/*.js          ← Per-page logic
├── assets/                 ← icons, images, fonts (CDN)
├── plans/                  ← Tài liệu kế hoạch dự án
└── README.md
```

## 🚀 Cách chạy

Vì sử dụng ES6 modules, **không thể mở trực tiếp `file://` trong trình duyệt** (lỗi CORS). Cần chạy qua local server.

### ⚡ Cách 1 — Double-click 1 nốt nhạc (KHUYÊN DÙNG)

**Không cần cài Node.js trước!** Script sẽ tự tải Node.js portable lần đầu (~30MB, cần internet).

- **Windows:** double-click vào `start.bat`
- **Mac / Linux:** mở terminal, chạy `./start.sh` (lần đầu cần `chmod +x start.sh`)

**Lần đầu chạy:**
1. Script kiểm tra Node.js có sẵn trong hệ thống → nếu có, dùng luôn.
2. Nếu không, hỏi bạn có tải Node.js portable không → bấm `Y`.
3. Tự tải ZIP từ nodejs.org, giải nén vào thư mục `node-portable/` ngay trong project.
4. Khởi động server, tự mở trình duyệt.

**Lần sau chạy:** dùng luôn `node-portable/` đã có, **không cần internet**.

Nhấn `Ctrl+C` (hoặc đóng cửa sổ) để dừng server.

### Cách 2 — Tự gõ lệnh

```bash
cd App-Quan-Ly
node server.js
```

Mở: `http://localhost:8000`

### Cách 3 — VS Code Live Server (cho dev)

Cài extension **Live Server**, chuột phải vào `index.html` → "Open with Live Server". Có auto-reload khi sửa code.

### Cách 4 — Python (nếu không có Node)

```bash
python -m http.server 8000
```

## 📦 Copy sang máy khác

### Cách A — Máy đích CÓ internet
1. Copy **toàn bộ thư mục** sang máy đích (zip → giải nén).
2. Double-click `start.bat` (Windows) hoặc chạy `./start.sh` (Mac/Linux).
3. Lần đầu: script hỏi tải Node.js portable → bấm `Y` → đợi ~1 phút.
4. Trình duyệt tự mở `http://localhost:8000`. Xong.

### Cách B — Máy đích KHÔNG có internet (offline 100%)
1. Tại máy nguồn: chạy `start.bat` 1 lần để tải Node portable về `node-portable/`.
2. Zip toàn bộ thư mục (đã bao gồm `node-portable/`) → copy sang máy đích.
3. Giải nén, double-click `start.bat` → chạy ngay, không cần internet.

**Lưu ý:** Dữ liệu lưu trong `localStorage` của trình duyệt, không tự chuyển theo. Để mang dữ liệu: **Settings → Xuất JSON** ở máy cũ, **Nhập JSON** ở máy mới.

## 🔄 Luồng dùng thử

1. Mở `index.html` (landing).
2. Click **"Bắt đầu miễn phí"** → đăng ký (nhập gì cũng được, mật khẩu ≥ 6 ký tự).
3. Vào Dashboard — dữ liệu mock đã được seed sẵn (22 giao dịch, 3 ví, 3 mục tiêu, 5 ngân sách).
4. Khám phá các trang qua sidebar.
5. Thử toggle giao diện sáng/tối ở topbar (icon mặt trăng/mặt trời).
6. **Settings → Khôi phục mặc định** nếu muốn reset dữ liệu mock.

## 🧠 Quyết định kỹ thuật

- **Pre-paint theme:** script inline trong `<head>` đọc `localStorage` và set `data-theme` trước khi paint → không FOUC.
- **Chart.js sync với CSS variables:** đọc qua `getComputedStyle()`, lắng nghe `theme-changed` event để re-render.
- **State quản lý đơn giản:** `store.js` giữ object in-memory, commit về localStorage. Không Redux, không reactive framework.
- **Components không framework:** template literals + `insertAdjacentHTML` + `escapeHTML` cho user input.
- **Schema versioned:** `qlct.v1.state` → dễ migrate sau này.
- **Auth giả lập:** flag `isLoggedIn` trong localStorage, route guard nhẹ.

## 🌐 Tương thích

- ✅ Chrome 90+
- ✅ Firefox 90+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 Ghi chú

- Mọi text giao diện đều bằng tiếng Việt.
- Tiền tệ format: `1.500.000 ₫` (dấu chấm phân cách hàng nghìn, ký hiệu ₫ ở cuối).
- Ngày format: `DD/MM/YYYY`.
- Số liệu mock đa dạng để dashboard "có sức sống".

## 📄 License

Demo project — sử dụng tự do cho học tập và tham khảo.

---

**Made with ♥ in Vietnam · 2026**
