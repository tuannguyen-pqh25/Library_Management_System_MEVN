# Lược đồ Cơ sở dữ liệu: QuanLyMuonSach

Cho lược đồ CSDL QuanLyMuonSach như sau (bạn tự lựa chọn kiểu dữ liệu cho phù hợp):

## 1. DOCGIA (Độc Giả)
**Mô tả:** Lưu thông tin của độc giả (người mượn sách). Mỗi độc giả có một mã số để quản lý và có các thông tin về họ lót, tên, ngày sinh, địa chỉ, và điện thoại.

**Các thuộc tính:**
*   **MaDocGia** *(Khóa chính)*
*   **HoLot**
*   **Ten**
*   **NgaySinh**
*   **Phai**
*   **DiaChi**
*   **DienThoai**

---

## 2. SACH (Sách)
**Mô tả:** Lưu thông tin về sách. Mỗi sách có một mã số để quản lý và có tên, giá tiền, số quyển, năm xuất bản, nhà xuất bản, nguồn gốc hay tác giả của sách.

**Các thuộc tính:**
*   **MaSach** *(Khóa chính)*
*   **TenSach**
*   **DonGia**
*   **SoQuyen**
*   **NamXuatBan**
*   **MaNXB** *(Khóa ngoại tham chiếu đến bảng NHAXUATBAN)*
*   **NguonGoc/TacGia**

---

## 3. NHAXUATBAN (Nhà Xuất Bản)
**Mô tả:** Lưu thông tin về nhà xuất bản. Mỗi nhà xuất bản có một mã số để quản lý, và có tên gọi, địa chỉ của nhà xuất bản.

**Các thuộc tính:**
*   **MaNXB** *(Khóa chính)*
*   **TenNXB**
*   **DiaChi**

---

## 4. THEODOIMUONSACH (Theo Dõi Mượn Sách)
**Mô tả:** Lưu thông tin theo dõi độc giả mượn sách. Thông tin gồm: độc giả nào, mượn sách gì, mượn vào ngày nào, trả sách vào ngày nào.

**Các thuộc tính:**
*   **MaDocGia** *(Khóa chính, Khóa ngoại tham chiếu bảng DOCGIA)*
*   **MaSach** *(Khóa chính, Khóa ngoại tham chiếu bảng SACH)*
*   **NgayMuon** *(Khóa chính)*
*   **NgayTra**

---

## 5. NhanVien (Nhân Viên)
**Mô tả:** Lưu thông tin nhân viên. Mỗi nhân viên có một mã số nhân viên để quản lý và các thông tin họ tên, chức vụ, địa chỉ và số điện thoại.

**Các thuộc tính:**
*   **MSNV** *(Khóa chính)*
*   **HoTenNV**
*   **Password**
*   **ChucVu**
*   **DiaChi**
*   **SoDienThoai**