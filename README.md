# Một chút đặc biệt

Một website chúc mừng sinh nhật bằng **Vite + Vanilla JavaScript + Three.js**. Người nhận đi qua bảy không gian 3D bằng cách **chạm nhẹ vào vùng trống hoặc lời nhắn**, bàn phím hoặc thao tác vuốt. Trên điện thoại, mỗi lượt chỉ hiện một đoạn ngắn; chạm tiếp để đọc, mở từng pha lê/bông hoa, rồi sang cảnh mới. Kịch bản nhẹ nhàng, cao trào là lời hẹn dành cho buổi tối sinh nhật.

Thời gian trải nghiệm khoảng **4–5 phút**, tùy nhịp đọc và khám phá. Không tự chuyển cảnh hoặc bắt người nhận đọc trong một thời hạn. Tất cả hình ảnh, vật thể, ánh sáng và texture được dựng tại chỗ; không cần ảnh bên ngoài, CDN, backend hoặc API trả phí.

## Môi trường và cài đặt

- Node.js **22.12 trở lên** được khuyến nghị; Vite 7 cũng hỗ trợ Node.js 20.19 trở lên.
- npm.
- Trình duyệt hiện đại có WebGL2. Thiết bị không hỗ trợ vẫn đọc được toàn bộ hành trình bằng HTML.

```bash
npm install
npm run dev
```

Mở **http://localhost:5173**. Để xem trên điện thoại trong cùng Wi-Fi, mở địa chỉ Network do Vite in ra. Nếu Windows yêu cầu quyền truy cập mạng cho Node.js, cho phép mạng riêng.

## Build và deploy

```bash
npm run build
npm run preview
```

Thư mục **`dist/`** chứa website hoàn chỉnh. Đưa toàn bộ nội dung của thư mục này lên một hosting tĩnh như Netlify, Cloudflare Pages, Vercel hoặc máy chủ web có HTTPS. Với dịch vụ tự build, dùng lệnh `npm run build` và output directory `dist`. Không cần chạy Node.js trên hosting sau khi build.

`vite.config.js` dùng `base: './'`, hỗ trợ phục vụ trong thư mục con. Không mở `index.html` bằng `file://`; hãy dùng máy chủ HTTP/HTTPS. HTTPS được khuyến nghị khi sử dụng trên iPhone.

## Cá nhân hóa

**Điền thông tin cá nhân trong `personal.config.js` ở thư mục gốc**, cùng cấp với `package.json`. Website tự lấy tên, ngày sinh nhật, cách xưng hô và chữ ký từ file này.

```js
export const PROFILE = {
  recipientName: 'Chi',
  senderName: 'Sơn',
  senderPronoun: 'anh',
  recipientPronoun: 'em',
  birthday: '24/07',
  signature: '— Từ {senderName}',
};
```

`birthday` là chuỗi ngày/tháng; để `''` nếu muốn bỏ ngày khỏi lời mở đầu. `signature` có thể là một câu ký tên riêng. Đây là file cấu hình bằng JavaScript, không cần `.env` hay một form nhập trên website. **Sau khi sửa thông tin, chạy `npm run build` và cập nhật nội dung `dist/` trên hosting.** Nếu build trực tiếp trên VPS, Nginx cần trỏ vào thư mục `dist/`.

**Sửa lời dẫn, lời chúc, giao diện, màu sắc và thời gian trong `src/content.js`.** Không cần tìm và thay tên trong từng câu.

Các token được thay tự động trong nội dung:

| Token | Giá trị |
| --- | --- |
| `{recipientName}` | Tên người nhận |
| `{senderName}` | Tên người gửi |
| `{birthday}` | Ngày sinh nhật |
| `{sender}` / `{recipient}` | Đại từ xưng hô |
| `{senderCapital}` / `{recipientCapital}` | Đại từ có chữ đầu viết hoa |

Đổi `openingTitle` để thay tiêu đề mở đầu. Đổi `scenes[n].mobileTitle`, `paragraphs`, `interactions`, `caption` và `captionItalic` để sửa từng cảnh. `mobileTitle` là tiêu đề chính dùng chung trên desktop và điện thoại, bao gồm cách xuống dòng nghệ thuật; các đoạn nội dung trên điện thoại tự chia thành lượt đọc nhưng vẫn giữ nguyên mọi từ. Cảnh lời hẹn có thêm `revealedParagraphs` và `handoff`.

Đổi **`CONTENT.finalMessage`** để thay toàn bộ lời nhắn cuối; dùng `\n` để xuống dòng, `\n\n` để ngăn đoạn. `finalTitle` là tiêu đề HTML cuối; chữ ký lấy từ `PROFILE.signature` trong `personal.config.js`. Tên trong chữ bằng hạt sáng tự lấy từ `recipientName`. Nội dung được escape trước khi đưa vào HTML, nên tên chứa dấu nháy hoặc ký tự đặc biệt vẫn an toàn.

Hãy giữ lời nhắn chân thành và để người nhận thoải mái đón nhận lời hẹn.

## Nhạc nền tùy chọn

Website mặc định **không phát nhạc** và không yêu cầu tải file nhạc. Có sẵn thư mục `public/audio/`.

1. Đặt nhạc tự sáng tác hoặc file bạn có quyền sử dụng tại **`public/audio/background.mp3`**.
2. Đổi `CONTENT.audio.enabled` thành `true`.
3. Có thể đổi `audio.src` (đường dẫn tính từ `public/`) và `audio.volume` trong khoảng 0–1.

Nhạc chỉ tải/phát sau khi nhấn bắt đầu hoặc thực hiện thao tác đi tiếp ở cảnh mở đầu. Nút góc phải cho phép bật/tắt. Khi file thiếu, không đúng định dạng hoặc bị chặn, lời chúc và hành trình vẫn hoạt động. File thiếu chỉ được yêu cầu một lần, không có vòng lặp tải lại. Âm thanh tạm dừng khi tab bị ẩn. Không có nhạc có bản quyền được cung cấp cùng dự án.

## Màu sắc và nhịp độ

Sửa `CONTENT.colors` để thay nền đêm, hồng pha lê, hồng nhạt, ngọc trai, champagne và màu chữ. Các màu này được truyền cho CSS và vật thể 3D. Một số màu trung tính của vật liệu và lớp ánh sáng phụ được dùng để giữ chiều sâu.

Sửa `CONTENT.garden` để đổi màu hoa hồng, hoa màu kem, lớp cánh ở tâm, lá và thân. Mỗi bông gồm 31 cánh mỏng, cong, xếp thành năm lớp; khi chạm, các lớp cánh mở dần. Thân cong và lá xanh đi cùng bông hoa; khu vườn có hoa nhỏ phía sau và sương nhẹ.

Dòng `scenes[5].celebration` được dựng bên trong trái tim lớn ở cảnh lời hẹn. Có thể đổi thành `CHÚC MỪNG SINH NHẬT` hoặc `Happy Birthday`; lời chúc hiện bằng chữ serif thanh và dòng viết nghiêng, kèm tên người nhận và ngày sinh nhật từ `personal.config.js`. Nội dung khác vẫn tự chia dòng và thu gọn. Chữ cùng đổi vị trí và tỉ lệ với trái tim trên điện thoại, chỉ hiện sau khi các hạt đã tụ lại; trình đọc màn hình cũng nhận được lời chúc này.

Website dùng **Lora** (thường và nghiêng) cho tiêu đề, chú thích, lời chúc và chữ trong hiệu ứng; **Be Vietnam Pro** (400/500) cho nội dung và giao diện. Hai bộ font có hỗ trợ tiếng Việt, được lưu tại `public/fonts/` bằng WOFF, giữ toàn bộ ký tự và bảng định vị dấu. Không gọi dịch vụ font ngoài khi xem website. Nguồn và giấy phép: [Lora](https://github.com/google/fonts/tree/main/ofl/lora), [Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro); các file `OFL-lora.txt` và `OFL-bevietnampro.txt` được kèm trong thư mục font.

`src/utils/fonts.js` nạp đủ font trước khi dựng chữ bằng canvas, để hạt chữ và lời chúc trong trái tim dùng đúng font. Nội dung được chuẩn hóa Unicode NFC để dấu tiếng Việt không bị tách khi tên hoặc lời chúc được dán từ nguồn khác.

`CONTENT.timing` có các giá trị tính bằng mili giây:

| Thuộc tính | Tác dụng |
| --- | --- |
| `camera` | Thời gian chuyển camera giữa hai cảnh |
| `reveal` | Thời gian mở bất ngờ, trái tim bay ra và tụ thành trái tim lớn; mặc định 8,5 giây |
| `handoff` | Khoảng dừng trước khi hiện lời hẹn cuối cảnh |
| `heartHold` | Giữ trái tim; mặc định 2,6 giây |
| `heartDissolve` | Thời gian trái tim tan thành ánh sáng |

Khi người nhận bật giảm chuyển động, camera rút ngắn, chuyển động trôi dừng và số hạt nền giảm. Kịch bản và khoảng dừng trước lời hẹn vẫn được giữ.

Bảy cảnh nằm nối tiếp trên cùng một trục chiều sâu. Mỗi lần đi tiếp, camera tiến sâu về cảnh kế tiếp và giữ hướng nhìn tới cuối hành trình. Cảnh tiếp theo có thể nhìn thấy ở phía trước; không làm mờ toàn màn hình khi chuyển cảnh hoặc đẩy trái tim mở đầu ngược hướng camera.

Ba nét mảnh uốn mềm như khuông nhạc nối liền từ cảnh đầu đến cảnh cuối, luôn được giữ trong không gian khi camera di chuyển. Các nét màu hồng và vàng nhạt không có phần nền tô đặc. Hai nhánh phụ tách ra tại cảnh gặp gỡ; lối chính sáng nhẹ khi chạm và tiếp tục xuyên qua các cảnh sau. Nét đường nhạt dần theo chiều sâu và ở phần sát camera; các hình của cảnh phía xa chìm trong sương để cảnh hiện tại nổi bật.

Trên điện thoại, trái tim đã chạm bay xuống vị trí lời nhắn theo thứ tự; bông hoa đã chạm nở, rơi nhẹ xuống rồi mờ dần trong 1,4 giây. Trái tim ở cảnh gặp gỡ xuất hiện theo hướng rơi nhẹ, các trái tim ở cảnh lời hẹn bay tỏa xuống dưới, và hạt ở đoạn kết tan xuống dưới. Hình trái tim sinh nhật cuối cùng vẫn đứng đúng chiều, với chữ ở bên trong. Chế độ giảm chuyển động đặt hiệu ứng ngay tại trạng thái cuối.

## Các cảnh và điều khiển

1. **Lời mời**: trái tim pha lê 3D với viền bo mềm xuất hiện, mở hành trình.
2. **Định mệnh**: chàng trai và cô gái minh họa 2D đứng ở hai nhánh khác nhau. Ngay khi camera đến cảnh này, hai người tự tiến về cùng giao điểm; sau khi gặp nhau, trái tim hồng hiện lên phía trên. Cảnh giữ khoảng 3,3 giây cho cuộc gặp hoàn tất, rồi chạm để đọc tiếp hoặc tiến tới cảnh sau. Trên điện thoại, lời dẫn vẫn giữ thứ tự đọc. Chế độ giảm chuyển động hiện cuộc gặp và trái tim ngay lập tức. Xem lại hành trình sẽ chạy lại cuộc gặp tự động.
3. **Những niềm vui nhỏ**: thu thập ba trái tim pha lê; chúng tiếp tục đi cùng ở những cảnh sau. Các trái tim nghiêng nhẹ để luôn nhận ra hình dáng; biểu tượng giao diện và favicon cũng dùng trái tim.
4. **Khu vườn**: chạm bông hoa để nở hoa và mở lời chúc ngay phía trên. Các hạt nhỏ bay từ hoa, tụ theo hình dáng từng chữ và dấu tiếng Việt, rồi chuyển thành chữ rõ nét. Chạm bông tiếp theo sẽ làm câu cũ blur và mờ dần trong 0,52 giây, trước khi các hạt tạo câu mới. Mỗi lần chỉ hiện một lời chúc. Chế độ giảm chuyển động hiển thị chữ ngay; quay lại giữ lời chúc đã mở.

5. **Thời gian**: pha lê xoay, tụ về mặt đồng hồ và cổng ánh sáng.
6. **Lời hẹn tối nay**: mở lớp bất ngờ, vô số trái tim nhỏ bay ra rồi tụ thành trái tim lớn. Sau đó hiện **CHÚC MỪNG SINH NHẬT**, rồi sau khoảng dừng hiển thị lời hẹn cho buổi tối. Dòng chữ chỉnh tại `scenes[5].celebration` trong `src/content.js`. Hiệu ứng dùng 60.000 hạt trên desktop, 8.000 trên điện thoại và 1.200 khi giảm chuyển động; có thể chỉnh `CONTENT.giftHearts`. GPU xử lý chuyển động trong một draw call, viền trái tim được làm mềm; số hạt tự giảm khi thiết bị chậm.
7. **Lời chúc cuối**: hạt sáng kết chữ; chạm sau khi đọc hết lời nhắn để tạo trái tim pha lê rồi tan thành hạt sáng. Khi hiện lời nhắc xem lại, chạm tiếp để bắt đầu hành trình mới.

Ở cảnh **Những niềm vui nhỏ**, mỗi lần chạm màn hình sẽ đưa một trái tim thu về cạnh câu tương ứng. Trên desktop, ba trái tim và câu chữ nằm ở vùng bên phải, cùng phía với hình ảnh; phần lời dẫn ở bên trái. Trên điện thoại, trái tim vẫn bay xuống cạnh lời nhắn. Ba câu hiện lần lượt và giữ lại; lần chạm kế tiếp sau khi mở đủ ba câu sẽ sang khu vườn. Chế độ giảm chuyển động đặt trái tim cạnh chữ ngay lập tức.

**Chạm vào vùng trống hoặc lời nhắn** để tiếp tục. Giao diện không có button. Trên điện thoại, mỗi chạm đọc đoạn kế tiếp, mở từng trái tim/hoa rồi sang cảnh mới. Header, thanh tiến trình và thao tác chọn chữ không kích hoạt đi tiếp.

Phím **→**, **Enter**, **Space**, vuốt **trái** hoặc **lên** cũng hỗ trợ luồng đọc này. Phím **←**, vuốt **phải** quay về đoạn trước trên điện thoại hoặc cảnh trước khi đang ở đoạn đầu. Kéo/cuộn không bị nhận nhầm thành chạm; vuốt không kích hoạt thêm một lượt do sự kiện click cảm ứng.

Có thể chạm trực tiếp vật thể 3D hoặc vùng trống để mở vật thể kế tiếp. Dùng **Tab** để đưa focus vào vùng trải nghiệm, rồi **Enter**, **Space** hoặc phím mũi tên để thao tác. Vùng này có nhãn cho trình đọc màn hình và thông báo khám phá. Trên mobile, chấm nhỏ biểu thị lượt đọc; mỗi lần chỉ hiển thị một lời chúc hoa. Quay lại giữ nội dung đã mở. Xem lại xóa trạng thái khám phá và vị trí đọc. Đoạn kết tạo ánh sáng trong website, không tải ảnh hoặc thu thập dữ liệu.

## Cấu trúc

```text
index.html                 Điểm vào HTML
personal.config.js         Tên, ngày sinh nhật, cách xưng hô và chữ ký
src/
  content.js               Lời dẫn, lời chúc, giao diện và cấu hình hiệu ứng
  main.js                  Giao diện, điều khiển, fallback và vòng đời
  styles.css               Bố cục responsive và giao diện
  scene/
    world.js               Renderer, camera tiến sâu, các cảnh và hạt sáng
    journey-road.js        Con đường liền mạch xuyên suốt bảy cảnh
    music-path.js          Các nét mảnh uốn mềm như khuông nhạc
    crossroads.js          Ngã rẽ, nhân vật 2D và lối đi sáng lên
    objects.js             Pha lê, hoa, hộp quà và vật liệu
    roses.js               Hoa hồng nhiều lớp, lá, thân cong và vườn hoa instanced
    gift-hearts.js         Đàn trái tim bằng GPU và hình trái tim lớn
    heart-message.js       Chữ sinh nhật nằm trong trái tim 3D
  utils/
    fonts.js               Nạp font tiếng Việt cho giao diện và chữ canvas
    flower-wish.js         Hạt tạo chữ phía trên hoa và chuyển câu bằng blur
    journey.js             Trạng thái, điều kiện đi tiếp và xem lại
    reading.js             Chia đoạn đọc, vị trí đọc và lời chúc đang mở
    audio.js               Nhạc tùy chọn và xử lý file thiếu
public/
  fonts/                   Font tiếng Việt cục bộ, bản gốc TTF và giấy phép OFL
  images/traveller.svg      Cô gái minh họa 2D
  images/traveller-boy.svg  Chàng trai minh họa 2D
  favicon.svg              Biểu tượng cục bộ
  audio/                   Vị trí đặt background.mp3 tùy chọn
scripts/verify.mjs         Kiểm tra hành trình bằng Playwright
vite.config.js             Cấu hình build và đường dẫn tương đối
```

## Hiệu năng và trình duyệt

Mục tiêu: **Safari iOS trên iPhone 12 Pro Max**, Safari macOS, Chrome, Edge và Firefox hiện đại; điện thoại Android, máy tính bảng và desktop. Three.js r180 sử dụng WebGL2. Không hỗ trợ WebGL sẽ hiển thị bản HTML đầy đủ; mất context WebGL giữa hành trình cũng chuyển về bản này.

Pixel ratio tối đa 1,35 trên điện thoại và 1,6 trên desktop; có thể giảm về 1 khi tốc độ khung hình thấp kéo dài. Hạt nền giảm trên mobile; hoa nhỏ, cánh hoa mềm, mây và vạch đồng hồ sử dụng instancing. Vật liệu standard giảm tải shader; cánh hoa có bề mặt mịn, hộp quà dùng hình học bo góc. Camera tiến sâu với easing bậc năm theo thời gian thực, giữ hình ảnh liên tục khi sang cảnh; nắp hộp và thân hộp mờ dần thay vì biến mất đột ngột. Không dùng hậu kỳ bloom nặng: ánh sáng mềm được tạo bằng sprite và texture gradient cục bộ. Chỉ dựng tài nguyên khi khởi tạo, chỉ render cảnh cần thiết, dừng vòng lặp khi tab ẩn và giải phóng tài nguyên khi rời trang. Có xử lý resize và xoay màn hình, `100dvh`, safe area, nội dung mobile 16px và thao tác chạm trên vùng màn hình. Bố cục dọc mobile gọn trong một màn hình với lời nhắn chia lượt; màn hình quá thấp cho phép cuộn vùng lời nhắn.

## Kiểm tra

```bash
npm test
```

Script tự mở Vite ở cổng 5178 và dùng Microsoft Edge headless. Máy cần cài Edge; có thể đặt biến môi trường `TEST_BROWSER=chrome` nếu dùng Chrome đã cài. Trên hệ điều hành khác, hãy chọn một channel Playwright có sẵn hoặc thay tùy chọn launch để sử dụng Chromium của Playwright.

Kiểm tra gồm cả hành trình, điều kiện tương tác, giao diện không có button và bàn phím, cảm ứng và vuốt, trạng thái quay lại/xem lại, khoảng dừng trước lời hẹn, reduced motion, raycaster, kích thước iPhone 428×926, điện thoại 360×667, xoay ngang, thiếu MP3 và fallback WebGL. Ảnh chụp được ghi vào `test-results/` và không đi vào bản production.

Kiểm tra mobile trên máy tính dùng mô phỏng trình duyệt; **chưa đo FPS trên iPhone vật lý hoặc chạy Safari iOS thực tế**. Trước ngày sinh nhật, nên mở bản deploy trên chiếc điện thoại sẽ sử dụng, chỉnh tên/lời nhắn và đi hết hành trình một lần.
