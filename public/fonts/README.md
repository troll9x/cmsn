# Font cục bộ

Thư mục này chứa đầy đủ các font website sử dụng, bao gồm ký tự tiếng Việt và bảng định vị dấu. Các file không bị cắt thành những bộ ký tự nhỏ (subset).

| Font | Bản dùng trên website | Bản gốc |
| --- | --- | --- |
| Lora thường, variable 400–700 | `lora-regular.woff` | `originals/lora-regular.ttf` |
| Lora nghiêng, variable 400–700 | `lora-italic.woff` | `originals/lora-italic.ttf` |
| Be Vietnam Pro thường, 400 | `be-vietnam-pro-regular.woff` | `originals/be-vietnam-pro-regular.ttf` |
| Be Vietnam Pro medium, 500 | `be-vietnam-pro-medium.woff` | `originals/be-vietnam-pro-medium.ttf` |

Website tải WOFF trực tiếp từ máy chủ của mình. TTF là bản gốc đầy đủ để lưu trữ hoặc chuyển đổi khi cần; trình duyệt không tải chúng trong quá trình xem website. Không cần cài font vào hệ điều hành VPS và không cần kết nối Google Fonts khi mở trang.

Nguồn chính thức: [Lora](https://github.com/google/fonts/tree/main/ofl/lora), [Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro). Cả hai dùng giấy phép SIL Open Font License 1.1; giữ kèm các file `OFL-lora.txt` và `OFL-bevietnampro.txt` khi phân phối.

Toàn bộ thư mục này được lưu trong Git. Sau khi clone/pull repo về VPS, chạy:

```bash
npm ci
npm run build
```

Vite tự sao chép font sang `dist/fonts/`. Trong aaPanel, đặt thư mục chạy của website Nginx là `dist/` của dự án; nếu upload bản build bằng tay, cần upload cả `dist/fonts/` cùng `index.html` và `assets/`.
