// i18n.js — Language switcher for landing page (VI / EN / ZH-TW)

const KEY = 'lang';
const DEFAULT_LANG = 'vi';

export const LANGS = {
  vi: { label: 'VI', name: 'Tiếng Việt', htmlLang: 'vi' },
  en: { label: 'EN', name: 'English',    htmlLang: 'en' },
  zh: { label: '中', name: '繁體中文',   htmlLang: 'zh-Hant' }
};

// Currency conversion config keyed by currency code.
// rate = how many units of target currency per 1 VND.
// All amounts in HTML are stored in VND; we convert at display time.
const CURRENCY = {
  VND: { rate: 1,         symbol: '₫',   position: 'after',  spacer: ' ', locale: 'vi-VN' },
  USD: { rate: 1 / 25000, symbol: '$',   position: 'before', spacer: '',  locale: 'en-US' },
  TWD: { rate: 1 / 800,   symbol: 'NT$', position: 'before', spacer: '',  locale: 'zh-TW' }
};

// Default currency per language (used when no explicit currency preference is set)
const LANG_TO_CURRENCY = { vi: 'VND', en: 'USD', zh: 'TWD' };

const KEY_CURRENCY = 'currency';

export function getCurrency() {
  try {
    const stored = localStorage.getItem(KEY_CURRENCY);
    if (stored && CURRENCY[stored]) return stored;
  } catch {}
  return LANG_TO_CURRENCY[getLang()] || 'VND';
}

export function setCurrency(code) {
  if (!CURRENCY[code]) return;
  try { localStorage.setItem(KEY_CURRENCY, code); } catch {}
  applyLang();
  window.dispatchEvent(new CustomEvent('currency-changed', { detail: code }));
}

export function formatCurrency(vndAmount, currencyCode) {
  const c = CURRENCY[currencyCode] || CURRENCY[getCurrency()] || CURRENCY.VND;
  const value = vndAmount * c.rate;
  const rounded = Math.round(value);
  const formatted = rounded.toLocaleString(c.locale);
  return c.position === 'before'
    ? c.symbol + c.spacer + formatted
    : formatted + c.spacer + c.symbol;
}

// Get symbol of current (or specified) currency, for use in form labels.
export function getCurrencySymbol(currencyCode) {
  const c = CURRENCY[currencyCode || getCurrency()] || CURRENCY.VND;
  return c.symbol;
}

// Convert a value entered in the current (displayed) currency to base VND for storage.
export function toBaseVND(displayedAmount, currencyCode) {
  const c = CURRENCY[currencyCode || getCurrency()] || CURRENCY.VND;
  if (c.rate === 0) return 0;
  return displayedAmount / c.rate;
}

// Convert a stored VND amount to the displayed currency for showing in form inputs.
export function fromBaseVND(vndAmount, currencyCode) {
  const c = CURRENCY[currencyCode || getCurrency()] || CURRENCY.VND;
  return Math.round(vndAmount * c.rate);
}

const STRINGS = {
  // ============== NAV ==============
  'nav.features':       { vi: 'Tính năng',       en: 'Features',       zh: '功能' },
  'nav.how':            { vi: 'Cách hoạt động',  en: 'How it works',   zh: '使用方式' },
  'nav.testimonials':   { vi: 'Đánh giá',        en: 'Reviews',        zh: '評價' },
  'nav.team':           { vi: 'Đội ngũ',         en: 'Team',           zh: '團隊' },
  'nav.signin':         { vi: 'Đăng nhập',       en: 'Sign in',        zh: '登入' },
  'nav.signup':         { vi: 'Bắt đầu miễn phí',en: 'Get started',    zh: '免費開始' },

  // ============== HERO ==============
  'hero.badge':         { vi: '✨ Mới ra mắt',   en: '✨ Just launched',zh: '✨ 全新發布' },
  'hero.version':       { vi: 'Phiên bản 1.0',   en: 'Version 1.0',    zh: '1.0 版' },
  'hero.h1.line1':      { vi: 'Làm chủ tài chính cá nhân,', en: 'Master your finances,', zh: '掌握個人財務，' },
  'hero.h1.line2':      { vi: 'từng đồng một.',  en: 'one dong at a time.', zh: '一塊錢一塊錢累積' },
  'hero.lead':          { vi: 'QLTC giúp bạn theo dõi thu chi, lập ngân sách và đạt được mục tiêu tiết kiệm — tất cả trong một giao diện đẹp, gọn gàng và dễ dùng.', en: 'QLTC helps you track income and expenses, set budgets and reach savings goals — all in a beautiful, clean and easy-to-use interface.', zh: 'QLTC 幫您追蹤收支、編列預算並達成儲蓄目標 — 全部在一個美觀、簡潔、易用的介面中。' },
  'hero.cta.try':       { vi: 'Dùng thử miễn phí',en: 'Try for free',  zh: '免費試用' },
  'hero.cta.demo':      { vi: 'Xem demo',        en: 'Watch demo',     zh: '觀看演示' },
  'hero.trust':         { vi: 'người dùng đang quản lý tài chính tốt hơn', en: 'users managing their finances better', zh: '使用者正在更好地管理財務' },
  'hero.trust.over':    { vi: 'Hơn',             en: 'Over',           zh: '超過' },

  // ============== MOCK CARDS ==============
  'mock.assets':        { vi: 'Tổng tài sản',    en: 'Total assets',   zh: '總資產' },
  'mock.vs.lastmonth':  { vi: 'so với tháng trước', en: 'vs last month', zh: '較上月' },
  'mock.salary':        { vi: 'Lương tháng 5',   en: 'May salary',     zh: '5月薪資' },
  'mock.bank':          { vi: 'Vietcombank',     en: 'Vietcombank',    zh: 'Vietcombank' },
  'mock.lunch':         { vi: 'Bữa trưa',        en: 'Lunch',          zh: '午餐' },
  'mock.cash':          { vi: 'Tiền mặt',        en: 'Cash',           zh: '現金' },
  'mock.grab':          { vi: 'Grab',            en: 'Grab',           zh: 'Grab' },
  'mock.momo':          { vi: 'MoMo',            en: 'MoMo',           zh: 'MoMo' },
  'mock.emergency':     { vi: 'Quỹ khẩn cấp',    en: 'Emergency fund', zh: '緊急基金' },

  // ============== FEATURES ==============
  'features.h2':        { vi: 'Mọi thứ bạn cần để tài chính khỏe mạnh', en: 'Everything you need for healthy finances', zh: '健康財務所需的一切' },
  'features.lead':      { vi: 'Một bộ công cụ đầy đủ, thiết kế tối giản, tập trung vào điều quan trọng nhất.', en: 'A complete toolkit with minimal design, focused on what matters most.', zh: '完整的工具組合，極簡設計，專注於最重要的事情。' },
  'features.1.title':   { vi: 'Tổng quan trực quan', en: 'Visual overview',  zh: '直觀總覽' },
  'features.1.desc':    { vi: 'Xem toàn cảnh tài chính chỉ trong một liếc nhìn — số dư, thu chi, biểu đồ và xu hướng.', en: 'See the full picture at a glance — balance, income, expenses, charts and trends.', zh: '一眼掌握全貌 — 餘額、收支、圖表與趨勢。' },
  'features.2.title':   { vi: 'Ghi chép nhanh',  en: 'Quick logging',    zh: '快速記帳' },
  'features.2.desc':    { vi: 'Thêm giao dịch trong vài giây với danh mục có sẵn, ví linh hoạt và ghi chú thông minh.', en: 'Add transactions in seconds with preset categories, flexible wallets and smart notes.', zh: '幾秒內新增交易，預設類別、靈活錢包和智慧備註。' },
  'features.3.title':   { vi: 'Ngân sách thông minh',en: 'Smart budgets', zh: '智慧預算' },
  'features.3.desc':    { vi: 'Đặt giới hạn cho từng danh mục — chúng tôi cảnh báo khi bạn sắp vượt ngưỡng.', en: 'Set limits per category — we alert you when you are about to overshoot.', zh: '為各類別設定上限 — 即將超支時自動提醒。' },
  'features.4.title':   { vi: 'Mục tiêu tiết kiệm',en: 'Savings goals',  zh: '儲蓄目標' },
  'features.4.desc':    { vi: 'Đặt mục tiêu và theo dõi từng phần trăm tiến độ — từ quỹ khẩn cấp tới chuyến du lịch mơ ước.', en: 'Set goals and track every percentage of progress — from emergency funds to dream trips.', zh: '設定目標並追蹤每個百分比進度 — 從緊急基金到夢想旅行。' },
  'features.5.title':   { vi: 'Báo cáo sâu sắc', en: 'Deep insights',    zh: '深入報告' },
  'features.5.desc':    { vi: 'Phân tích xu hướng chi tiêu theo thời gian, danh mục và ví với biểu đồ tương tác.', en: 'Analyze spending trends by time, category and wallet with interactive charts.', zh: '透過互動式圖表，依時間、類別和錢包分析支出趨勢。' },
  'features.6.title':   { vi: 'Sáng & Tối',      en: 'Light & Dark',     zh: '明亮與深色' },
  'features.6.desc':    { vi: 'Giao diện đẹp mắt cả ngày lẫn đêm — chuyển đổi mượt mà, dễ chịu cho mắt.', en: 'Beautiful interface day and night — smooth switching, easy on the eyes.', zh: '日夜皆美的介面 — 順暢切換，對眼睛友善。' },

  // ============== HOW IT WORKS ==============
  'how.h2':             { vi: 'Từ "không biết tiền đi đâu" đến "kiểm soát mọi đồng"', en: 'From "where did my money go" to "control every dollar"', zh: '從「錢都花到哪裡了」到「掌控每一分錢」' },
  'how.lead':           { vi: 'Hướng dẫn 5 phút — sau đó app sẽ tự làm phần nặng: tổng hợp, cảnh báo và nhắc bạn điều chỉnh.', en: '5-minute setup — then the app does the heavy lifting: aggregation, alerts and reminders.', zh: '5 分鐘設定 — 之後 App 自動處理繁重工作：彙整、警示與提醒調整。' },

  'how.1.time':         { vi: '30 giây',         en: '30 seconds',     zh: '30 秒' },
  'how.1.title':        { vi: 'Tạo tài khoản và thiết lập ban đầu', en: 'Create account and initial setup', zh: '建立帳號與初始設定' },
  'how.1.body':         { vi: 'Bấm <strong>Đăng ký</strong>, nhập tên, email và mật khẩu. QLTC tạo sẵn Tiền mặt, Ngân hàng, Ví điện tử để bạn bắt đầu ngay.', en: 'Click <strong>Sign up</strong>, enter name, email and password. QLTC pre-creates Cash, Bank, E-wallet so you can start instantly.', zh: '點擊<strong>註冊</strong>，輸入姓名、電子郵件和密碼。QLTC 已預先建立現金、銀行、電子錢包供您立即開始。' },
  'how.1.li1':          { vi: 'Vào Cài đặt để chọn VND, USD hoặc EUR.', en: 'Go to Settings to choose VND, USD or EUR.', zh: '進入設定選擇 VND、USD 或 EUR。' },
  'how.1.li2':          { vi: 'Bật chế độ Tối nếu bạn thường ghi chép vào buổi tối.', en: 'Enable Dark mode if you usually log at night.', zh: '若常於夜間記帳，請開啟深色模式。' },
  'how.1.li3':          { vi: 'Trang liên quan:', en: 'Related pages:', zh: '相關頁面：' },

  'how.2.time':         { vi: '1 phút',          en: '1 minute',       zh: '1 分鐘' },
  'how.2.title':        { vi: 'Thêm tài khoản và số dư đầu kỳ', en: 'Add accounts and opening balances', zh: '新增帳戶和期初餘額' },
  'how.2.body':         { vi: 'Vào <a href="accounts.html">Tài khoản</a>, bấm <strong>+ Thêm tài khoản</strong>, nhập tên ví hoặc ngân hàng bạn đang dùng thật.', en: 'Go to <a href="accounts.html">Accounts</a>, click <strong>+ Add account</strong>, enter the wallet or bank name you actually use.', zh: '前往<a href="accounts.html">帳戶</a>，點擊<strong>+ 新增帳戶</strong>，輸入您實際使用的錢包或銀行名稱。' },
  'how.2.li1':          { vi: 'Ví dụ: Vietcombank, Tiền mặt, MoMo, thẻ tín dụng.', en: 'E.g., Vietcombank, Cash, MoMo, credit card.', zh: '例如：Vietcombank、現金、MoMo、信用卡。' },
  'how.2.li2':          { vi: 'Nhập số dư hiện tại sau khi kiểm tra ví và app ngân hàng.', en: 'Enter current balance after checking wallet and banking app.', zh: '檢查錢包與銀行 App 後輸入目前餘額。' },
  'how.2.li3':          { vi: 'Số dư đầu kỳ đúng thì báo cáo phía sau mới đáng tin.', en: 'Correct opening balance makes later reports trustworthy.', zh: '正確的期初餘額讓後續報告值得信賴。' },

  'how.3.time':         { vi: '10 giây/giao dịch', en: '10s per transaction', zh: '每筆 10 秒' },
  'how.3.title':        { vi: 'Ghi giao dịch hàng ngày', en: 'Log daily transactions', zh: '記錄每日交易' },
  'how.3.body':         { vi: 'Mở <a href="transactions.html">Giao dịch</a>, chọn Thu, Chi hoặc Chuyển khoản, nhập số tiền, danh mục, tài khoản và ghi chú nếu cần.', en: 'Open <a href="transactions.html">Transactions</a>, choose Income, Expense or Transfer, enter amount, category, account and note.', zh: '打開<a href="transactions.html">交易</a>，選擇收入、支出或轉帳，輸入金額、類別、帳戶和備註。' },
  'how.3.li1':          { vi: 'Ghi ngay khi vừa tiêu, đừng để dồn cuối ngày.', en: 'Log right after spending, not at end of day.', zh: '消費後立即記帳，勿累積到一天結束。' },
  'how.3.li2':          { vi: 'Dùng ghi chú cho khoản dễ quên như gửi xe, cà phê, tiền lớp.', en: 'Use notes for easily forgotten items like parking, coffee, class fees.', zh: '為容易忘記的項目使用備註，如停車、咖啡、上課費。' },
  'how.3.li3':          { vi: 'Thói quen nhỏ này quyết định chất lượng toàn bộ dữ liệu.', en: 'This small habit determines overall data quality.', zh: '這個小習慣決定整體資料品質。' },

  'how.4.time':         { vi: '2 phút',          en: '2 minutes',      zh: '2 分鐘' },
  'how.4.title':        { vi: 'Đặt ngân sách và mục tiêu', en: 'Set budgets and goals', zh: '設定預算和目標' },
  'how.4.body':         { vi: 'Ở <a href="budgets.html">Ngân sách</a>, đặt trần chi theo danh mục. Ở <a href="goals.html">Mục tiêu</a>, nhập số tiền cần tiết kiệm và hạn hoàn thành.', en: 'In <a href="budgets.html">Budgets</a>, set spending caps by category. In <a href="goals.html">Goals</a>, enter target amount and deadline.', zh: '在<a href="budgets.html">預算</a>中按類別設定支出上限。在<a href="goals.html">目標</a>中輸入儲蓄金額與截止日期。' },
  'how.4.li1':          { vi: 'Ví dụ: Ăn uống 3.000.000đ/tháng, MacBook 25.000.000đ trước 12/2026.', en: 'E.g., Food 3,000,000đ/month, MacBook 25,000,000đ before Dec 2026.', zh: '例如：餐飲 3,000,000đ/月，MacBook 25,000,000đ 2026 年 12 月前。' },
  'how.4.li2':          { vi: 'App cảnh báo khi gần chạm trần ngân sách.', en: 'App alerts when nearing budget cap.', zh: '接近預算上限時 App 會警告。' },
  'how.4.li3':          { vi: 'Dùng quy tắc 50/30/20 làm điểm khởi đầu.', en: 'Use the 50/30/20 rule as a starting point.', zh: '以 50/30/20 法則作為起點。' },

  'how.5.time':         { vi: 'Cuối tuần hoặc cuối tháng', en: 'Weekly or monthly', zh: '週末或月底' },
  'how.5.title':        { vi: 'Đọc báo cáo và điều chỉnh', en: 'Read reports and adjust', zh: '閱讀報告並調整' },
  'how.5.body':         { vi: 'Vào <a href="reports.html">Báo cáo</a> để xem thu-chi theo tháng, chi theo danh mục và tiến độ mục tiêu.', en: 'Visit <a href="reports.html">Reports</a> to view monthly income/expense, spending by category and goal progress.', zh: '進入<a href="reports.html">報告</a>查看每月收支、依類別的支出和目標進度。' },
  'how.5.li1':          { vi: 'Danh mục nào vượt dự tính? Vì sao?', en: 'Which categories exceeded plan? Why?', zh: '哪些類別超出計畫？為何？' },
  'how.5.li2':          { vi: 'Khoản chi nào có thể cắt hoặc giảm?', en: 'Which expenses can be cut or reduced?', zh: '哪些支出可以削減？' },
  'how.5.li3':          { vi: 'Mục tiêu tiết kiệm có đang đi đúng tốc độ không?', en: 'Is saving goal on the right pace?', zh: '儲蓄目標進度是否合適？' },

  'how.preview.week':   { vi: 'Tuần này',        en: 'This week',      zh: '本週' },
  'how.preview.food':   { vi: 'Ăn uống',         en: 'Food',           zh: '餐飲' },
  'how.preview.transport':{ vi: 'Di chuyển',     en: 'Transport',      zh: '交通' },
  'how.preview.saving': { vi: 'Tiết kiệm',       en: 'Saving',         zh: '儲蓄' },

  'how.cta.title':      { vi: 'Sẵn sàng thử?',   en: 'Ready to try?',  zh: '準備好試試了嗎？' },
  'how.cta.desc':       { vi: 'Không thẻ tín dụng. Dữ liệu lưu cục bộ trên trình duyệt của bạn.', en: 'No credit card. Data stored locally in your browser.', zh: '無需信用卡。資料儲存於您的瀏覽器本機。' },
  'how.cta.button':     { vi: 'Tạo tài khoản miễn phí', en: 'Create free account', zh: '建立免費帳號' },

  // ============== STORY ==============
  'story.h2':           { vi: 'Sản phẩm sinh ra từ vấn đề thật', en: 'A product born from a real problem', zh: '源於真實問題的產品' },
  'story.lead':         { vi: 'QLTC bắt đầu từ một câu hỏi mà cả 4 thành viên nhóm cùng vướng phải: "Lương sinh viên đi đâu hết rồi?"', en: 'QLTC began with a question all 4 team members shared: "Where did the student stipend go?"', zh: 'QLTC 始於四位團隊成員共同的疑問：「學生的薪水都跑哪去了？」' },
  'story.kicker':       { vi: 'Câu chuyện đằng sau', en: 'The story behind', zh: '背後的故事' },
  'story.body':         { vi: 'Trong hơn 3 tháng làm đồ án, nhóm chúng tôi — 4 du học sinh Việt Nam tại Đại học Khoa học và Công nghệ Đài Bắc — ngồi tổng kết chi tiêu sau một thời gian sống ở Đài Bắc. Kết quả: mất dấu gần 40% số tiền. Excel quá rườm rà, nhiều app nước ngoài không hiểu các khoản rất Việt như đám giỗ, tiền mừng cưới, học phí học kỳ; một số app lại có quá nhiều quảng cáo và gợi ý nâng cấp. Vậy là nhóm quyết định làm một công cụ của riêng mình: đơn giản, đẹp, không quảng cáo, dữ liệu thuộc về người dùng. Đó là QLTC.', en: 'During 3+ months of project work, our team — 4 Vietnamese students at Taipei University of Science and Technology — sat down to summarize spending after some time living in Taipei. The result: nearly 40% of money was unaccounted for. Excel was too clunky, many foreign apps did not understand very Vietnamese expenses like death anniversaries, wedding gift money, semester tuition; some apps had too many ads and upgrade nudges. So the team decided to make our own tool: simple, beautiful, no ads, data belongs to the user. That is QLTC.', zh: '在三個多月的專案製作中，我們團隊 — 四位就讀於臺北科技大學的越南留學生 — 在臺北生活一段時間後坐下來盤點支出。結果：將近 40% 的錢去向不明。Excel 太繁瑣；許多國外 App 不懂越南特有的支出，例如忌日、紅包、學期學費；有些 App 又有過多廣告與升級提示。於是團隊決定打造屬於自己的工具：簡潔、美觀、無廣告、資料屬於使用者。這就是 QLTC。' },

  'principle.1.title':  { vi: 'Dữ liệu là của bạn', en: 'Your data is yours', zh: '資料屬於您' },
  'principle.1.desc':   { vi: 'Lưu cục bộ trên trình duyệt. Không server thu thập, không chia sẻ cho bên thứ ba.', en: 'Stored locally in your browser. No server collection, no third-party sharing.', zh: '儲存於您的瀏覽器本機。無伺服器收集，不分享給第三方。' },
  'principle.2.title':  { vi: 'Không quảng cáo, không bán hàng', en: 'No ads, no selling', zh: '無廣告，不行銷' },
  'principle.2.desc':   { vi: 'Vì là đồ án học phần, QLTC tập trung vào trải nghiệm sạch: không pop-up, không ép nâng cấp.', en: 'As a coursework project, QLTC focuses on clean experience: no pop-ups, no forced upgrades.', zh: '作為課程作業，QLTC 專注於純淨體驗：無彈窗、無強迫升級。' },
  'principle.3.title':  { vi: 'Thiết kế cho người Việt', en: 'Designed for Vietnamese users', zh: '為越南使用者設計' },
  'principle.3.desc':   { vi: 'Danh mục gần gũi, hiển thị VND kiểu 1.000.000đ, phù hợp sinh viên Việt ở Đài Bắc.', en: 'Familiar categories, VND formatted like 1,000,000đ, suited for Vietnamese students in Taipei.', zh: '熟悉的分類、VND 以 1,000,000đ 格式顯示，適合在臺北的越南學生。' },

  'feedback.h3':        { vi: 'Feedback từ lớp và ký túc xá', en: 'Feedback from class and dorm', zh: '來自班級與宿舍的回饋' },
  'feedback.lead':      { vi: 'Một vài góp ý ngắn sau buổi demo thử.', en: 'A few short comments after the demo session.', zh: '試映後的幾則簡短回饋。' },
  'feedback.1.quote':   { vi: '"Dashboard dễ hiểu, nhìn là biết tháng này còn ổn hay không."', en: '"Dashboard is easy to read; one look tells me if the month is okay."', zh: '「儀表板一目了然，看一眼就知道這個月是否正常。」' },
  'feedback.1.name':    { vi: 'Bạn cùng lớp',    en: 'Classmate',      zh: '同班同學' },
  'feedback.1.where':   { vi: 'Workshop môn Thực hành thiết kế Website', en: 'Web Design Practice workshop', zh: 'Web 設計實作工作坊' },
  'feedback.2.quote':   { vi: '"Có chuyển khoản giữa các ví nên không bị tính nhầm là chi tiêu."', en: '"Wallet transfers exist so they are not mistakenly counted as spending."', zh: '「錢包間的轉帳不會被誤算成支出。」' },
  'feedback.2.name':    { vi: 'Bạn trong KTX',   en: 'Dorm friend',    zh: '宿舍朋友' },
  'feedback.2.where':   { vi: 'Nhóm thử bản demo tháng 12/2025', en: 'Demo tester group, Dec 2025', zh: '2025 年 12 月試用小組' },
  'feedback.3.quote':   { vi: '"Ngôn ngữ đơn giản, người mới biết nhập ở đâu và đọc gì trước."', en: '"Simple language so newcomers know where to enter and what to read first."', zh: '「語言簡單，新手知道從哪輸入、先看什麼。」' },
  'feedback.3.name':    { vi: 'Người thử nghiệm', en: 'Tester',         zh: '試用者' },
  'feedback.3.where':   { vi: 'Góp ý sau khi dùng thử 15 phút', en: 'Feedback after 15 minutes of trial', zh: '試用 15 分鐘後的回饋' },

  'story.cta.text':     { vi: 'Bạn cũng đang đau đầu với chi tiêu?', en: 'Also struggling with spending?', zh: '您也為支出煩惱嗎？' },
  'story.cta.button':   { vi: 'Thử ngay',        en: 'Try now',        zh: '立即試用' },

  // ============== TEAM ==============
  'team.h2':            { vi: 'Đội ngũ sáng tạo', en: 'Creative team',  zh: '創意團隊' },
  'team.lead':          { vi: 'Nhóm 7 · 4 du học sinh Việt Nam tại Đài Bắc — học công nghệ, làm sản phẩm, chia sẻ niềm vui.', en: 'Group 7 · 4 Vietnamese students in Taipei — studying technology, building products, sharing joy.', zh: '第七組 · 四位在臺北的越南留學生 — 學技術、做產品、分享快樂。' },
  'team.meta.school':   { vi: 'Trường',          en: 'University',     zh: '學校' },
  'team.meta.school.val':{ vi: 'Đại học Khoa học và Công nghệ Đài Bắc', en: 'Taipei University of Science and Technology', zh: '臺北城市科技大學' },
  'team.meta.course':   { vi: 'Môn học',         en: 'Course',         zh: '課程' },
  'team.meta.course.val':{ vi: 'Thực hành thiết kế Website', en: 'Web Design Practice', zh: '行動網頁設計實作' },
  'team.meta.group':    { vi: 'Nhóm',            en: 'Group',          zh: '組別' },
  'team.meta.group.val':{ vi: 'Nhóm 7',          en: 'Group 7',        zh: '第七組' },

  'team.mssv':          { vi: 'MSSV',                   en: 'Student ID',             zh: '學號' },

  'team.name.1':        { vi: 'Phạm Thị Yến',           en: 'Pham Thi Yen',           zh: '范氏燕' },
  'team.name.2':        { vi: 'Đỗ Ngân Hà',             en: 'Do Ngan Ha',             zh: '杜銀河' },
  'team.name.3':        { vi: 'Nguyễn Thị Quỳnh Trang', en: 'Nguyen Thi Quynh Trang', zh: '阮氏瓊裝' },
  'team.name.4':        { vi: 'Nguyễn Thị Hậu',         en: 'Nguyen Thi Hau',         zh: '阮氏俊' },

  'team.role.1':        { vi: 'Trưởng nhóm',     en: 'Team leader',    zh: '組長' },
  'team.role.2':        { vi: 'Thiết kế UI/UX',  en: 'UI/UX Design',   zh: 'UI/UX 設計' },
  'team.role.3':        { vi: 'Lập trình Front-end', en: 'Front-end developer', zh: '前端工程師' },
  'team.role.4':        { vi: 'Phân tích dữ liệu', en: 'Data analyst', zh: '資料分析' },

  'team.location.1':    { vi: 'Hà Nội',          en: 'Hanoi',          zh: '河內' },
  'team.location.2':    { vi: 'Hải Phòng',       en: 'Haiphong',       zh: '海防' },
  'team.location.3':    { vi: 'Đà Nẵng',         en: 'Da Nang',        zh: '峴港' },
  'team.location.4':    { vi: 'Nghệ An',         en: 'Nghe An',        zh: '乂安' },

  'team.contrib':       { vi: 'Đóng góp chính',  en: 'Key contributions', zh: '主要貢獻' },
  'team.contrib.1.1':   { vi: 'Điều phối nhóm và quản lý timeline', en: 'Team coordination and timeline management', zh: '團隊協調與時程管理' },
  'team.contrib.1.2':   { vi: 'Thiết kế hệ thống danh mục thu/chi', en: 'Design income/expense category system', zh: '設計收支類別系統' },
  'team.contrib.1.3':   { vi: 'Viết tài liệu và chuẩn bị demo cuối kỳ', en: 'Write docs and prepare final demo', zh: '撰寫文件並準備期末演示' },
  'team.contrib.2.1':   { vi: 'Nghiên cứu luồng người dùng mới', en: 'Research new user flow', zh: '研究新使用者流程' },
  'team.contrib.2.2':   { vi: 'Thiết kế wireframe cho landing và dashboard', en: 'Design wireframes for landing and dashboard', zh: '設計首頁與儀表板線框圖' },
  'team.contrib.2.3':   { vi: 'Kiểm tra khoảng cách, màu sắc và responsive', en: 'Check spacing, colors and responsive', zh: '檢查間距、配色與響應式' },
  'team.contrib.3.1':   { vi: 'Xây dựng giao diện đăng ký, dashboard và giao dịch', en: 'Build signup, dashboard and transactions UI', zh: '建構註冊、儀表板與交易介面' },
  'team.contrib.3.2':   { vi: 'Tối ưu component dùng chung bằng HTML/CSS/JS', en: 'Optimize shared components in HTML/CSS/JS', zh: '以 HTML/CSS/JS 優化共用元件' },
  'team.contrib.3.3':   { vi: 'Kết nối dữ liệu mẫu cho trải nghiệm demo', en: 'Hook up sample data for demo experience', zh: '連接範例資料以供演示' },
  'team.contrib.4.1':   { vi: 'Thiết kế logic ngân sách và cảnh báo vượt mức', en: 'Design budget logic and overshoot alerts', zh: '設計預算邏輯與超支警示' },
  'team.contrib.4.2':   { vi: 'Chuẩn hóa dữ liệu báo cáo theo danh mục', en: 'Normalize report data by category', zh: '依類別標準化報告資料' },
  'team.contrib.4.3':   { vi: 'Kiểm thử các tình huống thu, chi, chuyển khoản', en: 'Test income, expense and transfer scenarios', zh: '測試收入、支出與轉帳情境' },

  'team.journey.h3':    { vi: 'Hành trình Nhóm 7', en: 'Group 7 journey', zh: '第七組旅程' },
  'team.journey.lead':  { vi: 'Hơn 3 tháng từ ý tưởng trong ký túc xá đến bản demo hoàn chỉnh cho môn Thực hành thiết kế Website.', en: 'Over 3 months from dorm-room idea to complete demo for Web Design Practice.', zh: '從宿舍裡的構想到 Web 設計實作完整演示，歷時三個多月。' },
  'team.journey.1.t':   { vi: 'Tuần 1-2',        en: 'Week 1-2',       zh: '第 1-2 週' },
  'team.journey.1.d':   { vi: 'Chốt vấn đề, khảo sát nhanh bạn cùng lớp/KTX và xác định các màn hình cần có.', en: 'Lock down the problem, quick survey of classmates/dorm friends, define required screens.', zh: '確認問題、快速訪問同學/室友，確定所需畫面。' },
  'team.journey.2.t':   { vi: 'Tuần 3-4',        en: 'Week 3-4',       zh: '第 3-4 週' },
  'team.journey.2.d':   { vi: 'Thiết kế wireframe, bảng màu, component và luồng đăng ký, dashboard, giao dịch.', en: 'Design wireframes, color palette, components and signup/dashboard/transactions flow.', zh: '設計線框圖、配色、元件與註冊、儀表板、交易流程。' },
  'team.journey.3.t':   { vi: 'Tháng 2',         en: 'Month 2',        zh: '第二個月' },
  'team.journey.3.d':   { vi: 'Code các trang chính: tài khoản, giao dịch, ngân sách, mục tiêu và dữ liệu mẫu.', en: 'Code main pages: accounts, transactions, budgets, goals, sample data.', zh: '撰寫主要頁面：帳戶、交易、預算、目標與範例資料。' },
  'team.journey.4.t':   { vi: 'Tháng 3',         en: 'Month 3',        zh: '第三個月' },
  'team.journey.4.d':   { vi: 'Hoàn thiện báo cáo, cài đặt, responsive và sửa lỗi theo feedback khi demo thử.', en: 'Finalize reports, settings, responsive and bug fixes per demo feedback.', zh: '完成報告、設定、響應式調整，並依試演回饋修復錯誤。' },
  'team.journey.5.t':   { vi: 'Tuần cuối',       en: 'Final week',     zh: '最後一週' },
  'team.journey.5.d':   { vi: 'Polish UI, viết tài liệu, chuẩn bị slide và luyện demo trước buổi thuyết trình.', en: 'Polish UI, write docs, prepare slides and rehearse demo before presentation.', zh: '美化 UI、撰寫文件、準備投影片並於發表前演練。' },

  // ============== FINAL CTA ==============
  'cta.h2':             { vi: 'Sẵn sàng làm chủ tài chính của bạn?', en: 'Ready to take control of your finances?', zh: '準備好掌控您的財務了嗎？' },
  'cta.lead':           { vi: 'Tham gia hàng nghìn người dùng đang quản lý tiền thông minh hơn — hoàn toàn miễn phí.', en: 'Join thousands of users managing money smarter — completely free.', zh: '加入數千位更聰明管理金錢的使用者 — 完全免費。' },
  'cta.button':         { vi: 'Bắt đầu ngay',    en: 'Start now',      zh: '立即開始' },

  // ============== FOOTER ==============
  'footer.desc':        { vi: 'Từ một câu hỏi rất quen: "Lương sinh viên đi đâu hết rồi?" — nhóm biến nó thành một sản phẩm có thể bấm, dùng thử và cải tiến.', en: 'From a familiar question: "Where did the student stipend go?" — the team turned it into a clickable, testable, iterable product.', zh: '源於一個熟悉的問題：「學生的薪水都跑哪去了？」— 團隊將它變成可點擊、可試用、可改進的產品。' },
  'footer.b.local':     { vi: 'Lưu cục bộ',      en: 'Local storage',  zh: '本機儲存' },
  'footer.b.noads':     { vi: 'Không quảng cáo', en: 'No ads',         zh: '無廣告' },
  'footer.b.dark':      { vi: 'Có dark mode',    en: 'Dark mode',      zh: '深色模式' },
  'footer.explore':     { vi: 'Khám phá',        en: 'Explore',        zh: '探索' },
  'footer.app':         { vi: 'Ứng dụng',        en: 'App',            zh: '應用' },
  'footer.account':     { vi: 'Tài khoản',       en: 'Account',        zh: '帳戶' },
  'footer.app.demo':    { vi: 'Demo',            en: 'Demo',           zh: '演示' },
  'footer.app.tx':      { vi: 'Giao dịch',       en: 'Transactions',   zh: '交易' },
  'footer.app.budgets': { vi: 'Ngân sách',       en: 'Budgets',        zh: '預算' },
  'footer.app.reports': { vi: 'Báo cáo',         en: 'Reports',        zh: '報告' },
  'footer.acc.signin':  { vi: 'Đăng nhập',       en: 'Sign in',        zh: '登入' },
  'footer.acc.signup':  { vi: 'Đăng ký',         en: 'Sign up',        zh: '註冊' },
  'footer.acc.settings':{ vi: 'Cài đặt',         en: 'Settings',       zh: '設定' },
  'footer.project':     { vi: 'Thông tin đồ án', en: 'Project info',   zh: '專案資訊' },
  'footer.duration':    { vi: 'Nhóm 7 · Hơn 3 tháng phát triển', en: 'Group 7 · Over 3 months of development', zh: '第七組 · 三個多月的開發' },
  'footer.copyright':   { vi: '© 2026 QLTC · Nhóm 7 · Thực hành thiết kế Website · Đại học Khoa học và Công nghệ Đài Bắc', en: '© 2026 QLTC · Group 7 · Web Design Practice · Taipei University of Science and Technology', zh: '© 2026 QLTC · 第七組 · 行動網頁設計實作 · 臺北城市科技大學' },
  'footer.tagline':     { vi: 'Made with care by Vietnamese students in Taipei', en: 'Made with care by Vietnamese students in Taipei', zh: '由在臺北的越南學生用心製作' },

  // ============== HOW SECTION META ==============
  'how.related':        { vi: 'Trang liên quan:', en: 'Related pages:', zh: '相關頁面：' },

  // ============== GREETING / INSIGHT (dashboard) ==============
  'greet.morning':       { vi: 'Chào buổi sáng',  en: 'Good morning',   zh: '早安' },
  'greet.afternoon':     { vi: 'Chào buổi chiều', en: 'Good afternoon', zh: '午安' },
  'greet.evening':       { vi: 'Chào buổi tối',   en: 'Good evening',   zh: '晚安' },
  'insight.healthy':     { vi: 'Tài chính của bạn đang rất khỏe mạnh 💪', en: 'Your finances are looking great 💪', zh: '您的財務狀況非常健康 💪' },
  'insight.spend.more':  { vi: 'Tuần này bạn chi {cat} nhiều hơn so với tuần trước 👀', en: 'You spent more on {cat} this week than last 👀', zh: '本週您在{cat}的支出比上週多 👀' },
  'insight.save.up':     { vi: 'Tiết kiệm tuần này {amt} so với tuần trước 🎯', en: 'You saved {amt} more this week than last 🎯', zh: '本週比上週多儲蓄 {amt} 🎯' },
  'insight.balanced':    { vi: 'Thu chi đang cân đối, hãy tiếp tục duy trì ✨', en: 'Income and expenses are balanced, keep it up ✨', zh: '收支均衡，繼續保持 ✨' },

  // Period labels (used as suffix in mini-cards and elsewhere)
  'period.today':        { vi: 'hôm nay',         en: 'today',          zh: '今日' },
  'period.thisweek':     { vi: 'tuần này',        en: 'this week',      zh: '本週' },
  'period.thismonth':    { vi: 'tháng này',       en: 'this month',     zh: '本月' },
  'period.thisyear':     { vi: 'năm nay',         en: 'this year',      zh: '今年' },
  'period.lastmonth':    { vi: 'tháng trước',     en: 'last month',     zh: '上個月' },
  'period.last7':        { vi: '7 ngày qua',      en: 'last 7 days',    zh: '過去 7 天' },
  'period.last30':       { vi: '30 ngày qua',     en: 'last 30 days',   zh: '過去 30 天' },
  'period.last90':       { vi: '90 ngày qua',     en: 'last 90 days',   zh: '過去 90 天' },

  // Period picker modal
  'picker.title':        { vi: 'Chọn khoảng thời gian', en: 'Pick a date range', zh: '選擇時間範圍' },
  'picker.quick':        { vi: 'Chọn nhanh',      en: 'Quick pick',     zh: '快速選擇' },
  'picker.bymonth':      { vi: 'Theo tháng cụ thể', en: 'By specific month', zh: '依特定月份' },
  'picker.bydate':       { vi: 'Tùy chỉnh theo ngày', en: 'Custom dates', zh: '自訂日期' },
  'picker.from':         { vi: 'Từ ngày',         en: 'From',           zh: '起始日' },
  'picker.to':           { vi: 'Đến ngày',        en: 'To',             zh: '結束日' },
  'picker.apply':        { vi: 'Áp dụng',         en: 'Apply',          zh: '套用' },

  // ============== TRANSACTION MODAL ==============
  'tx.modal.type':       { vi: 'Loại giao dịch',  en: 'Transaction type', zh: '交易類型' },
  'tx.modal.note.placeholder': { vi: 'VD: Bữa trưa với khách hàng', en: 'e.g., Lunch with client', zh: '例如：與客戶的午餐' },
  'tx.search.ph':        { vi: 'Tìm theo mô tả...', en: 'Search by note...', zh: '依備註搜尋…' },
  'tx.filter.all.type':  { vi: 'Tất cả loại',    en: 'All types',      zh: '所有類型' },
  'tx.filter.all.cat':   { vi: 'Tất cả danh mục',en: 'All categories', zh: '所有類別' },
  'tx.filter.all.wal':   { vi: 'Tất cả ví',      en: 'All wallets',    zh: '所有錢包' },
  'tx.filter.reset':     { vi: 'Xóa lọc',        en: 'Reset',          zh: '重設' },

  // ============== GOALS DYNAMIC ==============
  'goal.deadline.prefix': { vi: 'Hạn',            en: 'Due',            zh: '截止' },
  'goal.deposit.btn':     { vi: 'Nạp thêm',       en: 'Deposit',        zh: '存入' },
  'goal.deposit.title':   { vi: 'Nạp tiền vào',   en: 'Deposit to',     zh: '存入至' },
  'goal.deposit.current': { vi: 'Hiện tại',       en: 'Current',        zh: '目前' },
  'goal.deposit.amount':  { vi: 'Số tiền nạp',    en: 'Deposit amount', zh: '存入金額' },
  'goal.deposit.do':      { vi: 'Nạp',            en: 'Deposit',        zh: '存入' },
  'goal.deposit.added':   { vi: 'Đã nạp',         en: 'Deposited',      zh: '已存入' },
  'goal.modal.add':       { vi: 'Thêm mục tiêu',  en: 'Add goal',       zh: '新增目標' },
  'goal.modal.edit':      { vi: 'Sửa mục tiêu',   en: 'Edit goal',      zh: '編輯目標' },
  'goal.name.placeholder':{ vi: 'VD: Du lịch Đà Nẵng', en: 'e.g., Trip to Tokyo', zh: '例如：日本旅行' },
  'goal.target.amount':   { vi: 'Số tiền mục tiêu',en: 'Target amount', zh: '目標金額' },
  'goal.saved.amount':    { vi: 'Đã có',          en: 'Saved',          zh: '已有' },
  'goal.toast.invalid':   { vi: 'Số tiền mục tiêu không hợp lệ', en: 'Invalid target amount', zh: '目標金額無效' },
  'goal.toast.empty.name':{ vi: 'Nhập tên mục tiêu', en: 'Enter goal name', zh: '請輸入目標名稱' },
  'goal.toast.empty.amt': { vi: 'Nhập số tiền',   en: 'Enter amount',   zh: '請輸入金額' },
  'goal.toast.added':     { vi: 'Đã thêm mục tiêu', en: 'Goal added',   zh: '目標已新增' },
  'goal.toast.updated':   { vi: 'Đã cập nhật',    en: 'Updated',        zh: '已更新' },
  'goal.confirm.delete':  { vi: 'Xóa mục tiêu',   en: 'Delete goal',    zh: '刪除目標' },

  // ============== REPORTS DYNAMIC ==============
  'report.total.income':  { vi: 'Tổng thu',       en: 'Total income',   zh: '總收入' },
  'report.total.expense': { vi: 'Tổng chi',       en: 'Total expenses', zh: '總支出' },
  'report.net':           { vi: 'Chênh lệch',     en: 'Net',            zh: '淨額' },
  'report.tx.count':      { vi: 'Số giao dịch',   en: 'Transactions',   zh: '交易筆數' },
  'report.top.spending':  { vi: 'Top 5 khoản chi lớn nhất', en: 'Top 5 expenses', zh: '前 5 大支出' },
  'report.range.month':   { vi: 'Tháng',          en: 'Month',          zh: '月' },
  'report.range.quarter': { vi: 'Quý',            en: 'Quarter',        zh: '季' },
  'report.range.year':    { vi: 'Năm',            en: 'Year',           zh: '年' },

  // ============== ACCOUNTS DYNAMIC ==============
  'acc.modal.add':        { vi: 'Thêm ví',        en: 'Add wallet',     zh: '新增錢包' },
  'acc.modal.edit':       { vi: 'Sửa ví',         en: 'Edit wallet',    zh: '編輯錢包' },
  'acc.name':             { vi: 'Tên ví',         en: 'Wallet name',    zh: '錢包名稱' },
  'acc.name.placeholder': { vi: 'VD: Vietcombank chính', en: 'e.g., Main Bank', zh: '例如：主要銀行' },
  'acc.type':             { vi: 'Loại',           en: 'Type',           zh: '類型' },
  'acc.type.cash':        { vi: 'Tiền mặt',       en: 'Cash',           zh: '現金' },
  'acc.type.bank':        { vi: 'Ngân hàng',      en: 'Bank',           zh: '銀行' },
  'acc.type.ewallet':     { vi: 'Ví điện tử',     en: 'E-wallet',       zh: '電子錢包' },
  'acc.initial':          { vi: 'Số dư ban đầu',  en: 'Initial balance',zh: '初始餘額' },
  'acc.toast.added':      { vi: 'Đã thêm ví',     en: 'Wallet added',   zh: '錢包已新增' },
  'acc.toast.empty.name': { vi: 'Nhập tên ví',    en: 'Enter wallet name', zh: '請輸入錢包名稱' },
  'acc.confirm.delete':   { vi: 'Xóa ví',         en: 'Delete wallet',  zh: '刪除錢包' },
  'acc.total.balance':    { vi: 'Tổng số dư',     en: 'Total balance',  zh: '總餘額' },
  'acc.wallets':          { vi: 'ví',             en: 'wallets',        zh: '個錢包' },
  'acc.no.tx':            { vi: 'Chưa có giao dịch', en: 'No transactions', zh: '尚無交易' },

  // ============== SPLITS DYNAMIC ==============
  'split.modal.new':      { vi: 'Hóa đơn mới',    en: 'New bill',       zh: '新增帳單' },
  'split.modal.edit':     { vi: 'Sửa hóa đơn',    en: 'Edit bill',      zh: '編輯帳單' },
  'split.f.title':        { vi: 'Tiêu đề',        en: 'Title',          zh: '標題' },
  'split.f.title.ph':     { vi: 'VD: Lẩu cuối tuần, tiền phòng tháng 5...', en: 'e.g., Weekend hotpot, May rent...', zh: '例如：週末火鍋、5月房租…' },
  'split.f.total':        { vi: 'Tổng tiền',      en: 'Total',          zh: '總金額' },
  'split.f.date':         { vi: 'Ngày',           en: 'Date',           zh: '日期' },
  'split.f.paidby':       { vi: 'Người trả',      en: 'Paid by',        zh: '付款人' },
  'split.f.mode':         { vi: 'Cách chia',      en: 'Split mode',     zh: '分攤方式' },
  'split.f.mode.equal':   { vi: 'Chia đều',       en: 'Equal',          zh: '平均' },
  'split.f.mode.custom':  { vi: 'Tùy chỉnh',      en: 'Custom',         zh: '自訂' },
  'split.f.participants': { vi: 'Người tham gia & phần chia', en: 'Participants & shares', zh: '參與者與份額' },
  'split.f.sum':          { vi: 'Tổng các phần',  en: 'Sum of shares',  zh: '份額總和' },
  'split.f.target':       { vi: 'Tổng hóa đơn',   en: 'Bill total',     zh: '帳單總額' },
  'split.f.note':         { vi: 'Ghi chú',        en: 'Note',           zh: '備註' },
  'split.friends.title':  { vi: 'Quản lý bạn bè', en: 'Manage friends', zh: '管理朋友' },
  'split.friend.ph':      { vi: 'Tên bạn bè (VD: Minh Khoa)', en: 'Friend name (e.g., Alex)', zh: '朋友姓名（例如：小明）' },
  'split.friend.none':    { vi: 'Chưa có bạn bè. Thêm tên ở trên để bắt đầu.', en: 'No friends yet. Add a name above to start.', zh: '尚無朋友。請於上方新增以開始。' },
  'split.friend.warn':    { vi: 'Bạn chưa có bạn bè nào. Vào nút Bạn bè để thêm trước.', en: 'You have no friends yet. Click Friends to add some first.', zh: '尚無朋友。請先點擊「朋友」新增。' },
  'split.toast.title':    { vi: 'Nhập tiêu đề',   en: 'Enter title',    zh: '請輸入標題' },
  'split.toast.total':    { vi: 'Tổng tiền không hợp lệ', en: 'Invalid total', zh: '總金額無效' },
  'split.toast.min':      { vi: 'Cần ít nhất 2 người tham gia', en: 'Need at least 2 participants', zh: '至少需要 2 位參與者' },
  'split.toast.added':    { vi: 'Đã tạo hóa đơn', en: 'Bill created',   zh: '帳單已建立' },
  'split.toast.updated':  { vi: 'Đã cập nhật hóa đơn', en: 'Bill updated', zh: '帳單已更新' },
  'split.confirm.delete': { vi: 'Xóa hóa đơn',    en: 'Delete bill',    zh: '刪除帳單' },
  'split.paid.label':     { vi: 'trả',            en: 'paid',           zh: '付款' },
  'split.unsettled.left': { vi: 'Còn',            en: 'Left',           zh: '剩' },
  'split.unsettled.right':{ vi: 'chưa xong',      en: 'unsettled',      zh: '未結清' },
  'split.settled':        { vi: 'Đã thanh toán xong', en: 'Fully settled', zh: '已全部結清' },
  'split.people':         { vi: 'người',          en: 'people',         zh: '人' },
  'split.paid':           { vi: 'trả',            en: 'paid',           zh: '付款' },
  'split.confirm.unbalanced':{ vi: 'Tổng các phần khác tổng hóa đơn. Vẫn lưu?', en: 'Sum of shares does not match total. Save anyway?', zh: '份額總和與帳單不符。仍要儲存嗎？' },

  // ============== APP SIDEBAR ==============
  'app.nav.dashboard':   { vi: 'Tổng quan',     en: 'Dashboard',      zh: '總覽' },
  'app.nav.transactions':{ vi: 'Giao dịch',     en: 'Transactions',   zh: '交易' },
  'app.nav.budgets':     { vi: 'Ngân sách',     en: 'Budgets',        zh: '預算' },
  'app.nav.goals':       { vi: 'Mục tiêu',      en: 'Goals',          zh: '目標' },
  'app.nav.reports':     { vi: 'Báo cáo',       en: 'Reports',        zh: '報告' },
  'app.nav.accounts':    { vi: 'Ví & TK',       en: 'Wallets',        zh: '錢包' },
  'app.nav.splits':      { vi: 'Chia hóa đơn',  en: 'Split bill',     zh: '分帳' },
  'app.nav.settings':    { vi: 'Cài đặt',       en: 'Settings',       zh: '設定' },

  // Topbar / dropdown
  'app.topbar.search':   { vi: 'Tìm kiếm giao dịch, danh mục...', en: 'Search transactions, categories...', zh: '搜尋交易、類別…' },
  'app.menu.profile':    { vi: 'Hồ sơ',         en: 'Profile',        zh: '個人資料' },
  'app.menu.settings':   { vi: 'Cài đặt',       en: 'Settings',       zh: '設定' },
  'app.menu.logout':     { vi: 'Đăng xuất',     en: 'Sign out',       zh: '登出' },

  // ============== COMMON ==============
  'common.add':          { vi: 'Thêm',          en: 'Add',            zh: '新增' },
  'common.edit':         { vi: 'Sửa',           en: 'Edit',           zh: '編輯' },
  'common.delete':       { vi: 'Xóa',           en: 'Delete',         zh: '刪除' },
  'common.save':         { vi: 'Lưu',           en: 'Save',           zh: '儲存' },
  'common.cancel':       { vi: 'Hủy',           en: 'Cancel',         zh: '取消' },
  'common.confirm':      { vi: 'Đồng ý',        en: 'Confirm',        zh: '確認' },
  'common.close':        { vi: 'Đóng',          en: 'Close',          zh: '關閉' },
  'common.update':       { vi: 'Cập nhật',      en: 'Update',         zh: '更新' },
  'common.viewall':      { vi: 'Xem tất cả',    en: 'View all',       zh: '檢視全部' },
  'common.all':          { vi: 'Tất cả',        en: 'All',            zh: '全部' },
  'common.note':         { vi: 'Ghi chú',       en: 'Note',           zh: '備註' },
  'common.amount':       { vi: 'Số tiền',       en: 'Amount',         zh: '金額' },
  'common.date':         { vi: 'Ngày',          en: 'Date',           zh: '日期' },
  'common.category':     { vi: 'Danh mục',      en: 'Category',       zh: '類別' },
  'common.wallet':       { vi: 'Ví',            en: 'Wallet',         zh: '錢包' },
  'common.income':       { vi: 'Thu',           en: 'Income',         zh: '收入' },
  'common.expense':      { vi: 'Chi',           en: 'Expense',        zh: '支出' },
  'common.transfer':     { vi: 'Chuyển khoản',  en: 'Transfer',       zh: '轉帳' },
  'common.month':        { vi: 'Tháng',         en: 'Month',          zh: '月' },
  'common.thismonth':    { vi: 'Tháng này',     en: 'This month',     zh: '本月' },
  'common.color':        { vi: 'Màu',           en: 'Color',          zh: '顏色' },
  'common.icon':         { vi: 'Biểu tượng',    en: 'Icon',           zh: '圖示' },
  'common.name':         { vi: 'Tên',           en: 'Name',           zh: '名稱' },
  'common.deadline':     { vi: 'Hạn hoàn thành',en: 'Deadline',       zh: '截止日期' },
  'common.progress':     { vi: 'Tiến độ',       en: 'Progress',       zh: '進度' },
  'common.total':        { vi: 'Tổng',          en: 'Total',          zh: '總計' },

  // ============== DASHBOARD ==============
  'dash.welcome':        { vi: 'Chào mừng trở lại 👋', en: 'Welcome back 👋', zh: '歡迎回來 👋' },
  'dash.subtitle':       { vi: 'Đây là bức tranh tài chính của bạn hôm nay', en: 'Here is your financial snapshot today', zh: '這是您今日的財務概況' },
  'dash.add.tx':         { vi: 'Thêm giao dịch',en: 'Add transaction',zh: '新增交易' },
  'dash.trend.title':    { vi: 'Thu chi 30 ngày qua', en: 'Last 30 days income/expense', zh: '過去 30 天收支' },
  'dash.trend.subtitle': { vi: 'Biến động dòng tiền theo ngày', en: 'Daily cash flow', zh: '每日金流變化' },
  'dash.donut.title':    { vi: 'Cơ cấu chi tiêu',en: 'Spending breakdown', zh: '支出結構' },
  'dash.donut.subtitle': { vi: 'Theo danh mục', en: 'By category',    zh: '依類別' },
  'dash.activity':       { vi: 'Hoạt động gần đây',en: 'Recent activity', zh: '近期活動' },
  'dash.topgoals':       { vi: 'Mục tiêu nổi bật', en: 'Featured goals', zh: '重點目標' },

  // ============== TRANSACTIONS ==============
  'tx.title':            { vi: 'Giao dịch',     en: 'Transactions',   zh: '交易' },
  'tx.subtitle':         { vi: 'Quản lý thu chi của bạn', en: 'Manage your income and expenses', zh: '管理您的收支' },
  'tx.new':              { vi: 'Giao dịch mới', en: 'New transaction',zh: '新增交易' },
  'tx.filter.type':      { vi: 'Loại',          en: 'Type',           zh: '類型' },
  'tx.filter.category':  { vi: 'Danh mục',      en: 'Category',       zh: '類別' },
  'tx.filter.wallet':    { vi: 'Ví',            en: 'Wallet',         zh: '錢包' },
  'tx.filter.from':      { vi: 'Từ ngày',       en: 'From',           zh: '從' },
  'tx.filter.to':        { vi: 'Đến ngày',      en: 'To',             zh: '到' },
  'tx.col.date':         { vi: 'Ngày',          en: 'Date',           zh: '日期' },
  'tx.col.category':     { vi: 'Danh mục',      en: 'Category',       zh: '類別' },
  'tx.col.note':         { vi: 'Ghi chú',       en: 'Note',           zh: '備註' },
  'tx.col.wallet':       { vi: 'Ví',            en: 'Wallet',         zh: '錢包' },
  'tx.col.amount':       { vi: 'Số tiền',       en: 'Amount',         zh: '金額' },
  'tx.modal.title.add':  { vi: 'Thêm giao dịch',en: 'Add transaction',zh: '新增交易' },
  'tx.modal.title.edit': { vi: 'Sửa giao dịch', en: 'Edit transaction',zh: '編輯交易' },

  // ============== BUDGETS ==============
  'budget.title':        { vi: 'Ngân sách',     en: 'Budgets',        zh: '預算' },
  'budget.subtitle':     { vi: 'Quản lý hạn mức chi tiêu', en: 'Manage spending limits', zh: '管理支出上限' },
  'budget.add':          { vi: 'Thêm ngân sách',en: 'Add budget',     zh: '新增預算' },
  'budget.edit':         { vi: 'Sửa ngân sách', en: 'Edit budget',    zh: '編輯預算' },
  'budget.total':        { vi: 'Tổng ngân sách',en: 'Total budget',   zh: '總預算' },
  'budget.spent':        { vi: 'Đã chi',        en: 'Spent',          zh: '已花費' },
  'budget.remain':       { vi: 'Còn lại',       en: 'Remaining',      zh: '剩餘' },
  'budget.over':         { vi: 'Vượt mức',      en: 'Over limit',     zh: '超出上限' },
  'budget.over.short':   { vi: 'Vượt',          en: 'Over',           zh: '超出' },
  'budget.remain.short': { vi: 'Còn',           en: 'Left',           zh: '剩' },
  'budget.monthly':      { vi: 'Hàng tháng',    en: 'Monthly',        zh: '每月' },
  'budget.limit':        { vi: 'Hạn mức',       en: 'Limit',          zh: '上限' },
  'budget.limit.month':  { vi: 'Hạn mức/tháng', en: 'Monthly limit',  zh: '每月上限' },
  'budget.cat.count':    { vi: 'danh mục',      en: 'categories',     zh: '個類別' },
  'budget.cat.select':   { vi: 'Chọn danh mục', en: 'Select category',zh: '選擇類別' },
  'budget.cat.used':     { vi: '(đã có)',       en: '(in use)',       zh: '（已使用）' },
  'budget.empty.title':  { vi: 'Chưa có ngân sách nào', en: 'No budgets yet', zh: '尚無預算' },
  'budget.empty.desc':   { vi: 'Thiết lập ngân sách để kiểm soát chi tiêu hàng tháng.', en: 'Set budgets to control monthly spending.', zh: '設定預算以控管每月支出。' },
  'budget.toast.cat':    { vi: 'Chọn danh mục', en: 'Pick a category',zh: '請選擇類別' },
  'budget.toast.invalid':{ vi: 'Nhập hạn mức hợp lệ', en: 'Enter a valid limit', zh: '請輸入有效的上限' },
  'budget.toast.added':  { vi: 'Đã thêm ngân sách', en: 'Budget added', zh: '預算已新增' },
  'budget.toast.updated':{ vi: 'Đã cập nhật ngân sách', en: 'Budget updated', zh: '預算已更新' },
  'budget.toast.deleted':{ vi: 'Đã xóa',        en: 'Deleted',        zh: '已刪除' },
  'budget.confirm.delete':{ vi: 'Xóa ngân sách này?', en: 'Delete this budget?', zh: '要刪除此預算嗎？' },

  // ============== DASHBOARD HERO/MINI ==============
  'dash.hero.total':     { vi: 'Tổng tài sản',  en: 'Total assets',   zh: '總資產' },
  'dash.hero.vs.prev':   { vi: 'so với kỳ trước',en: 'vs prev period', zh: '較上期' },
  'dash.hero.tx.count':  { vi: 'giao dịch',     en: 'transactions',   zh: '筆交易' },
  'dash.hero.saving':    { vi: 'Tiết kiệm',     en: 'Saving',         zh: '儲蓄' },
  'dash.hero.negative':  { vi: 'Âm',            en: 'Negative',       zh: '虧損' },
  'dash.mini.income':    { vi: 'Thu',           en: 'Income',         zh: '收入' },
  'dash.mini.expense':   { vi: 'Chi',           en: 'Expense',        zh: '支出' },
  'dash.mini.netsaving': { vi: 'Tiết kiệm ròng',en: 'Net saving',     zh: '淨儲蓄' },

  // ============== GOALS ==============
  'goal.title':          { vi: 'Mục tiêu tiết kiệm', en: 'Savings goals', zh: '儲蓄目標' },
  'goal.subtitle':       { vi: 'Hành trình tới những điều bạn mong muốn', en: 'The journey to what you want', zh: '邁向您想要的事物' },
  'goal.add':            { vi: 'Thêm mục tiêu', en: 'Add goal',       zh: '新增目標' },
  'goal.target':         { vi: 'Số tiền mục tiêu', en: 'Target amount', zh: '目標金額' },
  'goal.current':        { vi: 'Đã có',         en: 'Saved',          zh: '已有' },
  'goal.deposit':        { vi: 'Nạp thêm',      en: 'Deposit',        zh: '存入' },
  'goal.deadline':       { vi: 'Hạn',           en: 'Deadline',       zh: '截止' },
  'goal.empty.title':    { vi: 'Chưa có mục tiêu nào', en: 'No goals yet', zh: '尚無目標' },
  'goal.empty.desc':     { vi: 'Đặt mục tiêu tiết kiệm để bắt đầu hành trình.', en: 'Set a savings goal to start your journey.', zh: '設定儲蓄目標以開始旅程。' },

  // ============== REPORTS ==============
  'report.title':        { vi: 'Báo cáo',       en: 'Reports',        zh: '報告' },
  'report.subtitle':     { vi: 'Phân tích chi tiết tài chính', en: 'Detailed financial analysis', zh: '詳細的財務分析' },
  'report.income':       { vi: 'Thu nhập',      en: 'Income',         zh: '收入' },
  'report.expense':      { vi: 'Chi tiêu',      en: 'Expenses',       zh: '支出' },
  'report.balance':      { vi: 'Số dư',         en: 'Balance',        zh: '餘額' },
  'report.bycategory':   { vi: 'Theo danh mục', en: 'By category',    zh: '依類別' },
  'report.bywallet':     { vi: 'Theo ví',       en: 'By wallet',      zh: '依錢包' },

  // ============== ACCOUNTS / WALLETS ==============
  'acc.title':           { vi: 'Ví & Tài khoản',en: 'Wallets & Accounts', zh: '錢包與帳戶' },
  'acc.subtitle':        { vi: 'Quản lý nguồn tiền của bạn', en: 'Manage your funds', zh: '管理您的資金' },
  'acc.add':             { vi: 'Thêm ví',       en: 'Add wallet',     zh: '新增錢包' },
  'acc.balance':         { vi: 'Số dư',         en: 'Balance',        zh: '餘額' },
  'acc.empty.title':     { vi: 'Chưa có ví nào',en: 'No wallets yet', zh: '尚無錢包' },

  // ============== SETTINGS ==============
  'set.title':           { vi: 'Cài đặt',       en: 'Settings',       zh: '設定' },
  'set.subtitle':        { vi: 'Tùy chỉnh trải nghiệm của bạn', en: 'Customize your experience', zh: '客製化您的體驗' },
  'set.profile':         { vi: 'Hồ sơ',         en: 'Profile',        zh: '個人資料' },
  'set.name':            { vi: 'Họ và tên',     en: 'Full name',      zh: '姓名' },
  'set.email':           { vi: 'Email',         en: 'Email',          zh: '電子郵件' },
  'set.save.profile':    { vi: 'Lưu hồ sơ',     en: 'Save profile',   zh: '儲存個人資料' },
  'set.appearance':      { vi: 'Giao diện',     en: 'Appearance',     zh: '外觀' },
  'set.dark':            { vi: 'Chế độ tối',    en: 'Dark mode',      zh: '深色模式' },
  'set.dark.desc':       { vi: 'Bật để giảm mỏi mắt vào ban đêm', en: 'Reduce eye strain at night', zh: '減少夜間眼睛疲勞' },
  'set.preset':          { vi: 'Tông màu chủ đạo',en: 'Accent color', zh: '主色調' },
  'set.preset.desc':     { vi: 'Chọn preset hoặc tự pha màu yêu thích', en: 'Pick a preset or mix your favorite color', zh: '選擇預設或調配您喜愛的顏色' },
  'set.custom':          { vi: 'Màu tùy chỉnh', en: 'Custom color',   zh: '自訂顏色' },
  'set.custom.desc':     { vi: 'Chọn mã hex hoặc dùng color picker', en: 'Enter hex code or use color picker', zh: '輸入色碼或使用調色盤' },
  'set.general':         { vi: 'Tùy chọn chung',en: 'General',        zh: '一般設定' },
  'set.lang':            { vi: 'Ngôn ngữ',      en: 'Language',       zh: '語言' },
  'set.currency':        { vi: 'Đơn vị tiền tệ',en: 'Currency',       zh: '貨幣' },
  'set.data':            { vi: 'Dữ liệu',       en: 'Data',           zh: '資料' },
  'set.data.desc':       { vi: 'Sao lưu hoặc khôi phục dữ liệu của bạn (lưu cục bộ trên trình duyệt).', en: 'Backup or restore your data (stored locally in browser).', zh: '備份或還原您的資料（儲存於本機瀏覽器）。' },
  'set.export':          { vi: 'Xuất JSON',     en: 'Export JSON',    zh: '匯出 JSON' },
  'set.import':          { vi: 'Nhập JSON',     en: 'Import JSON',    zh: '匯入 JSON' },
  'set.reset':           { vi: 'Khôi phục mặc định', en: 'Reset to default', zh: '還原預設' },
  'set.about':           { vi: 'Về ứng dụng',   en: 'About',          zh: '關於' },
  'set.about.desc':      { vi: 'Quản lý Tài chính Cá nhân — phiên bản demo UI', en: 'Personal Finance Manager — UI demo version', zh: '個人財務管理 — UI 演示版本' },

  // ============== SPLITS ==============
  'split.title':         { vi: 'Chia hóa đơn',  en: 'Split bill',     zh: '分帳' },
  'split.subtitle':      { vi: 'Theo dõi tiền nợ qua lại với bạn bè', en: 'Track debts between friends', zh: '追蹤朋友間的借貸' },
  'split.friends':       { vi: 'Bạn bè',        en: 'Friends',        zh: '朋友' },
  'split.new':           { vi: 'Hóa đơn mới',   en: 'New bill',       zh: '新增帳單' },
  'split.owed':          { vi: 'Bạn được nợ',   en: 'You are owed',   zh: '您被欠款' },
  'split.owe':           { vi: 'Bạn đang nợ',   en: 'You owe',        zh: '您欠款' },
  'split.net':           { vi: 'Số dư ròng',    en: 'Net balance',    zh: '淨餘額' },
  'split.list':          { vi: 'Danh sách hóa đơn', en: 'Bill list',  zh: '帳單列表' },
  'split.list.subtitle': { vi: 'Mọi khoản đã chia gần đây', en: 'Recently shared bills', zh: '近期已分攤的帳單' },
  'split.empty.title':   { vi: 'Chưa có hóa đơn nào', en: 'No bills yet', zh: '尚無帳單' },
  'split.empty.desc':    { vi: 'Tạo hóa đơn để chia tiền cho bạn bè và theo dõi ai đã thanh toán.', en: 'Create a bill to split with friends and track who paid.', zh: '建立帳單與朋友分攤並追蹤誰已付款。' },

  // ============== THEME PRESETS ==============
  'theme.preset.indigo':  { vi: 'Indigo',       en: 'Indigo',         zh: '靛藍' },
  'theme.preset.emerald': { vi: 'Emerald',      en: 'Emerald',        zh: '翠綠' },
  'theme.preset.rose':    { vi: 'Hồng',         en: 'Rose',           zh: '玫瑰' },
  'theme.preset.amber':   { vi: 'Hổ phách',     en: 'Amber',          zh: '琥珀' },
  'theme.preset.ocean':   { vi: 'Đại dương',    en: 'Ocean',          zh: '海洋' },
  'theme.preset.violet':  { vi: 'Tím',          en: 'Violet',         zh: '紫羅蘭' },
  'theme.preset.slate':   { vi: 'Slate',        en: 'Slate',          zh: '石板灰' },
  'theme.preset.custom':  { vi: 'Tùy chỉnh',    en: 'Custom',         zh: '自訂' },

  // ============== AUTH ==============
  'auth.login.title':    { vi: 'Đăng nhập',     en: 'Sign in',        zh: '登入' },
  'auth.signup.title':   { vi: 'Đăng ký',       en: 'Sign up',        zh: '註冊' },
  'auth.email':          { vi: 'Email',         en: 'Email',          zh: '電子郵件' },
  'auth.password':       { vi: 'Mật khẩu',      en: 'Password',       zh: '密碼' },
  'auth.confirm':        { vi: 'Xác nhận mật khẩu', en: 'Confirm password', zh: '確認密碼' },
  'auth.name':           { vi: 'Họ và tên',     en: 'Full name',      zh: '姓名' },
  'auth.login.cta':      { vi: 'Đăng nhập',     en: 'Sign in',        zh: '登入' },
  'auth.signup.cta':     { vi: 'Tạo tài khoản', en: 'Create account', zh: '建立帳號' },
  'auth.no.account':     { vi: 'Chưa có tài khoản?', en: "Don't have an account?", zh: '還沒有帳號？' },
  'auth.has.account':    { vi: 'Đã có tài khoản?',en: 'Already have an account?', zh: '已經有帳號了？' },
  'auth.signup.free':    { vi: 'Đăng ký miễn phí', en: 'Sign up for free', zh: '免費註冊' },
  'auth.login.welcome':  { vi: 'Chào mừng trở lại! Hãy đăng nhập để tiếp tục.', en: 'Welcome back! Sign in to continue.', zh: '歡迎回來！請登入以繼續。' },
  'auth.signup.fast':    { vi: 'Chỉ mất 30 giây — bắt đầu quản lý tài chính ngay.', en: 'Takes only 30 seconds — start managing your finances now.', zh: '只需 30 秒 — 立即開始管理財務。' },
  'auth.side.login.h':   { vi: 'Tài chính khỏe mạnh<br>bắt đầu từ thói quen.', en: 'Healthy finances<br>start with habits.', zh: '健康的財務<br>始於良好的習慣。' },
  'auth.side.login.p':   { vi: 'Ghi chép mỗi ngày, đặt mục tiêu mỗi tháng, đạt được tự do tài chính từng năm.', en: 'Log daily, set monthly goals, reach financial freedom year by year.', zh: '每日記帳、每月設定目標，逐年實現財務自由。' },
  'auth.side.signup.h':  { vi: 'Bắt đầu hành trình<br>tài chính của bạn.', en: 'Start your<br>financial journey.', zh: '開啟您的<br>財務之旅。' },
  'auth.side.signup.p':  { vi: 'Miễn phí mãi mãi. Không thẻ tín dụng. Không quảng cáo.', en: 'Free forever. No credit card. No ads.', zh: '永久免費。免信用卡。無廣告。' },
  'auth.side.saving':    { vi: 'Tiết kiệm tháng này', en: 'Saved this month', zh: '本月儲蓄' },
  'auth.side.check.1':   { vi: 'Theo dõi không giới hạn giao dịch', en: 'Unlimited transaction tracking', zh: '無限制追蹤交易' },
  'auth.side.check.2':   { vi: 'Đặt mục tiêu & ngân sách', en: 'Set goals & budgets', zh: '設定目標與預算' },
  'auth.side.check.3':   { vi: 'Báo cáo trực quan', en: 'Visual reports', zh: '直觀報告' },
  'auth.side.check.4':   { vi: 'Dữ liệu lưu cục bộ, riêng tư tuyệt đối', en: 'Data stored locally, fully private', zh: '資料本機儲存，完全私密' },
  'auth.pw.show':        { vi: 'Hiện mật khẩu',  en: 'Show password',  zh: '顯示密碼' },
  'auth.pw.placeholder': { vi: 'Tối thiểu 6 ký tự', en: 'Minimum 6 characters', zh: '至少 6 個字元' },
  'auth.name.placeholder': { vi: 'Nguyễn Văn A', en: 'John Doe',       zh: '王小明' },
  'auth.login.doctitle': { vi: 'Đăng nhập — QLTC', en: 'Sign in — QLTC', zh: '登入 — QLTC' },
  'auth.signup.doctitle':{ vi: 'Đăng ký — QLTC',  en: 'Sign up — QLTC', zh: '註冊 — QLTC' },
  'auth.forgot':         { vi: 'Quên mật khẩu?', en: 'Forgot password?', zh: '忘記密碼？' },
  'auth.confirm.placeholder': { vi: 'Nhập lại mật khẩu', en: 'Re-enter password', zh: '再次輸入密碼' },
  'auth.err.email.required': { vi: 'Vui lòng nhập email', en: 'Please enter your email', zh: '請輸入電子郵件' },
  'auth.err.email.invalid':  { vi: 'Email không hợp lệ', en: 'Invalid email format', zh: '電子郵件格式無效' },
  'auth.err.password.required': { vi: 'Vui lòng nhập mật khẩu', en: 'Please enter your password', zh: '請輸入密碼' },
  'auth.err.password.short': { vi: 'Mật khẩu phải có ít nhất 6 ký tự', en: 'Password must be at least 6 characters', zh: '密碼至少需要 6 個字元' },
  'auth.err.name.required':  { vi: 'Vui lòng nhập họ và tên', en: 'Please enter your full name', zh: '請輸入姓名' },
  'auth.err.confirm.required':{ vi: 'Vui lòng xác nhận mật khẩu', en: 'Please confirm your password', zh: '請確認密碼' },
  'auth.err.confirm.mismatch':{ vi: 'Mật khẩu xác nhận không khớp', en: 'Passwords do not match', zh: '密碼不一致' },
  'auth.err.account.notfound':{ vi: 'Không tìm thấy tài khoản với email này', en: 'No account found with this email', zh: '找不到此電子郵件的帳號' },
  'auth.err.password.wrong': { vi: 'Mật khẩu không đúng', en: 'Incorrect password', zh: '密碼錯誤' },
  'auth.err.email.exists':   { vi: 'Email này đã có tài khoản. Hãy đăng nhập.', en: 'This email is already registered. Please sign in.', zh: '此電子郵件已註冊，請登入。' },
  'auth.ok.login':           { vi: 'Đăng nhập thành công, đang chuyển hướng...', en: 'Signed in! Redirecting...', zh: '登入成功，正在跳轉…' },
  'auth.ok.signup':          { vi: 'Tạo tài khoản thành công, đang chuyển hướng...', en: 'Account created! Redirecting...', zh: '帳號建立成功，正在跳轉…' },
  'auth.forgot.toast':       { vi: 'Tính năng đang được phát triển. Vui lòng liên hệ hỗ trợ.', en: 'Feature in development. Please contact support.', zh: '功能開發中，請聯絡客服。' },
};

export function getLang() {
  try { return localStorage.getItem(KEY) || DEFAULT_LANG; }
  catch { return DEFAULT_LANG; }
}

export function setLang(lang) {
  if (!LANGS[lang]) return;
  try { localStorage.setItem(KEY, lang); } catch {}
  document.documentElement.lang = LANGS[lang].htmlLang;
  // Reset explicit currency preference so it follows language until user picks one
  try { localStorage.removeItem(KEY_CURRENCY); } catch {}
  applyLang();
  window.dispatchEvent(new CustomEvent('lang-changed', { detail: lang }));
}

export function t(key) {
  const lang = getLang();
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.[DEFAULT_LANG] ?? key;
}

export function applyLang() {
  const lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const value = STRINGS[key]?.[lang];
    if (value == null) return;
    if (el.dataset.i18nHtml === 'true') el.innerHTML = value;
    else el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const attr = el.dataset.i18nAttr;
    const key = el.dataset.i18nKey;
    const value = STRINGS[key]?.[lang];
    if (value != null) el.setAttribute(attr, value);
  });
  // Convert amounts based on current currency (independent of language)
  const currency = getCurrency();
  document.querySelectorAll('[data-amount-vnd]').forEach(el => {
    const amount = parseFloat(el.dataset.amountVnd);
    if (isNaN(amount)) return;
    const sign = el.dataset.amountSign || '';
    el.textContent = sign + formatCurrency(amount, currency);
  });

  document.documentElement.lang = LANGS[lang]?.htmlLang || lang;
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

export function mountLangSwitch(container) {
  if (!container) return;

  function render() {
    const current = getLang();
    const currentLabel = LANGS[current]?.label || 'VI';
    container.innerHTML = `
      <button type="button" class="lang-btn" id="lang-btn" aria-label="Change language" aria-haspopup="menu" aria-expanded="false">
        <i data-lucide="globe"></i>
        <span class="lang-btn-code">${currentLabel}</span>
        <i data-lucide="chevron-down" class="lang-btn-chev"></i>
      </button>
      <div class="lang-menu" id="lang-menu" role="menu" hidden>
        ${Object.entries(LANGS).map(([code, l]) => `
          <button type="button" class="lang-menu-item ${code === current ? 'is-active' : ''}" data-lang="${code}" role="menuitemradio" aria-checked="${code === current}">
            <span class="lang-menu-code">${l.label}</span>
            <span class="lang-menu-name">${l.name}</span>
            ${code === current ? '<i data-lucide="check" class="lang-menu-check"></i>' : ''}
          </button>
        `).join('')}
      </div>
    `;
    if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }
  }

  render();

  const close = () => {
    const menu = container.querySelector('#lang-menu');
    const btn = container.querySelector('#lang-btn');
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  };

  container.addEventListener('click', (e) => {
    const trigger = e.target.closest('#lang-btn');
    if (trigger) {
      const menu = container.querySelector('#lang-menu');
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
      return;
    }
    const item = e.target.closest('[data-lang]');
    if (item) {
      setLang(item.dataset.lang);
      render();
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
