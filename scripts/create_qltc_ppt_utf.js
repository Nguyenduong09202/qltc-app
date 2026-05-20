const fs = require('fs');
const path = require('path');

const ps = String.raw`
$ErrorActionPreference = 'Stop'
$out = Join-Path (Get-Location) 'Bao_cao_website_QLTC.pptx'
$brand = Join-Path (Get-Location) 'assets\images\brand.png'
$teamDir = Join-Path (Get-Location) 'assets\images\team'

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $pp.Presentations.Add()
$pres.PageSetup.SlideWidth = 1366
$pres.PageSetup.SlideHeight = 768

$blank = 12
$font = 'Arial'
$primary = 0xE5464F
$dark = 0x2A170F
$muted = 0x806B55
$line = 0xE8DFD7
$green = 0x4AA316
$orange = 0x0B95F5
$blue = 0xE9A50E

function Add-Slide($title, $subtitle = '') {
  $slide = $pres.Slides.Add($pres.Slides.Count + 1, $blank)
  $slide.FollowMasterBackground = $false
  $slide.Background.Fill.ForeColor.RGB = 0xFAF9F7
  if ($title) {
    $box = $slide.Shapes.AddTextbox(1, 56, 42, 980, 72)
    $box.TextFrame.TextRange.Text = $title
    $box.TextFrame.TextRange.Font.Name = $font
    $box.TextFrame.TextRange.Font.Size = 34
    $box.TextFrame.TextRange.Font.Bold = $true
    $box.TextFrame.TextRange.Font.Color.RGB = $dark
  }
  if ($subtitle) {
    $sub = $slide.Shapes.AddTextbox(1, 58, 105, 980, 44)
    $sub.TextFrame.TextRange.Text = $subtitle
    $sub.TextFrame.TextRange.Font.Name = $font
    $sub.TextFrame.TextRange.Font.Size = 15
    $sub.TextFrame.TextRange.Font.Color.RGB = $muted
  }
  return $slide
}

function Add-Text($slide, $text, $x, $y, $w, $h, $size = 18, $color = $dark, $bold = $false) {
  $shape = $slide.Shapes.AddTextbox(1, $x, $y, $w, $h)
  $shape.TextFrame.TextRange.Text = $text
  $shape.TextFrame.TextRange.Font.Name = $font
  $shape.TextFrame.TextRange.Font.Size = $size
  $shape.TextFrame.TextRange.Font.Color.RGB = $color
  $shape.TextFrame.TextRange.Font.Bold = $bold
  $shape.TextFrame.MarginLeft = 8
  $shape.TextFrame.MarginRight = 8
  $shape.TextFrame.MarginTop = 4
  $shape.TextFrame.MarginBottom = 4
  return $shape
}

function Add-Card($slide, $x, $y, $w, $h, $title, $body, $accent = $primary) {
  $card = $slide.Shapes.AddShape(5, $x, $y, $w, $h)
  $card.Fill.ForeColor.RGB = 0xFFFFFF
  $card.Line.ForeColor.RGB = $line
  $card.Line.Weight = 1
  $card.Adjustments.Item(1) = 0.08
  $bar = $slide.Shapes.AddShape(1, $x, $y, 8, $h)
  $bar.Fill.ForeColor.RGB = $accent
  $bar.Line.Visible = $false
  Add-Text $slide $title ($x + 24) ($y + 20) ($w - 40) 32 19 $dark $true | Out-Null
  Add-Text $slide $body ($x + 24) ($y + 58) ($w - 46) ($h - 70) 14 $muted $false | Out-Null
}

function Add-Bullets($slide, $items, $x, $y, $w, $h, $size = 18) {
  $text = ($items | ForEach-Object { "• $_" }) -join ([string][char]13)
  $shape = Add-Text $slide $text $x $y $w $h $size $dark $false
  $shape.TextFrame.TextRange.ParagraphFormat.SpaceAfter = 8
  return $shape
}

function Add-Footer($slide, $num) {
  Add-Text $slide 'QLTC · 第七組 · 行動網頁設計實作' 56 724 700 24 11 $muted $false | Out-Null
  Add-Text $slide $num 1260 724 60 24 11 $muted $false | Out-Null
}

$s = Add-Slide '' ''
$s.Background.Fill.ForeColor.RGB = 0xFFFFFF
if (Test-Path $brand) { $s.Shapes.AddPicture($brand, $false, $true, 56, 42, 210, 72) | Out-Null }
Add-Text $s 'BÁO CÁO WEBSITE QLTC' 56 190 900 70 42 $dark $true | Out-Null
Add-Text $s 'Quản lý tài chính cá nhân cho sinh viên Việt tại Đài Bắc' 58 265 860 42 22 $muted $false | Out-Null
Add-Text $s '第七組 · 臺北城市科技大學 · 行動網頁設計實作' 58 322 760 32 18 $primary $true | Out-Null
Add-Card $s 870 170 390 240 'Thông điệp chính' 'QLTC giúp người dùng trả lời câu hỏi: “Tiền của mình đã đi đâu?” bằng một luồng ghi chép đơn giản, báo cáo trực quan và dữ liệu lưu cục bộ.' $primary
Add-Footer $s '01'

$s = Add-Slide 'Nội dung báo cáo' 'Bố cục trình bày theo hành trình từ vấn đề đến sản phẩm.'
Add-Card $s 70 170 360 150 '1. Bối cảnh & vấn đề' 'Vì sao nhóm chọn đề tài quản lý chi tiêu cá nhân cho sinh viên.' $primary
Add-Card $s 500 170 360 150 '2. Giải pháp QLTC' 'Luồng sử dụng, chức năng chính và dữ liệu demo.' $green
Add-Card $s 930 170 360 150 '3. Kỹ thuật triển khai' 'HTML, CSS, JavaScript, localStorage, Chart.js, responsive.' $blue
Add-Card $s 285 390 360 150 '4. Đánh giá' 'Điểm mạnh, hạn chế, phản hồi thử nghiệm.' $orange
Add-Card $s 720 390 360 150 '5. Hướng phát triển' 'Backend, bảo mật, đa tiền tệ, xuất báo cáo, song ngữ.' $primary
Add-Footer $s '02'

$s = Add-Slide 'Bối cảnh thực tế' 'Website xuất phát từ chính nhu cầu của sinh viên sống xa nhà.'
Add-Bullets $s @(
  'Sinh viên Việt ở Đài Bắc phải tự quản lý tiền sinh hoạt, học phí, KTX, đi lại và ăn uống.',
  'Nhiều khoản nhỏ như MRT, 7-Eleven, trà sữa, in tài liệu dễ bị quên khi tổng kết cuối tháng.',
  'Excel linh hoạt nhưng rườm rà; một số app tài chính có quảng cáo hoặc danh mục chưa gần với thói quen người Việt.',
  'Nhóm chọn đề tài này vì vấn đề đủ gần, đủ thật và có thể demo rõ trong phạm vi đồ án.'
) 86 175 1100 360 22 | Out-Null
Add-Card $s 870 515 380 120 'Câu hỏi trung tâm' 'Làm sao để người mới biết tiền đi đâu mà không cần học quá nhiều thuật ngữ tài chính?' $primary
Add-Footer $s '03'

$s = Add-Slide 'Mục tiêu sản phẩm' 'QLTC tập trung vào thói quen ghi chép và đọc hiểu số liệu.'
Add-Card $s 70 170 360 190 'Dễ bắt đầu' 'Đăng ký nhanh, có dữ liệu mẫu, giao diện rõ ràng và các trang được tách theo nhiệm vụ.' $primary
Add-Card $s 500 170 360 190 'Dễ duy trì' 'Ghi giao dịch trong vài giây, phân loại theo ví và danh mục quen thuộc.' $green
Add-Card $s 930 170 360 190 'Dễ điều chỉnh' 'Dashboard, ngân sách, mục tiêu và báo cáo giúp người dùng biết nên cắt giảm ở đâu.' $blue
Add-Text $s 'Kết quả mong muốn: người dùng hình thành thói quen xem lại tài chính mỗi tuần/tháng thay vì chỉ “ước lượng trong đầu”.' 110 455 1120 70 24 $dark $true | Out-Null
Add-Footer $s '04'

$s = Add-Slide 'Người dùng mục tiêu' 'Thiết kế ưu tiên sinh viên và người mới quản lý tài chính.'
Add-Card $s 80 160 360 230 'Sinh viên Việt' 'Cần theo dõi tiền gia đình gửi, học phí, ăn uống, KTX, mua sắm và đi lại.' $primary
Add-Card $s 505 160 360 230 'Du học sinh tại Đài Bắc' 'Có thêm ngữ cảnh EasyCard, MRT, sinh hoạt KTX, làm thêm, học bổng.' $green
Add-Card $s 930 160 360 230 'Người mới bắt đầu' 'Không cần mô hình tài chính phức tạp; chỉ cần biết nhập ở đâu và đọc kết quả thế nào.' $blue
Add-Text $s 'Insight: người dùng không thiếu ý định quản lý tiền; họ thiếu một công cụ đủ nhanh và đủ dễ để dùng mỗi ngày.' 92 465 1080 58 23 $dark $true | Out-Null
Add-Footer $s '05'

$s = Add-Slide 'Luồng sử dụng chính' 'Từ đăng ký đến đọc báo cáo trong khoảng 5 phút.'
$steps = @(
  @('1', 'Tạo tài khoản', 'Nhập tên, email, mật khẩu; app tạo trạng thái đăng nhập cục bộ.'),
  @('2', 'Thêm tài khoản', 'Khai báo tiền mặt, ngân hàng, EasyCard hoặc ví đang dùng.'),
  @('3', 'Ghi giao dịch', 'Chọn Thu/Chi, số tiền, danh mục, tài khoản và ghi chú.'),
  @('4', 'Đặt ngân sách', 'Giới hạn chi tiêu theo ăn uống, đi lại, học tập, sinh hoạt.'),
  @('5', 'Đọc báo cáo', 'Xem xu hướng, danh mục vượt mức và tiến độ mục tiêu.')
)
$x=60
foreach ($st in $steps) {
  $circle = $s.Shapes.AddShape(9, $x, 205, 68, 68)
  $circle.Fill.ForeColor.RGB = $primary
  $circle.Line.Visible = $false
  Add-Text $s $st[0] ($x+20) 218 30 30 24 0xFFFFFF $true | Out-Null
  Add-Text $s $st[1] ($x-20) 300 170 32 18 $dark $true | Out-Null
  Add-Text $s $st[2] ($x-20) 340 190 92 13 $muted $false | Out-Null
  if ($x -lt 1040) {
    $lineShape = $s.Shapes.AddShape(1, ($x+86), 238, 118, 4)
    $lineShape.Fill.ForeColor.RGB = $line
    $lineShape.Line.Visible = $false
  }
  $x += 250
}
Add-Footer $s '06'

$s = Add-Slide 'Chức năng chính' 'Các chức năng đã xây theo từng nhu cầu quản lý tài chính cá nhân.'
Add-Card $s 70 150 300 150 'Dashboard' 'Tổng tài sản, thu tháng này, chi tháng này, tiết kiệm ròng, biểu đồ 30 ngày.' $primary
Add-Card $s 395 150 300 150 'Giao dịch' 'Thêm, sửa, xoá, phân loại thu/chi theo danh mục và tài khoản.' $green
Add-Card $s 720 150 300 150 'Tài khoản' 'Quản lý tiền mặt, ngân hàng, EasyCard/ví điện tử và số dư.' $blue
Add-Card $s 1045 150 250 150 'Ngân sách' 'Đặt hạn mức chi theo danh mục.' $orange
Add-Card $s 225 370 360 150 'Mục tiêu' 'Theo dõi quỹ khẩn cấp, vé về Việt Nam, laptop làm đồ án.' $primary
Add-Card $s 640 370 360 150 'Báo cáo' 'Phân tích thu chi, cơ cấu chi tiêu và xu hướng theo thời gian.' $green
Add-Footer $s '07'

$s = Add-Slide 'Dữ liệu demo đã Việt hoá theo Đài Bắc' 'Dữ liệu mẫu giúp người xem hiểu ngay ngữ cảnh sử dụng.'
Add-Bullets $s @(
  'Ví: Tiền mặt Đài Bắc, Ngân hàng Đài Loan, EasyCard / 悠遊卡.',
  'Thu nhập: Gia đình gửi, làm thêm quán cà phê, học bổng hỗ trợ sinh viên quốc tế.',
  'Chi tiêu: KTX, MRT/bus, cơm hộp Shilin, 7-Eleven, giáo trình tiếng Trung, SIM/internet.',
  'Mục tiêu: quỹ khẩn cấp ở Đài Bắc, về Việt Nam nghỉ hè, laptop làm đồ án.',
  'Ngân sách: ăn uống, di chuyển, KTX & nhà ở, học tập, sinh hoạt.'
) 88 165 1120 380 22 | Out-Null
Add-Footer $s '08'

$s = Add-Slide 'Landing page' 'Trang giới thiệu được xây để người xem hiểu sản phẩm trước khi vào app.'
Add-Card $s 75 160 360 190 'Hero & Tính năng' 'Giới thiệu giá trị chính và các module quan trọng của QLTC.' $primary
Add-Card $s 500 160 360 190 'Cách hoạt động' 'Timeline 5 bước: đăng ký, thêm ví, ghi giao dịch, đặt ngân sách, đọc báo cáo.' $green
Add-Card $s 925 160 360 190 'Câu chuyện & Đội ngũ' 'Trình bày lý do xây sản phẩm, nguyên tắc thiết kế, feedback và thành viên nhóm.' $blue
Add-Text $s 'Đã chỉnh scroll-margin-top để khi bấm #how, #testimonials, #team tiêu đề không bị navbar che.' 98 435 1080 60 22 $dark $true | Out-Null
Add-Footer $s '09'

$s = Add-Slide 'Công nghệ sử dụng' 'Ứng dụng web tĩnh, dễ chạy cục bộ, không phụ thuộc backend.'
Add-Card $s 70 150 300 165 'HTML5' 'Cấu trúc các trang: landing, auth, dashboard, giao dịch, báo cáo, cài đặt.' $primary
Add-Card $s 395 150 300 165 'CSS3' 'Design tokens, layout responsive, component, dark mode, landing page.' $green
Add-Card $s 720 150 300 165 'JavaScript Modules' 'Store, router, shell, charts, formatter, UI modal/toast.' $blue
Add-Card $s 1045 150 250 165 'localStorage' 'Lưu dữ liệu demo và trạng thái đăng nhập trên trình duyệt.' $orange
Add-Card $s 270 390 360 150 'Chart.js' 'Biểu đồ xu hướng thu chi và cơ cấu danh mục.' $primary
Add-Card $s 735 390 360 150 'Lucide Icons' 'Icon thống nhất cho nav, card, form và hành động.' $green
Add-Footer $s '10'

$s = Add-Slide 'Cấu trúc mã nguồn' 'Dự án được tách theo trang, module và CSS chuyên biệt.'
Add-Bullets $s @(
  'HTML pages: index, signup, login, dashboard, transactions, budgets, goals, reports, accounts, settings.',
  'CSS: base.css chứa token; components.css chứa button/card/form/toast; layout.css chứa shell app; pages/*.css cho từng màn hình.',
  'JS modules: store, storage, router, shell, charts, format, icons, ui, mockdata.',
  'JS pages: mỗi trang có file xử lý riêng để giữ phạm vi rõ ràng và dễ bảo trì.',
  'Server: Node.js static server phục vụ file cục bộ tại localhost.'
) 90 165 1120 390 21 | Out-Null
Add-Footer $s '11'

$s = Add-Slide 'Đăng nhập và dữ liệu' 'Luồng auth phù hợp demo đồ án, không dùng backend thật.'
Add-Card $s 80 150 360 190 'Đăng ký' 'Tạo tài khoản demo, lưu user vào localStorage và chuyển tới dashboard.' $primary
Add-Card $s 505 150 360 190 'Đăng nhập' 'Kiểm tra email/mật khẩu đã đăng ký trong dữ liệu cục bộ.' $green
Add-Card $s 930 150 360 190 'Bảo vệ trang' 'router.requireAuth() chuyển người chưa đăng nhập về login.html.' $blue
Add-Text $s 'Lưu ý: đây là cơ chế demo. Nếu triển khai thật cần backend, hash mật khẩu, session/token và chính sách bảo mật dữ liệu.' 100 430 1080 70 22 $dark $true | Out-Null
Add-Footer $s '12'

$s = Add-Slide 'Điểm mạnh hiện tại' 'Những điểm giúp website phù hợp để demo và trình bày đồ án.'
Add-Bullets $s @(
  'Luồng sản phẩm đầy đủ: landing → auth → dashboard → giao dịch → ngân sách → mục tiêu → báo cáo.',
  'Giao diện nhất quán, có dark mode và responsive cơ bản.',
  'Dữ liệu demo sát bối cảnh sinh viên Việt tại Đài Bắc.',
  'Không cần backend, dễ chạy trong lớp hoặc trên máy cá nhân.',
  'Landing page có câu chuyện thật, nguyên tắc thiết kế và phần đội ngũ rõ ràng.'
) 88 165 1120 380 22 | Out-Null
Add-Footer $s '13'

$s = Add-Slide 'Hạn chế' 'Các điểm cần nói rõ khi trình bày để tránh kỳ vọng sai.'
Add-Card $s 80 150 360 180 'Chưa có backend thật' 'Dữ liệu chỉ nằm trên trình duyệt, chưa đồng bộ giữa thiết bị.' $primary
Add-Card $s 505 150 360 180 'Auth chỉ là demo' 'Mật khẩu chưa được hash/mã hoá, chưa có session hoặc xác thực server.' $orange
Add-Card $s 930 150 360 180 'Đa tiền tệ chưa hoàn chỉnh' 'Dữ liệu đã theo bối cảnh Đài Bắc nhưng formatter vẫn ưu tiên VND.' $blue
Add-Card $s 290 390 360 160 'Social login chưa hoạt động' 'Google/Facebook mới là nút giao diện, chưa tích hợp OAuth.' $green
Add-Card $s 720 390 360 160 'Báo cáo còn cơ bản' 'Chưa có xuất PDF/Excel hoặc phân tích dự báo chi tiêu.' $primary
Add-Footer $s '14'

$s = Add-Slide 'Hướng phát triển' 'Những cải tiến có thể làm sau bản demo.'
Add-Bullets $s @(
  'Xây backend thật: user, transaction, wallet, budget, goal API.',
  'Hash mật khẩu, xác thực bằng token/session, phân quyền dữ liệu theo user.',
  'Hỗ trợ TWD/VND linh hoạt và quy đổi tỷ giá.',
  'Xuất báo cáo PDF/Excel và import dữ liệu từ file CSV.',
  'Hoàn thiện song ngữ Việt - Trung cho toàn bộ giao diện.',
  'Tối ưu mobile và thêm onboarding cho người dùng mới.'
) 90 165 1120 390 22 | Out-Null
Add-Footer $s '15'

$s = Add-Slide 'Đội ngũ 第七組' '4 du học sinh Việt Nam tại Đài Bắc, cùng xây sản phẩm trong hơn 3 tháng.'
$members = @(
  @('member-1.jpg','范氏燕 / Phạm Thị Yến','Trưởng nhóm · timeline · tài liệu demo'),
  @('member-2.jpg','杜銀河 / Đỗ Ngân Hà','UI/UX · wireframe · responsive'),
  @('member-3.jpg','阮氏瓊裝 / Nguyễn Thị Quỳnh Trang','Front-end · dashboard · giao dịch'),
  @('member-4.jpg','阮氏俊 / Nguyễn Thị Tuấn','Data logic · ngân sách · kiểm thử')
)
$x = 80
foreach ($m in $members) {
  $img = Join-Path $teamDir $m[0]
  if (Test-Path $img) { $s.Shapes.AddPicture($img, $false, $true, $x, 165, 180, 180) | Out-Null }
  Add-Text $s $m[1] $x 365 240 48 17 $dark $true | Out-Null
  Add-Text $s $m[2] $x 420 240 62 14 $muted $false | Out-Null
  $x += 315
}
Add-Card $s 210 560 920 90 'Kết luận' 'QLTC là một website quản lý tài chính cá nhân đủ hoàn chỉnh để demo: có câu chuyện, có dữ liệu sát thực tế, có luồng sử dụng rõ và có nền tảng kỹ thuật dễ mở rộng.' $primary
Add-Footer $s '16'

$pres.SaveAs($out)
$pres.Close()
$pp.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pres) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp) | Out-Null
Write-Output "Created: $out"
`;

const target = path.join(process.cwd(), 'scripts', 'create_qltc_ppt_utf.ps1');
fs.writeFileSync(target, '\ufeff' + ps, 'utf16le');
console.log(target);
