# Chiến lược Tích hợp UI/UX từ Figma vào Vue & Bootstrap

**Mục tiêu:** Áp dụng toàn bộ thiết kế giao diện (UI/UX) từ bản tham khảo Figma (`frontend_reference`) sang các ứng dụng Vue hiện tại (`admin-web`, `user-web`) mà **KHÔNG SỬ DỤNG TAILWIND CSS**, chỉ sử dụng Bootstrap 5 và Custom CSS.

## Nguyên tắc cốt lõi ("Khử AI")

1. **Không sao chép nguyên mẫu React:** Các file từ bản Figma sinh ra là React component, chứa nhiều code lặp lại và sử dụng inline-style. Chúng ta sẽ không sử dụng trực tiếp các file này.
2. **Tuân thủ Vue 3 Component:** Tách các thành phần giao diện lặp lại (Button, Input, Card, Modal) thành các `BaseComponent` trong Vue (ví dụ: `BaseButton.vue`) để tái sử dụng.
3. **Tận dụng Bootstrap 5 Utilities:** Thay vì dùng Tailwind classes (`flex`, `items-center`, `justify-between`, `w-full`), ta sẽ dùng các class tương đương của Bootstrap (`d-flex`, `align-items-center`, `justify-content-between`, `w-100`).
4. **Ghi đè (Override) CSS Bootstrap:** Cập nhật file `style.css` tổng để thay đổi các biến màu sắc và font chữ của Bootstrap, giúp giao diện mang màu sắc chuẩn của Figma.

## Kế hoạch thực thi (Từng bước)

### Bước 1: Thiết lập Hệ thống Thiết kế (Design System)
- Tạo/Cập nhật file `style.css` (hoặc `scss`) trong thư mục `src/assets/` của cả `admin-web` và `user-web`.
- Khai báo các fonts: `Playfair Display` (Heading), `Outfit` (Body), `DM Mono` (Data).
- Ghi đè biến `:root` của Bootstrap:
  - `--bs-primary`: `#1E3D2F`
  - `--bs-warning`: `#B5881E` (Sử dụng như màu Accent)
  - `--bs-body-bg`: `#F6F1E7`
  - Khai báo thêm hiệu ứng bóng đổ (shadows) dạng Neumorphic/Card-surface.

### Bước 2: Tạo thư viện Base Components
Tạo thư mục `src/components/ui/` và thiết kế các component cơ bản:
- `<BaseInput>`: Bọc `input.form-control` của Bootstrap kèm nhãn (label) và thông báo lỗi.
- `<BaseButton>`: Bọc `button.btn` với các props định dạng (primary, secondary, outline).
- `<BaseCard>`: Bọc `div.card` với class hiệu ứng bóng đổ riêng biệt.

### Bước 3: Cấu trúc lại Layout
- Xây dựng lại `AppHeader.vue` và Sidebar dựa trên Flexbox và Grid của Bootstrap.
- Đảm bảo tính Responsive: dùng `col-md`, `col-lg`, `d-none d-md-block`.

### Bước 4: Chuyển đổi các Trang (Screens)
- **Trang Login:** Mở file `Login.vue`, thay thế UI hiện tại bằng các Base Components và Layout chia cột (bên trái là texture, bên phải là form đăng nhập) chuẩn theo Figma.
- **Trang Quản lý sách/Dashboard:** Tái cấu trúc dựa trên Grid layout của Bootstrap, dùng Base Card để bao bọc các dữ liệu thống kê.

## Bảng quy đổi class (Tailwind -> Bootstrap 5) để tham khảo nhanh:

| CSS / Tailwind | Bootstrap 5 Tương đương |
| :--- | :--- |
| `flex items-center justify-between` | `d-flex align-items-center justify-content-between` |
| `w-full h-screen` | `w-100 vh-100` |
| `p-4 mb-4 rounded-md` | `p-4 mb-4 rounded-2` |
| `grid grid-cols-2 gap-4` | `<div class="row"><div class="col-6">...</div></div>` |
| `text-sm font-semibold` | `fs-6 fw-semibold` |
| `absolute inset-0` | `position-absolute top-0 start-0 w-100 h-100` |
