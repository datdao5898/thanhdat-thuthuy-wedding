# Bản đồ dự án — thiệp cưới Thành Đạt & Thu Thủy

> Mục đích của tài liệu này: giúp một người hoặc AI mới có thể hiểu, sửa và triển khai dự án sau khi thư mục bị di chuyển hoặc mất ngữ cảnh trò chuyện.

## 1. Tổng quan

Đây là website thiệp mời cưới một trang (single-page landing page) cho **Thành Đạt và Thu Thủy**. Hôn lễ được cử hành lúc **08:30, Chúa Nhật ngày 20/09/2026** tại **Nhà Thờ Tin Lành Chi Hội Thạnh Mỹ** (số 10/1 Đường Nguyễn Du, TT. Thạnh Mỹ, Đơn Dương, Lâm Đồng). Tiệc cưới tổ chức tại **Nhà Hàng Kim Bút 2** (Dốc cầu Sạp, Quảng Thuận, Quảng Lập, Lâm Đồng), đón khách lúc **11:30** và khai tiệc lúc **12:00**.

Dự án dùng HTML, CSS và JavaScript thuần; không có `package.json`, framework, trình biên dịch hoặc bước build. Có thể mở `index.html` để xem giao diện, nhưng phần sổ lời chúc cần chạy qua HTTP(S) để `fetch` hoạt động ổn định.

Các tính năng chính:

- Màn phong bì mở thiệp khi URL có tên khách mời, ví dụ `/?name=Nguyen%20Van%20A`.
- Nội dung thiệp, thông tin ngày cưới, bộ ảnh dạng carousel/lightbox.
- Toàn bộ giao diện theo hướng mobile-first: style nền ưu tiên màn hình điện thoại từ 320px, mọi nội dung xếp một cột và desktop chỉ mở rộng bố cục từ breakpoint `860px`. Khoảng cách, cỡ chữ, ảnh, lịch, bản đồ, form, QR, sổ lưu bút và modal đều có điều chỉnh riêng cho màn hình nhỏ; vùng bấm chính tối thiểu 44–48px và input giữ cỡ chữ 16px để tránh trình duyệt điện thoại tự zoom.
- Section mở đầu sau hero được rút gọn theo thứ tự: đĩa nhạc, `Save the Date`, `For the Wedding of`, rồi hai ảnh solo cùng nhãn Groom/Bride và tên Thành Đạt/Thu Thủy. Ngay sau đó là section ảnh cưới độc lập, tràn toàn bộ chiều rộng và dùng nền `fixed` tạo hiệu ứng parallax trên desktop.
- Collage ảnh cưới bất đối xứng, countdown thời gian thực đến ngày 20/09/2026.
- Wedding information mở đầu bằng bố cục thiệp `Lễ thành hôn`: tên Thành Đạt/Thu Thủy, giờ `08:30 – Chúa Nhật` và ngày `THÁNG 09 | 20 | NĂM 2026`; bên dưới vẫn giữ ảnh, lịch tháng 9/2026, hai thẻ địa điểm và nút `Xem bản đồ` mở Google Maps. Trang không nhúng iframe bản đồ trực tiếp.
- Các section có cả hình và chữ dùng hiệu ứng reveal tuần tự khi cuộn: hình xuất hiện trước, chữ trễ `0.5s`; hiệu ứng mở dần từ trái sang phải trong `3s` bằng một lớp phủ co lại với `transform: scaleX()`. Nội dung, shadow và margin luôn đứng yên; không dùng `clip-path` trên ảnh lớn hoặc iframe để tránh shadow vuông và hiện tượng khựng trên Chrome.
- Section lời chúc đặt trước quà mừng: form gửi lời chúc đặt cạnh sổ lưu bút; dữ liệu chung được lưu trong Google Sheets. Khung sổ lưu bút dùng nền kem pha xanh nhạt, viền và scrollbar olive, nội dung xanh rêu; mỗi `.wish-card` không có box-shadow riêng.
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
├── tao-thiep.html          # Trang quản trị nhỏ để lưu khách và tạo link ?i=...
├── tao-thiep.css           # Giao diện responsive của trang tạo link
├── tao-thiep.js            # Lưu khách qua Apps Script và sinh link ngắn
├── images/                 # Ảnh cưới gốc và bộ ảnh web đã tối ưu
│   ├── wedding-1.jpg … wedding-4.jpg
│   ├── childhood-groom.jpg, childhood-bride.jpg
│   └── qr-bride.jpg, qr-groom.jpg
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
| Tên cặp đôi, ngày cưới, văn bản, giờ/địa điểm, link Maps | `index.html` | Luôn hiển thị Thành Đạt trước Thu Thủy. Hôn lễ: `08:30, 20/09/2026` tại `Nhà Thờ Tin Lành Chi Hội Thạnh Mỹ`; tiệc cưới: `11:30–12:00` tại `Nhà Hàng Kim Bút 2`. Mỗi thẻ địa điểm có nút `Xem bản đồ` mở link Google Maps tương ứng. |
| Tên chủ tài khoản, số tài khoản, tên ngân hàng, đường dẫn QR | đầu `script.js` trong `bankAccounts` | Cô dâu: `HOANG THI THU THUY` – `8007041129756`; chú rể: `DAO THANH DAT` – `8007041062602`; cả hai dùng `Timo Digital Bank by BVBank` và QR VietQR chính thức dạng JPG. |
| Ảnh cưới | `images/TINK*.jpg`, `images/web-*.jpg` | `TINK*.jpg` là ảnh gốc độ phân giải cao. `web-*.jpg` là bộ đã chọn và tối ưu cho hero, thiệp, parallax, collage, wedding information, gallery và closing; các ảnh tự dự phòng chéo nếu một tệp bị thiếu. |
| Ảnh mobile | `images/web-*-mobile.jpg` | Bộ crop dọc riêng cho hero, fixed photo, collage nhỏ và wedding information. Riêng phần kết dùng chung `images/web-closing.jpg` trên desktop và mobile để giữ đúng ảnh cô dâu–chú rể giơ tay chào. Trên mobile, ảnh nằm trong `.closing::before` cao hơn khung ảnh tự nhiên và dùng `mask-image`/`-webkit-mask-image` mờ dần hoàn toàn vào nền xanh rêu `var(--dark)`, tránh mọi cạnh cắt ngang trước phần chữ/footer. |
| Ảnh tuổi thơ | Chưa có ảnh thật | Hai khung đang dùng `web-gallery-7.jpg` và `web-gallery-2.jpg` làm ảnh demo tạm thời để giao diện không hiển thị ảnh lỗi. |
| Màu sắc, bố cục, responsive, animation | `style.css` | Biến thiết kế nằm đầu file: giấy kem, xanh rêu đậm, olive, xanh trầm và vàng champagne. Toàn bộ chữ landing page dùng xanh rêu làm màu chủ đạo; chữ phụ dùng xám xanh/olive. |
| Tiêu đề album responsive | `style.css` | `.gallery .section-heading` có chiều rộng riêng lớn hơn tiêu đề section thông thường; tiêu đề “Khoảnh khắc trước ngày thành đôi” dùng cỡ chữ co giãn và `text-wrap: balance` để xuống dòng cân đối trên màn hình hẹp. |
| Lời chúc và endpoint lưu dữ liệu | `config.js`, `script.js`, `apps-script/wishes.gs` | Apps Script là cách đang được cấu hình. |

## 5. Luồng trải nghiệm ở trình duyệt

### Cá nhân hóa khách mời và phong bì

- Không có `name` hoặc `i` trong query string: thiệp hiển thị ngay và toàn bộ đại từ của cô dâu chú rể mặc định là `chúng mình`.
- Link khách mời mới dùng mã gọn `?i=TD001`. `script.js` đọc tên và nhóm xưng hô từ tab `KhachMoi` của Google Sheet qua Apps Script: nhóm `senior` dùng `chúng em`, nhóm `friend` dùng `chúng mình`. Trang riêng `tao-thiep.html` cho phép nhập mã, tên, nhóm và khóa quản trị để lưu khách rồi sinh link. Khóa được đối chiếu với Script Property `GUEST_ADMIN_KEY`, không ghi vào source hoặc local storage.
- Link `?name=...` cũ vẫn được hỗ trợ để không làm hỏng các thiệp đã gửi; nhóm mặc định của dạng link cũ là `friend`, có thể thêm `&audience=senior` nếu cần. Khi có khách mời, `script.js` đổi lời chào, đại từ trong các phần nội dung liên quan và tiêu đề tab, sau đó hiển thị ảnh thiệp dọc `images/web-envelope-personalized.jpg`. Dòng cố định `TRÂN TRỌNG KÍNH MỜI` nằm phía trên; tên khách đứng giữa bằng font `Italianno` và dùng đúng xanh rêu đậm `#263e1e`. JavaScript đo chiều rộng thực tế sau khi font tải và tự thu nhỏ tên để luôn nằm trên một dòng. Khi bấm, ảnh thiệp phóng rất nhẹ bằng `transform` và mờ dần trong khoảng 1 giây; site nằm sẵn phía dưới, không scale toàn bộ trang và không dùng `filter`.
- Với người bật giảm chuyển động, thời gian mở giảm còn khoảng 80 ms.

Ví dụ URL: `https://ten-mien-cua-ban/?name=Nguyen%20Van%20A`.

### Ảnh

- Splide chạy vòng lặp, hỗ trợ phím mũi tên, kéo và pagination; ảnh album dùng `object-fit: contain` trên cả desktop lẫn mobile để luôn hiển thị toàn bộ khung hình, không crop.
- Đĩa than ở section thiệp mời là nút bật/tắt nhạc nền. Nút không có biểu tượng phủ lên ảnh; khi bấm, iframe nền phát video YouTube `QtrVuwVuy3o` từ giây thứ 1 theo link do chủ dự án cung cấp, bấm lần nữa sẽ dừng. Iframe dùng kích thước trình phát hợp lệ và được đặt ngoài khung nhìn để không che giao diện. Dự án không lưu bản MP3 cục bộ.
- Banner dùng `images/web-hero-garden.jpg`, là bản JPEG tối ưu từ ảnh chân dung chủ dự án cung cấp và đã xóa chữ mẫu để dựng typography thật bằng HTML/CSS. Hero dùng chữ viết tay `Italianno`, màu trắng ở “Wedding day”, xanh rêu cho tên hai người, lớp sáng chuyển dần từ dưới lên và ảnh `contain` trên desktop / `cover` trên mobile để ưu tiên nhìn đủ gương mặt. Ảnh phong bì và hero được preload; các ảnh dưới màn hình đầu dùng lazy-loading để giảm tải giải mã lúc mở thiệp. Không dùng lại PNG 1,6 MB, `filter: blur()` hoặc `mix-blend-mode` trên hero khi mở thiệp; site nằm sẵn dưới lớp intro và không còn animation opacity riêng cho toàn bộ trang.
- Hiệu ứng mở thiệp chỉ animate `transform` và `opacity` của ảnh thiệp trong 1 giây; không animate `filter` và không scale toàn bộ `.site-shell`. Trang phía sau chỉ fade opacity trong 0,55 giây để tránh Chrome phải dựng lại toàn bộ DOM mỗi frame.
- Bấm ảnh mở lightbox; Escape hoặc nút đóng sẽ đóng modal.
- `script.js` thay ảnh gallery, hero, closing, tuổi thơ và các section ảnh mới bị lỗi bằng bộ `web-*.jpg` cục bộ; trang không phụ thuộc Unsplash khi hiển thị.
- Countdown dùng mốc `2026-09-20T08:30:00+07:00`; cần đổi trong `script.js` nếu giờ tổ chức thay đổi.

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

1. Bổ sung ảnh tuổi thơ thật của cô dâu/chú rể; ảnh cưới và QR ngân hàng hiện đã dùng dữ liệu thật trong `images/`.
2. Kiểm tra lại hai link Google Maps trên nút `Xem bản đồ` nếu địa điểm thay đổi; trang không nhúng iframe bản đồ để giao diện gọn và tải nhẹ hơn.
3. Mở Google Sheet và kiểm tra Web App URL trong `config.js` còn deploy, có quyền `Anyone`, đọc/ghi được.
4. Kiểm tra UTF-8 trong trình soạn thảo trước khi chỉnh sửa tiếng Việt. Các lần đọc bằng terminal hiện hiển thị nhiều chuỗi tiếng Việt bị mojibake (ví dụ `Thiá»‡p`); cần xác nhận encoding file đang là UTF-8 và sửa nếu nội dung thực sự hiển thị lỗi trên trình duyệt.
5. Test trên điện thoại, đặc biệt: mở phong bì từ URL có `name`, bấm QR, copy số tài khoản, gửi lời chúc, đóng modal và slider.

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
