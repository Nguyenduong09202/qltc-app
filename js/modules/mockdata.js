// mockdata.js — seed data for first run
// Theme: du học sinh & lao động Việt Nam tại Đài Loan

const today = new Date();
const day = (offset) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString();
};

export const SEED = {
  version: 1,
  auth: {
    isLoggedIn: false,
    user: null,
    users: []
  },
  theme: 'light',
  preferences: { language: 'vi', currency: 'VND' },
  data: {
    categories: [
      // Expense
      { id: 'c1',  name: 'Ăn uống',         icon: 'utensils',       color: '#F59E0B', type: 'expense' },
      { id: 'c2',  name: 'Di chuyển',       icon: 'train-front',    color: '#0EA5E9', type: 'expense' },
      { id: 'c3',  name: 'Nhà ở & KTX',     icon: 'home',           color: '#8B5CF6', type: 'expense' },
      { id: 'c4',  name: 'Học tập',         icon: 'book-open',      color: '#4F46E5', type: 'expense' },
      { id: 'c5',  name: 'Sinh hoạt',       icon: 'receipt',        color: '#10B981', type: 'expense' },
      { id: 'c6',  name: 'Giải trí',        icon: 'film',           color: '#EC4899', type: 'expense' },
      { id: 'c7',  name: 'Sức khỏe',        icon: 'heart-pulse',    color: '#DC2626', type: 'expense' },
      { id: 'c11', name: 'Gửi về VN',       icon: 'send',           color: '#F97316', type: 'expense' },
      { id: 'c12', name: 'Mua sắm',         icon: 'shopping-bag',   color: '#A855F7', type: 'expense' },
      // Income
      { id: 'c8',  name: 'Gia đình gửi',    icon: 'heart',          color: '#16A34A', type: 'income' },
      { id: 'c9',  name: 'Làm thêm',        icon: 'briefcase',      color: '#22C55E', type: 'income' },
      { id: 'c10', name: 'Học bổng',        icon: 'graduation-cap', color: '#0EA5E9', type: 'income' },
      { id: 'c13', name: 'Lương chính',     icon: 'building-2',     color: '#059669', type: 'income' },
      { id: 'c14', name: 'OT / Ca đêm',     icon: 'moon-star',      color: '#84CC16', type: 'income' }
    ],
    wallets: [
      { id: 'w1', name: 'Tiền mặt Đài Bắc',     type: 'cash',     balance: 3200000,  currency: 'VND', icon: 'wallet',       color: '#16A34A' },
      { id: 'w2', name: 'Ngân hàng Đài Loan',   type: 'bank',     balance: 28400000, currency: 'VND', icon: 'landmark',     color: '#4F46E5' },
      { id: 'w3', name: 'EasyCard / 悠遊卡',     type: 'e-wallet', balance: 520000,   currency: 'VND', icon: 'train-front',  color: '#EC4899' },
      { id: 'w4', name: 'LINE Pay',             type: 'e-wallet', balance: 1850000,  currency: 'VND', icon: 'smartphone',   color: '#06C755' },
      { id: 'w5', name: 'Bưu điện 郵局',         type: 'bank',     balance: 9600000,  currency: 'VND', icon: 'mail',         color: '#DC2626' }
    ],
    transactions: [
      // ----- Income (du học sinh + lao động) -----
      { id: 't1',  type: 'income',  amount: 18500000, walletId: 'w2', categoryId: 'c13', date: day(1),  note: 'Lương xưởng điện tử Hsinchu tháng này' },
      { id: 't2',  type: 'income',  amount: 4200000,  walletId: 'w2', categoryId: 'c14', date: day(2),  note: 'OT 3 ca đêm cuối tháng' },
      { id: 't3',  type: 'income',  amount: 8000000,  walletId: 'w2', categoryId: 'c8',  date: day(4),  note: 'Mẹ gửi tiền hỗ trợ học phí' },
      { id: 't4',  type: 'income',  amount: 3200000,  walletId: 'w1', categoryId: 'c9',  date: day(6),  note: 'Làm thêm quán Việt Nam ở Zhongshan' },
      { id: 't5',  type: 'income',  amount: 6500000,  walletId: 'w2', categoryId: 'c10', date: day(15), note: 'Học bổng kỳ này — 教育部 sinh viên quốc tế' },
      { id: 't6',  type: 'income',  amount: 2400000,  walletId: 'w2', categoryId: 'c14', date: day(18), note: 'Phụ cấp đêm khuya tuần trước' },

      // ----- Expense: Ăn uống -----
      { id: 't7',  type: 'expense', amount: 85000,    walletId: 'w1', categoryId: 'c1',  date: day(0),  note: 'Cơm hộp 便當 trước giờ vào ca' },
      { id: 't8',  type: 'expense', amount: 65000,    walletId: 'w4', categoryId: 'c1',  date: day(0),  note: 'Mì gói 7-Eleven cuối ca đêm' },
      { id: 't9',  type: 'expense', amount: 320000,   walletId: 'w1', categoryId: 'c1',  date: day(2),  note: 'Lẩu Đài cuối tuần với bạn cùng phòng' },
      { id: 't10', type: 'expense', amount: 145000,   walletId: 'w1', categoryId: 'c1',  date: day(3),  note: 'Cơm gà Hải Nam ở chợ đêm Shilin' },
      { id: 't11', type: 'expense', amount: 95000,    walletId: 'w4', categoryId: 'c1',  date: day(5),  note: 'Cà phê + bánh sáng trước ca' },
      { id: 't12', type: 'expense', amount: 180000,   walletId: 'w1', categoryId: 'c1',  date: day(8),  note: 'Trà sữa 50嵐 và đồ ăn vặt' },
      { id: 't13', type: 'expense', amount: 240000,   walletId: 'w1', categoryId: 'c1',  date: day(11), note: 'Bún bò Huế ở quán Việt Nam Đào Viên' },
      { id: 't14', type: 'expense', amount: 410000,   walletId: 'w2', categoryId: 'c1',  date: day(14), note: 'Tiệc sinh nhật bạn ở Ximending' },

      // ----- Expense: Di chuyển -----
      { id: 't15', type: 'expense', amount: 56000,    walletId: 'w3', categoryId: 'c2',  date: day(0),  note: 'MRT đi làm — Jiantan → Hsinchu' },
      { id: 't16', type: 'expense', amount: 380000,   walletId: 'w3', categoryId: 'c2',  date: day(4),  note: 'Nạp EasyCard 2 tuần' },
      { id: 't17', type: 'expense', amount: 720000,   walletId: 'w2', categoryId: 'c2',  date: day(9),  note: 'Vé HSR về Đài Trung thăm anh họ' },
      { id: 't18', type: 'expense', amount: 95000,    walletId: 'w3', categoryId: 'c2',  date: day(13), note: 'Bus liên tỉnh đi phỏng vấn' },

      // ----- Expense: Nhà ở -----
      { id: 't19', type: 'expense', amount: 5800000,  walletId: 'w2', categoryId: 'c3',  date: day(1),  note: 'Tiền thuê phòng tháng này' },
      { id: 't20', type: 'expense', amount: 1200000,  walletId: 'w2', categoryId: 'c5',  date: day(2),  note: 'Điện, nước, gas + WiFi căn hộ' },

      // ----- Expense: Học tập -----
      { id: 't21', type: 'expense', amount: 850000,   walletId: 'w2', categoryId: 'c4',  date: day(10), note: 'Mua sách giáo trình tiếng Trung TOCFL' },
      { id: 't22', type: 'expense', amount: 1500000,  walletId: 'w2', categoryId: 'c4',  date: day(20), note: 'Phí thi chứng chỉ TOCFL B1' },

      // ----- Expense: Sinh hoạt -----
      { id: 't23', type: 'expense', amount: 480000,   walletId: 'w4', categoryId: 'c5',  date: day(6),  note: 'Mua đồ ăn tuần ở Carrefour' },
      { id: 't24', type: 'expense', amount: 320000,   walletId: 'w1', categoryId: 'c5',  date: day(12), note: 'Bột giặt, kem đánh răng, dầu gội' },
      { id: 't25', type: 'expense', amount: 540000,   walletId: 'w2', categoryId: 'c5',  date: day(19), note: 'Áo khoác mùa lạnh — mùa đông Đài Bắc' },

      // ----- Expense: Giải trí + Mua sắm -----
      { id: 't26', type: 'expense', amount: 280000,   walletId: 'w1', categoryId: 'c6',  date: day(7),  note: 'Karaoke 錢櫃 với hội đồng hương' },
      { id: 't27', type: 'expense', amount: 350000,   walletId: 'w4', categoryId: 'c6',  date: day(16), note: 'Vé xem hoà nhạc Đài Bắc Arena' },
      { id: 't28', type: 'expense', amount: 920000,   walletId: 'w4', categoryId: 'c12', date: day(22), note: 'Giày Adidas sale ở Shilin' },
      { id: 't29', type: 'expense', amount: 460000,   walletId: 'w2', categoryId: 'c12', date: day(25), note: 'Mua quà Tết gửi gia đình về VN' },

      // ----- Expense: Sức khỏe -----
      { id: 't30', type: 'expense', amount: 580000,   walletId: 'w2', categoryId: 'c7',  date: day(17), note: 'Khám tổng quát ở 馬偕醫院' },
      { id: 't31', type: 'expense', amount: 240000,   walletId: 'w1', categoryId: 'c7',  date: day(24), note: 'Thuốc cảm + vitamin Watsons' },

      // ----- Expense: Gửi về VN -----
      { id: 't32', type: 'expense', amount: 8500000,  walletId: 'w2', categoryId: 'c11', date: day(5),  note: 'Gửi tiền cho mẹ trả tiền học cho em' },
      { id: 't33', type: 'expense', amount: 4000000,  walletId: 'w5', categoryId: 'c11', date: day(28), note: 'Gửi tiền sinh hoạt cho gia đình tháng trước' },

      // ----- Vài giao dịch tháng trước để có so sánh -----
      { id: 't34', type: 'income',  amount: 17800000, walletId: 'w2', categoryId: 'c13', date: day(32), note: 'Lương tháng trước' },
      { id: 't35', type: 'expense', amount: 5800000,  walletId: 'w2', categoryId: 'c3',  date: day(32), note: 'Tiền thuê phòng tháng trước' },
      { id: 't36', type: 'expense', amount: 1180000,  walletId: 'w2', categoryId: 'c5',  date: day(33), note: 'Hoá đơn điện nước tháng trước' },
      { id: 't37', type: 'expense', amount: 7500000,  walletId: 'w2', categoryId: 'c11', date: day(35), note: 'Gửi về VN tháng trước' }
    ],
    goals: [
      { id: 'g1', name: 'Quỹ khẩn cấp 6 tháng',        targetAmount: 60000000, currentAmount: 24500000, deadline: '2027-06-30', icon: 'shield',     color: '#4F46E5', note: 'Đề phòng mất việc hoặc về VN gấp' },
      { id: 'g2', name: 'Về Việt Nam ăn Tết',           targetAmount: 18000000, currentAmount: 11200000, deadline: '2027-01-20', icon: 'plane',      color: '#0EA5E9', note: 'Vé máy bay + quà Tết cho gia đình' },
      { id: 'g3', name: 'Mua xe máy ở Việt Nam',        targetAmount: 45000000, currentAmount: 14800000, deadline: '2027-08-01', icon: 'bike',       color: '#EC4899', note: 'Xe đi làm khi về nước' },
      { id: 'g4', name: 'Học phí kỳ tới',               targetAmount: 32000000, currentAmount: 18000000, deadline: '2026-09-01', icon: 'book-open',  color: '#F59E0B', note: 'Học phí + sách + sinh hoạt một học kỳ' },
      { id: 'g5', name: 'Vốn mở quán cà phê Việt ở VN', targetAmount: 250000000, currentAmount: 38000000, deadline: '2029-12-31', icon: 'coffee',     color: '#16A34A', note: 'Mơ ước dài hạn — mở quán nhỏ ở Đà Nẵng' }
    ],
    budgets: [
      { id: 'b1', categoryId: 'c1',  period: 'monthly', limit: 5500000, startDate: day(30) },
      { id: 'b2', categoryId: 'c2',  period: 'monthly', limit: 1500000, startDate: day(30) },
      { id: 'b3', categoryId: 'c3',  period: 'monthly', limit: 6000000, startDate: day(30) },
      { id: 'b4', categoryId: 'c4',  period: 'monthly', limit: 2500000, startDate: day(30) },
      { id: 'b5', categoryId: 'c5',  period: 'monthly', limit: 2500000, startDate: day(30) },
      { id: 'b6', categoryId: 'c11', period: 'monthly', limit: 10000000, startDate: day(30) },
      { id: 'b7', categoryId: 'c12', period: 'monthly', limit: 1500000, startDate: day(30) }
    ]
  }
};
