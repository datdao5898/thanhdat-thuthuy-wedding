# Bản đồ dự án — thiệp cưới Thu Thủy & Thành Đạt

> Mục đích của tài liệu này: giúp một người hoặc AI mới có thể hiểu, sửa và triển khai dự án sau khi thư mục bị di chuyển hoặc mất ngữ cảnh trò chuyện.

## 1. Tổng quan

Đây là website thiệp mời cưới một trang (single-page landing page) cho **Thu Thủy và Thành Đạt**. Hôn lễ được cử hành lúc **08:45, Chủ nhật ngày 20/09/2026** tại **Hội Thánh Tin Lành Thạnh Mỹ**.

Dự án dùng HTML, CSS và JavaScript thuần; không có `package.json`, framework, trình biên dịch hoặc bước build. Có thể mở `index.html` để xem giao diện, nhưng phần sổ lời chúc cần chạy qua HTTP(S) để `fetch` hoạt động ổn định.

Các tính năng chính:

- Màn phong bì mở thiệp khi URL có tên khách mời, ví dụ `/?name=Nguyen%20Van%20A`.
- Nội dung thiệp, thông tin ngày cưới, bộ ảnh dạng carousel/lightbox.
- Section hành trình từ bé đến lớn với hai ảnh tuổi thơ; ngay sau đó là section ảnh cưới demo độc lập, tràn toàn bộ chiều rộng và dùng nền `fixed` tạo hiệu ứng parallax trên desktop.
- Collage ảnh cưới bất đối xứng, countdown thời gian thực đến ngày 20/09/2026.
- Wedding information gồm ảnh, lịch tháng 9/2026 và bản đồ Google Maps.
- Section lời chúc đặt trước quà mừng: form gửi lời chúc đặt cạnh sổ lưu bút; dữ liệu chung được lưu trong Google Sheets.
- Section quà mừng riêng phía sau: chọn tài khoản cô dâu/chú rể, QR và nút sao chép số tài khoản.
- Tôn trọng `prefers-reduced-motion`, hỗ trợ đóng modal bằng Escape và có ảnh/slider dự phòng khi CDN hoặc ảnh cục bộ lỗi.
- Sau khi phong bì mở, `.site-shell` phải trả `will-change` về `auto`; nếu giữ `will-change: transform`, Chrome sẽ làm nền `fixed` của section ảnh cưới cuộn theo trang.

## 2. Cấu trúc thư mục hiện tại

```text
.
├── index.html              # Toàn bộ markup và nội dung của thiệp
├── style.css               # Thiết kế responsive, animation, modal, carousel
├── script.js               # Tất cả hành vi phía trình duyệt
├── config.js               # Cấu hình URL lưu lời chúc ở môi trường thật
├── images/                 # Bộ ảnh cưới, tuổi thơ và QR demo cục bộ
│   ├── wedding-1.jpg … wedding-4.jpg
│   ├── childhood-groom.jpg, childhood-bride.jpg
│   └── qr-bride.png, qr-groom.png
├── data/
│   └── wishes.json         # Dữ liệu lời chúc mẫu/dự phòng, chỉ đọc
├── apps-script/
│   ├── wishes.gs           # Backend Google Apps Script (khuyến nghị dùng)
│   └── README.md           # Hướng dẫn deploy Apps Script
├── api/
│   ├── wishes.js           # Backend Node serverless thay thế
│   └── README.md           # Hướng dẫn cấu hình service account
└── fonts/                  # Có thư mục nhưng snapshot hiện không có font nào được dùng
```

`.git/`, `.agents/` và `.codex/` là dữ liệu Git/công cụ, không thuộc mã chạy của website.

## 3. Điểm vào và thứ tự tải

`index.html` là entry point. Gần cuối trang, trình duyệt tải theo thứ tự:

1. Splide 4.1.4 từ jsDelivr (carousel).
2. Lenis 1.3.13 từ jsDelivr (cuộn mượt).
3. `config.js` (biến cấu hình toàn cục).
4. `script.js` (khởi tạo toàn bộ tương tác sau `DOMContentLoaded`).

Google Fonts được tải từ `fonts.googleapis.com`: Be Vietnam Pro, Cormorant Garamond và Dancing Script.

Nếu các CDN không tải được, slider vẫn có carousel tối giản bằng JavaScript. Nếu Lenis không tồn tại, trang vẫn dùng cuộn mặc định.

## 4. Các phần giao diện và nơi sửa

| Nhu cầu | Nơi sửa chính | Ghi chú |
| --- | --- | --- |
| Tên cặp đôi, ngày cưới, văn bản, giờ/địa điểm, link Maps | `index.html` | Hôn lễ: `08:45, 20/09/2026` tại `Hội Thánh Tin Lành Thạnh Mỹ`; bản đồ dùng tọa độ `11.754594317329847, 108.52743919838332`. |
| Tên chủ tài khoản, số tài khoản, tên ngân hàng, đường dẫn QR | đầu `script.js` trong `bankAccounts` | Hiện số tài khoản và tên ngân hàng là placeholder. |
| Ảnh cưới | `images/wedding-1.jpg` đến `images/wedding-4.jpg` | Đang có ảnh demo cục bộ, dùng cho hero, collage, wedding information và gallery. Các ảnh tự dự phòng chéo nếu một tệp bị thiếu. |
| Ảnh tuổi thơ | `images/childhood-groom.jpg`, `images/childhood-bride.jpg` | Đang có ảnh demo cục bộ; nếu tệp bị thiếu sẽ dùng một ảnh cưới demo thay thế. |
| Màu sắc, bố cục, responsive, animation | `style.css` | Biến thiết kế nằm đầu file: giấy sáng, mực tối, đỏ, vàng. |
| Lời chúc và endpoint lưu dữ liệu | `config.js`, `script.js`, `apps-script/wishes.gs` | Apps Script là cách đang được cấu hình. |

## 5. Luồng trải nghiệm ở trình duyệt

### Cá nhân hóa khách mời và phong bì

- Không có `name` trong query string: thiệp hiển thị ngay.
- Có `name`: `script.js` đổi lời chào và tiêu đề tab, hiển thị phong bì theo đúng cấu trúc/hoạt ảnh cũ nhưng dùng chất liệu nhung đỏ đô, chữ và con dấu ánh kim, rồi mở sau hoạt ảnh khoảng 3,25 giây khi khách bấm. Trên desktop, trang chính được hé lộ ở kích thước gần full màn hình với viền 20px, không thu hẹp thành khung mobile.
- Với người bật giảm chuyển động, thời gian mở giảm còn khoảng 80 ms.

Ví dụ URL: `https://ten-mien-cua-ban/?name=Nguyen%20Van%20A`.

### Ảnh

- Splide chạy vòng lặp, hỗ trợ phím mũi tên, kéo và pagination.
- Bấm ảnh mở lightbox; Escape hoặc nút đóng sẽ đóng modal.
- `script.js` thay ảnh gallery, hero, closing, tuổi thơ và các section ảnh mới bị lỗi bằng ảnh demo cục bộ; trang không phụ thuộc Unsplash khi hiển thị.
- Countdown dùng mốc `2026-09-20T08:45:00+07:00`; cần đổi trong `script.js` nếu giờ tổ chức thay đổi.

### Mừng cưới và lời cảm ơn

- Radio `bride`/`groom` đổi thông tin trên thẻ ngân hàng.
- Nút sao chép dùng Clipboard API; nếu thất bại thì thông báo ngắn trên nút.
- Submit form không xử lý giao dịch thanh toán. Nó ghi lời chúc (nếu có) và mở modal cảm ơn.

## 6. Lời chúc: kiến trúc dữ liệu

Luồng hiện tại trong `script.js`:

```text
Trang web
  ├─ đọc/ghi chính: window.WEDDING_WISHES_DB_URL / WRITE_URL (nếu được đặt)
  ├─ nếu không: URL Apps Script trong config.js
  ├─ nếu không: api/wishes (Node serverless)
  ├─ đọc thất bại: localStorage key `tdtt-wedding-wishes`
  ├─ đọc tiếp thất bại: data/wishes.json
  └─ cuối cùng: sampleWishes nhúng trong script.js
```

`config.js` hiện đặt `window.WEDDING_WISHES_APP_SCRIPT_URL` đến Web App Google Apps Script. Vì vậy deployment tĩnh cũng có thể đọc/ghi lời chúc mà không cần chạy `api/wishes.js`.

Browser chỉ hiển thị tối đa 50 lời chúc, mới nhất trước. Cache cục bộ cũng tối đa 50 mục. Khi không ghi được lên backend, lời chúc chỉ hiện tạm trong phiên/cache trình duyệt; không thể coi là đã lưu chung.

Thông tin dữ liệu một lời chúc:

```json
{
  "createdAt": "ISO timestamp",
  "name": "tối đa 80 ký tự",
  "message": "tối đa 500 ký tự",
  "recipient": "Cô dâu hoặc Chú rể",
  "attendance": "tùy chọn"
}
```

Frontend hiện chưa có trường RSVP/attendance, dù hai backend vẫn hỗ trợ để tương thích dữ liệu cũ/mở rộng sau này.

## 7. Backend lời chúc

### A. Google Apps Script — phương án nên dùng

Tệp: `apps-script/wishes.gs`.

- Mở Google Sheet có ID được hard-code trong tệp, tab `LoiChuc`.
- Tự tạo tab và header nếu chưa tồn tại; tự nâng header cũ 5 cột thành 6 cột.
- `doGet()` trả `{ ok: true, wishes }`; `doPost()` tạo lời chúc.
- Dùng `LockService` khi ghi và cache Apps Script 60 giây khi đọc.
- Cột Sheet: `Created At | Name | Message | Recipient | Attendance | Source`.

Khi sửa `apps-script/wishes.gs`, cần dán/cập nhật Code.gs trong Google Apps Script rồi **deploy một version Web App mới**. Xem hướng dẫn chi tiết tại `apps-script/README.md`.

### B. Node serverless — phương án thay thế

Tệp: `api/wishes.js`.

- CommonJS endpoint hợp với host serverless như Vercel.
- Ký JWT bằng service account, lấy OAuth access token, rồi gọi Google Sheets API trực tiếp.
- Cần `GOOGLE_SERVICE_ACCOUNT_EMAIL` và `GOOGLE_PRIVATE_KEY`; tùy chọn `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME`.
- Có CORS `*`, hỗ trợ `GET`, `POST`, `OPTIONS`, cache token trong memory.

Chỉ dùng phương án này khi host thực sự chạy được route `api/wishes.js`. Static hosting đơn thuần không chạy endpoint đó.

**Không triển khai đồng thời hai backend như hai nguồn ghi chính.** Cả hai có thể cùng ghi cùng một Google Sheet, nhưng nên chọn Apps Script (đang cấu hình) hoặc serverless rõ ràng để dễ vận hành.

## 8. Tình trạng cần hoàn thiện trước khi gửi khách

1. Thay bộ ảnh demo trong `images/` bằng ảnh thật của cặp đôi khi đã có ảnh chính thức; giữ nguyên tên tệp để không cần sửa code.
2. Thay số tài khoản, tên ngân hàng và hai QR demo trong `bankAccounts` ở `script.js`.
3. Bổ sung địa chỉ dạng văn bản chi tiết của Hội Thánh nếu cần; giờ, tên địa điểm và tọa độ Google Maps đã được cập nhật.
4. Mở Google Sheet và kiểm tra Web App URL trong `config.js` còn deploy, có quyền `Anyone`, đọc/ghi được.
5. Kiểm tra UTF-8 trong trình soạn thảo trước khi chỉnh sửa tiếng Việt. Các lần đọc bằng terminal hiện hiển thị nhiều chuỗi tiếng Việt bị mojibake (ví dụ `Thiá»‡p`); cần xác nhận encoding file đang là UTF-8 và sửa nếu nội dung thực sự hiển thị lỗi trên trình duyệt.
6. Test trên điện thoại, đặc biệt: mở phong bì từ URL có `name`, bấm QR, copy số tài khoản, gửi lời chúc, đóng modal và slider.

## 9. Cách chạy/kiểm tra sau khi chuyển thư mục

Không cần cài dependency. Có thể dùng một static server trong thư mục gốc, rồi mở `index.html` qua `http://localhost/...`.

Checklist nhanh:

1. Xác nhận các file gốc: `index.html`, `style.css`, `script.js`, `config.js`.
2. Xác nhận asset `images/` đã được mang theo.
3. Mở trang bình thường và với `?name=TenKhach`.
4. Trong DevTools > Network, xem request GET/POST đến URL Apps Script có thành công không.
5. Kiểm tra Sheet `LoiChuc` có header 6 cột và lời chúc mới xuất hiện không.

## 10. Quy ước khi sửa tiếp

- Giữ `config.js` được nạp trước `script.js`; `script.js` đọc các biến `window.WEDDING_WISHES_*` lúc khởi tạo.
- Không đưa private key/service-account credential vào `config.js`, HTML hoặc Git. Nếu dùng Node serverless, chỉ đặt chúng ở biến môi trường của host.
- Dùng `textContent` như code hiện tại khi render lời chúc; không đổi thành `innerHTML`, vì nội dung khách nhập là không tin cậy.
- Nếu đổi schema Sheet, cập nhật đồng bộ `HEADERS`, mapping và README trong cả `apps-script/wishes.gs` và `api/wishes.js`.
- Không xóa `data/wishes.json`: đây là fallback hữu ích khi preview/offline, nhưng không phải cơ sở dữ liệu thật.

## 11. Lịch sử mã gần đây

Các commit gần nhất cho thấy dự án đã tập trung vào luồng quà mừng, lời chúc và RSVP/attendance:

- `f02f209` — Restore combined gift wish flow
- `7333b97` — Refine gift and wishes flow
- `d630e9e` — Update Apps Script RSVP endpoint
- `cd38562` — Add attendance RSVP and wishes scrolling

## 12. Tóm tắt một câu

Đây là thiệp cưới tĩnh, được cá nhân hóa bằng query string, có album/QR mừng cưới và sổ lời chúc dùng Google Sheets qua Apps Script; phần cần ưu tiên hoàn thiện là asset thật, dữ liệu sự kiện/ngân hàng và kiểm tra kết nối Apps Script.
