import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import DocGiaService from './docgia.service';
import SachService from './sach.service';
import MuonSachService from './muonsach.service';
import NhaXuatBanService from './nhaxuatban.service';
import NhanVienService from './nhanvien.service';

class ExportService {
 
  normalizeField(obj, fieldNames) {
    for (const fieldName of fieldNames) {
      if (obj[fieldName]) return obj[fieldName];
    }
    return '';
  }

  normalizeId(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value.$oid) return String(value.$oid);
      if (value._bsontype === 'ObjectID' && typeof value.toHexString === 'function') return value.toHexString();
      if (typeof value.toString === 'function') return value.toString();
      return JSON.stringify(value);
    }
    return String(value);
  }

  // Lấy tất cả dữ liệu từ API
  async getAllData() {
    try {
      const [docGiasRes, sachesRes, muonSachesRes, nhaXuatBansRes, nhanViensRes] = await Promise.all([
        DocGiaService.getAll().catch(() => ({ data: [] })),
        SachService.getAll().catch(() => ({ data: [] })),
        MuonSachService.getAll().catch(() => ({ data: [] })),
        NhaXuatBanService.getAll().catch(() => ({ data: [] })),
        NhanVienService.getAll().catch(() => ({ data: [] }))
      ]);

      const docGias = Array.isArray(docGiasRes) ? docGiasRes : (docGiasRes.data || []);
      const saches = Array.isArray(sachesRes) ? sachesRes : (sachesRes.data || []);
      const muonSaches = Array.isArray(muonSachesRes) ? muonSachesRes : (muonSachesRes.data || []);
      const nhaXuatBans = Array.isArray(nhaXuatBansRes) ? nhaXuatBansRes : (nhaXuatBansRes.data || []);
      const nhanViens = Array.isArray(nhanViensRes) ? nhanViensRes : (nhanViensRes.data || []);

      // Populate tên nhà xuất bản cho sách
      const populatedSaches = saches.map(sach => {
        const nxb = nhaXuatBans.find(n => n.MANXB === sach.MANXB);
        return {
          ...sach,
          TenNhaXuatBan: nxb?.TENNXB || nxb?.TenNXB || ''
        };
      });

      // Populate muonSaches data
      const populatedMuonSaches = muonSaches.map(ms => {
        const docGia = docGias.find(dg => this.normalizeId(dg._id) === this.normalizeId(ms.docGiaId) || this.normalizeId(dg._id) === this.normalizeId(ms.MaDocGia));
        const sach = saches.find(s => this.normalizeId(s._id) === this.normalizeId(ms.sachId) || this.normalizeId(s._id) === this.normalizeId(ms.MaSach));
        const msNhanVienId = this.normalizeId(ms.nhanVienId) || this.normalizeId(ms.MaNhanVien) || this.normalizeId(ms.NhanVienId) || this.normalizeId(ms.NHANVIENID);
        const nhanVien = nhanViens.find(nv => {
          const nvId = this.normalizeId(nv._id) || this.normalizeId(nv.MaNhanVien) || this.normalizeId(nv.MSNV);
          return nvId !== '' && nvId === msNhanVienId;
        });

        // Build reader name (HOLOT + TEN)
        const tenDocGia = docGia 
          ? ((docGia.HOLOT || '') + ' ' + (docGia.TEN || '')).trim() 
          : '';

        // Build book name
        const tenSach = sach?.TENSACH || sach?.TenSach || '';

        // Build staff name (HoTenNV)
        const tenNhanVien = nhanVien?.HoTenNV || nhanVien?.HoTen || ms.nhanVienName || ms.TenNhanVien || '';

        return {
          ...ms,
          TenDocGia: tenDocGia,
          TenSach: tenSach,
          TenNhanVien: tenNhanVien,
          NgayMuon: ms.ngayMuon || ms.NgayMuon,
          NgayHetHan: ms.ngayTra || ms.NgayHetHan,
          NgayTra: ms.ngayTraThucTe || ms.NgayTra,
          TrangThai: ms.trangThai || ms.TrangThai,
          GhiChu: ms.ghiChu || ms.GhiChu || '',
          HinhAnh: sach?.HinhAnh || sach?.HINHANH || ''
        };
      });

      return {
        docGias,
        saches: populatedSaches,
        muonSaches: populatedMuonSaches,
        nhaXuatBans,
        nhanViens
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      throw error;
    }
  }

  // Tính toán thống kê
  calculateStatistics(data) {
    try {
      const { saches, muonSaches, docGias } = data;

      // Sách hết (số lượng = 0)
      const outOfStockBooks = saches.filter(s => {
        const soLuong = s.SOQUYEN || s.SoLuong || 0;
        return soLuong === 0;
      });

      // Sách còn
      const inStockBooks = saches.filter(s => {
        const soLuong = s.SOQUYEN || s.SoLuong || 0;
        return soLuong > 0;
      });

      // Sách mượn nhiều nhất
      const bookBorrowCount = {};
      muonSaches.forEach(ms => {
        const sachId = ms.sachId || ms.MaSach || ms._id;
        bookBorrowCount[sachId] = (bookBorrowCount[sachId] || 0) + 1;
      });

      const topBorrowedBooks = saches
        .map(s => ({
          ...s,
          borrowCount: bookBorrowCount[s._id] || 0
        }))
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10);

      // Độc giả mượn nhiều nhất
      const readerBorrowCount = {};
      muonSaches.forEach(ms => {
        const docGiaId = ms.docGiaId || ms.MaDocGia || ms._id;
        readerBorrowCount[docGiaId] = (readerBorrowCount[docGiaId] || 0) + 1;
      });

      const topBorrowingReaders = docGias
        .map(d => ({
          ...d,
          borrowCount: readerBorrowCount[d._id] || 0
        }))
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10);

      // Sách quá hạn
      const now = new Date();
      const overdueBooks = muonSaches.filter(ms => {
        const status = (ms.trangThai || ms.TrangThai || '').toLowerCase();
        const hanDate = new Date(ms.ngayTra || ms.NgayHetHan || ms.NgayTra);
        return status === 'đang mượn' && hanDate < now;
      });

      return {
        totalBooks: saches.length,
        outOfStockBooks,
        inStockBooks,
        totalReaders: docGias.length,
        totalBorrows: muonSaches.length,
        activeBorrows: muonSaches.filter(ms => {
          const status = (ms.trangThai || ms.TrangThai || '').toLowerCase();
          return status === 'đang mượn';
        }).length,
        returnedBorrows: muonSaches.filter(ms => {
          const status = (ms.trangThai || ms.TrangThai || '').toLowerCase();
          return status === 'đã trả';
        }).length,
        topBorrowedBooks,
        topBorrowingReaders,
        overdueBooks
      };
    } catch (error) {
      console.error('Lỗi khi tính toán thống kê:', error);
      return {
        totalBooks: 0,
        outOfStockBooks: [],
        inStockBooks: [],
        totalReaders: 0,
        totalBorrows: 0,
        activeBorrows: 0,
        returnedBorrows: 0,
        topBorrowedBooks: [],
        topBorrowingReaders: [],
        overdueBooks: []
      };
    }
  }

  // Format tiền tệ
  formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value || 0);
  }

  // Định dạng ngày tháng
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  }

  // Lấy ảnh từ URL và chuyển thành base64
  async fetchImageAsBase64(imageUrl) {
    if (!imageUrl) return null;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          const base64 = result.includes('base64,') ? result.split('base64,')[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Không thể tải ảnh:', imageUrl, error);
      return null;
    }
  }

  // Xác định extension ảnh từ URL
  getImageExtension(imageUrl) {
    if (!imageUrl) return 'png';
    const url = imageUrl.toLowerCase();
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('image/jpeg')) return 'jpeg';
    if (url.includes('.png') || url.includes('image/png')) return 'png';
    if (url.includes('.gif') || url.includes('image/gif')) return 'gif';
    if (url.includes('.webp') || url.includes('image/webp')) return 'webp';
    return 'png';
  }

  // Style cho trạng thái "Còn hàng" (xanh lá)
  getInStockStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } },
      font: { color: { argb: 'FF155724' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Hết hàng" (đỏ nhạt)
  getOutOfStockStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } },
      font: { color: { argb: 'FF721C24' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Đang mượn" (vàng)
  getBorrowingStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } },
      font: { color: { argb: 'FF856404' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Đã trả" (xanh lá)
  getReturnedStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } },
      font: { color: { argb: 'FF155724' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Quá hạn" (đỏ đậm)
  getOverdueStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } },
      font: { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Chờ duyệt" (xám)
  getPendingApprovalStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E2E2' } },
      font: { color: { argb: 'FF6C757D' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Đã duyệt" (xanh dương nhạt)
  getApprovedStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE5FF' } },
      font: { color: { argb: 'FF004085' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Đang chờ trả" (tím nhạt)
  getPendingReturnStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8CCFF' } },
      font: { color: { argb: 'FF6F42C1' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style cho trạng thái "Từ chối" (cam/đỏ nhạt)
  getRejectedStyle() {
    return {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD6D6' } },
      font: { color: { argb: 'FFB02A2A' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Tạo style header
  getHeaderStyle() {
    return {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E75B6' }
      },
      font: {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
      },
      border: {
        left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      }
    };
  }

  // Tạo style row thông thường
  getRowStyle() {
    return {
      alignment: {
        horizontal: 'left',
        vertical: 'center',
        wrapText: true
      },
      border: {
        left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      }
    };
  }

  // Tạo style màu xen kẽ
  getAlternateRowStyle(rowIndex) {
    const style = this.getRowStyle();
    if (rowIndex % 2 === 0) {
      style.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    }
    return style;
  }

  // Sheet 1: Tổng quan
  async createOverviewSheet(workbook, data, stats) {
    const sheet = workbook.addWorksheet('Tổng Quan');

    sheet.columns = [
      { header: 'Chỉ Tiêu', key: 'indicator', width: 30 },
      { header: 'Số Lượng', key: 'value', width: 20 }
    ];

    // Format header
    sheet.getRow(1).eachCell(cell => {
      cell.style = this.getHeaderStyle();
    });

    const overviewData = [
      { indicator: 'Tổng Số Đầu Sách', value: stats.totalBooks },
      { indicator: 'Sách Còn Lại', value: stats.inStockBooks.length },
      { indicator: 'Sách Hết Hàng', value: stats.outOfStockBooks.length },
      { indicator: 'Tổng Độc Giả', value: stats.totalReaders },
      { indicator: 'Tổng Phiếu Mượn', value: stats.totalBorrows },
      { indicator: 'Phiếu Đang Mượn', value: stats.activeBorrows },
      { indicator: 'Phiếu Đã Trả', value: stats.returnedBorrows },
      { indicator: 'Phiếu Quá Hạn', value: stats.overdueBooks.length }
    ];

    overviewData.forEach((item, index) => {
      const row = sheet.addRow(item);
      row.eachCell(cell => {
        cell.style = this.getAlternateRowStyle(index);
      });
    });
  }

  // Sheet 2: Danh sách sách (có hình ảnh, trạng thái tô màu)
  async createBooksSheet(workbook, books) {
    const sheet = workbook.addWorksheet('Danh Sách Sách');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Hình Ảnh', key: 'image', width: 12 },
      { header: 'Tên Sách', key: 'TenSach', width: 28 },
      { header: 'Tác Giả', key: 'TacGia', width: 18 },
      { header: 'Nhà Xuất Bản', key: 'TenNhaXuatBan', width: 22 },
      { header: 'Số Lượng', key: 'SoLuong', width: 10 },
      { header: 'Giá', key: 'Gia', width: 15 },
      { header: 'Năm XB', key: 'NamXuatBan', width: 10 },
      { header: 'Trạng Thái', key: 'status', width: 14 }
    ];

    sheet.getRow(1).eachCell(cell => { cell.style = this.getHeaderStyle(); });
    sheet.getRow(1).height = 25;

    for (let index = 0; index < books.length; index++) {
      const book = books[index];
      const tenSach = book.TENSACH || book.TenSach || '';
      const tacGia = book.TACGIA || book.TacGia || '';
      const tenNXB = book.TENNXB || book.TenNhaXuatBan || '';
      const soLuong = book.SOQUYEN || book.SoLuong || 0;
      const gia = book.DONGIA || book.Gia || 0;
      const namXB = book.NAMXUATBAN || book.NamXuatBan || '';
      const hinhAnh = book.HinhAnh || book.HINHANH || '';
      const statusText = soLuong > 0 ? 'Còn hàng' : 'Hết hàng';

      const row = sheet.addRow({
        stt: index + 1,
        TenSach: tenSach,
        TacGia: tacGia,
        TenNhaXuatBan: tenNXB,
        SoLuong: soLuong,
        Gia: gia,
        NamXuatBan: namXB,
        status: statusText
      });

      row.height = 90;

      row.eachCell((cell, colNumber) => {
        cell.style = this.getAlternateRowStyle(index);
        if (colNumber === 1 || colNumber === 6 || colNumber === 8) {
          cell.alignment = { horizontal: 'center', vertical: 'center' };
        }
        if (colNumber === 7) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right', vertical: 'center' };
        }
      });

      // Cột Trạng Thái (col 9) - tô màu
      const statusCell = row.getCell(9);
      if (soLuong > 0) {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getInStockStyle() };
      } else {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getOutOfStockStyle() };
      }

      // Chèn ảnh sách vào cột B
      if (hinhAnh) {
        try {
          const base64Image = await this.fetchImageAsBase64(hinhAnh);
          if (base64Image) {
            const ext = this.getImageExtension(hinhAnh);
            const imageId = workbook.addImage({ base64: base64Image, extension: ext });
            sheet.addImage(imageId, {
              tl: { col: 1, row: index + 1 },
              ext: { width: 64, height: 80 }
            });
          }
        } catch (imgError) {
          console.warn('Lỗi chèn ảnh:', tenSach, imgError);
        }
      }
    }

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'I1'; } catch (e) { }
  }

  // Sheet 3: Danh sách độc giả
  async createReadersSheet(workbook, readers) {
    const sheet = workbook.addWorksheet('Danh Sách Độc Giả');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Tên Độc Giả', key: 'Ten', width: 22 },
      { header: 'Tên Đăng nhập', key: 'Email', width: 22 },
      { header: 'Số Điện Thoại', key: 'SDT', width: 16 },
      { header: 'Địa Chỉ', key: 'DiaChi', width: 28 },
      { header: 'Trạng Thái', key: 'TrangThai', width: 12 }
    ];

    sheet.getRow(1).eachCell(cell => { cell.style = this.getHeaderStyle(); });

    readers.forEach((reader, index) => {
      const ten = ((reader.HOLOT || '') + ' ' + (reader.TEN || '')).trim() || reader.HoTen || reader.HOTEN || '';
      const email = reader.Email || reader.EMAIL || reader.username || '';
      const sdt = reader.DIENTHOAI || reader.SDT || reader.SODIENTHOAI || '';
      const diaChi = reader.DIACHI || reader.DiaChi || '';

      const row = sheet.addRow({
        stt: index + 1,
        Ten: ten,
        Email: email,
        SDT: sdt,
        DiaChi: diaChi,
        TrangThai: reader.TrangThai || 'Hoạt động'
      });

      row.eachCell(cell => { cell.style = this.getAlternateRowStyle(index); });
    });

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'F1'; } catch (e) { }
  }

  // Sheet 4: Quản lý mượn sách (bỏ mã, tô màu trạng thái theo từng loại)
  async createBorrowsSheet(workbook, borrows) {
    const sheet = workbook.addWorksheet('Mượn Trả Sách');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Độc Giả', key: 'TenDocGia', width: 18 },
      { header: 'Tên Sách', key: 'TenSach', width: 22 },
      { header: 'Nhân Viên', key: 'TenNhanVien', width: 18 },
      { header: 'Ngày Mượn', key: 'NgayMuon', width: 14 },
      { header: 'Hạn Trả', key: 'NgayHetHan', width: 14 },
      { header: 'Ngày Trả', key: 'NgayTra', width: 14 },
      { header: 'Trạng Thái', key: 'TrangThai', width: 18 },
      { header: 'Ghi Chú', key: 'GhiChu', width: 22 }
    ];

    sheet.getRow(1).eachCell(cell => { cell.style = this.getHeaderStyle(); });
    sheet.getRow(1).height = 25;

    const now = new Date();

    borrows.forEach((borrow, index) => {
      const statusKey = (borrow.TrangThai || borrow.trangThai || '').trim();
      const statusLower = statusKey.toLowerCase();
      const hanDate = new Date(borrow.NgayHetHan || borrow.ngayTra);
      const isOverdue = statusLower === 'đang mượn' && hanDate < now;

      const row = sheet.addRow({
        stt: index + 1,
        TenDocGia: borrow.TenDocGia || '',
        TenSach: borrow.TenSach || '',
        TenNhanVien: borrow.TenNhanVien || '',
        NgayMuon: this.formatDate(borrow.NgayMuon || borrow.ngayMuon),
        NgayHetHan: this.formatDate(borrow.NgayHetHan || borrow.ngayTra),
        NgayTra: borrow.NgayTra || borrow.ngayTraThucTe
          ? this.formatDate(borrow.NgayTra || borrow.ngayTraThucTe) : '',
        TrangThai: statusKey,
        GhiChu: isOverdue ? '⚠ QUÁ HẠN' : (borrow.GhiChu || borrow.ghiChu || '')
      });

      // Style cơ bản
      row.eachCell((cell, colNumber) => {
        cell.style = this.getAlternateRowStyle(index);
        if (colNumber === 1) {
          cell.alignment = { horizontal: 'center', vertical: 'center' };
        }
        if (colNumber === 9 && isOverdue) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'center' };
        }
      });

      // Cột Trạng Thái (col 8) - tô màu theo từng trạng thái
      const statusCell = row.getCell(8);
      if (isOverdue) {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getOverdueStyle() };
      } else if (statusLower === 'chờ duyệt') {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getPendingApprovalStyle() };
      } else if (statusLower === 'đã duyệt') {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getApprovedStyle() };
      } else if (statusLower === 'đang mượn') {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getBorrowingStyle() };
      } else if (statusLower === 'đang chờ trả') {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getPendingReturnStyle() };
      } else if (statusLower === 'đã trả') {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getReturnedStyle() };
      } else if (statusLower === 'từ chối') {
        statusCell.style = { ...this.getAlternateRowStyle(index), ...this.getRejectedStyle() };
      } else {
        statusCell.alignment = { horizontal: 'center', vertical: 'center' };
      }
    });

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'I1'; } catch (e) { }
  }

  // Sheet 5: Sách mượn nhiều nhất
  async createTopBorrowedBooksSheet(workbook, topBooks) {
    const sheet = workbook.addWorksheet('Top Sách Mượn Nhiều');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Tên Sách', key: 'TenSach', width: 25 },
      { header: 'Tác Giả', key: 'TacGia', width: 15 },
      { header: 'Số Lần Mượn', key: 'borrowCount', width: 14 },
      { header: 'Tổng Số Lượng', key: 'SoLuong', width: 14 }
    ];

    sheet.getRow(1).eachCell(cell => { cell.style = this.getHeaderStyle(); });

    topBooks.forEach((book, index) => {
      const tenSach = book.TENSACH || book.TenSach || '';
      const tacGia = book.TACGIA || book.TacGia || '';
      const soLuong = book.SOQUYEN || book.SoLuong || 0;

      const row = sheet.addRow({
        stt: index + 1,
        TenSach: tenSach,
        TacGia: tacGia,
        borrowCount: book.borrowCount || 0,
        SoLuong: soLuong
      });

      row.eachCell(cell => { cell.style = this.getAlternateRowStyle(index); });
    });

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'E1'; } catch (e) { }
  }

  // Sheet 6: Độc giả mượn nhiều nhất
  async createTopBorrowingReadersSheet(workbook, topReaders) {
    const sheet = workbook.addWorksheet('Top Độc Giả Mượn Nhiều');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Tên Độc Giả', key: 'Ten', width: 22 },
      { header: 'Tên đăng nhập', key: 'Email', width: 22 },
      { header: 'Số Điện Thoại', key: 'SDT', width: 16 },
      { header: 'Số Lần Mượn', key: 'borrowCount', width: 14 }
    ];

    sheet.getRow(1).eachCell(cell => { cell.style = this.getHeaderStyle(); });

    topReaders.forEach((reader, index) => {
      const ten = ((reader.HOLOT || '') + ' ' + (reader.TEN || '')).trim() || reader.HoTen || reader.HOTEN || '';
      const email = reader.Email || reader.EMAIL || reader.username || '';
      const sdt = reader.DIENTHOAI || reader.SDT || reader.SODIENTHOAI || '';

      const row = sheet.addRow({
        stt: index + 1,
        Ten: ten,
        Email: email,
        SDT: sdt,
        borrowCount: reader.borrowCount || 0
      });

      row.eachCell(cell => { cell.style = this.getAlternateRowStyle(index); });
    });

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'E1'; } catch (e) { }
  }

  // Sheet 7: Sách hết hàng (bỏ mã sách)
  async createOutOfStockSheet(workbook, outOfStockBooks) {
    const sheet = workbook.addWorksheet('Sách Hết Hàng');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Tên Sách', key: 'TenSach', width: 28 },
      { header: 'Tác Giả', key: 'TacGia', width: 18 },
      { header: 'Nhà Xuất Bản', key: 'TenNhaXuatBan', width: 22 },
      { header: 'Giá', key: 'Gia', width: 15 }
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.style = this.getHeaderStyle();
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
    });

    outOfStockBooks.forEach((book, index) => {
      const tenSach = book.TENSACH || book.TenSach || '';
      const tacGia = book.TACGIA || book.TacGia || '';
      const gia = book.DONGIA || book.Gia || 0;

      const row = sheet.addRow({
        stt: index + 1,
        TenSach: tenSach,
        TacGia: tacGia,
        TenNhaXuatBan: book.TenNhaXuatBan || '',
        Gia: gia
      });

      row.eachCell((cell, colNumber) => {
        cell.style = this.getAlternateRowStyle(index);
        if (colNumber === 5) { cell.numFmt = '#,##0'; }
      });
    });

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'E1'; } catch (e) { }
  }

  // Sheet 8: Phiếu quá hạn (bỏ mã phiếu)
  async createOverdueSheet(workbook, overdueBooks) {
    const sheet = workbook.addWorksheet('Phiếu Quá Hạn');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Độc Giả', key: 'TenDocGia', width: 18 },
      { header: 'Tên Sách', key: 'TenSach', width: 22 },
      { header: 'Ngày Mượn', key: 'NgayMuon', width: 14 },
      { header: 'Hạn Trả', key: 'NgayHetHan', width: 14 },
      { header: 'Số Ngày Quá Hạn', key: 'daysOverdue', width: 18 }
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.style = this.getHeaderStyle();
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC3545' } };
    });

    const now = new Date();
    overdueBooks.forEach((borrow, index) => {
      const dueDate = new Date(borrow.NgayHetHan || borrow.ngayTra);
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

      const row = sheet.addRow({
        stt: index + 1,
        TenDocGia: borrow.TenDocGia || '',
        TenSach: borrow.TenSach || '',
        NgayMuon: this.formatDate(borrow.NgayMuon || borrow.ngayMuon),
        NgayHetHan: this.formatDate(borrow.NgayHetHan || borrow.ngayTra),
        daysOverdue: daysOverdue
      });

      row.eachCell(cell => {
        cell.style = this.getAlternateRowStyle(index);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } };
      });
    });

    try { sheet.autoFilter.from = 'A1'; sheet.autoFilter.to = 'F1'; } catch (e) { }
  }

  // Hàm chính export
  async exportToExcel(selectedSheets) {
    try {
      // Lấy dữ liệu
      const data = await this.getAllData();
      const stats = this.calculateStatistics(data);

      // Tạo workbook
      const workbook = new ExcelJS.Workbook();
      workbook.properties.title = 'Báo Cáo Quản Lý Mượn Sách';
      workbook.properties.author = 'Hệ thống Quản lý Mượn Sách';

      // Tạo sheet theo lựa chọn
      if (selectedSheets.includes('overview')) {
        try { await this.createOverviewSheet(workbook, data, stats); } catch (e) { console.warn('Lỗi sheet Tổng Quan:', e); }
      }
      if (selectedSheets.includes('books')) {
        try { await this.createBooksSheet(workbook, data.saches); } catch (e) { console.warn('Lỗi sheet Danh Sách Sách:', e); }
      }
      if (selectedSheets.includes('readers')) {
        try { await this.createReadersSheet(workbook, data.docGias); } catch (e) { console.warn('Lỗi sheet Danh Sách Độc Giả:', e); }
      }
      if (selectedSheets.includes('borrows')) {
        try { await this.createBorrowsSheet(workbook, data.muonSaches); } catch (e) { console.warn('Lỗi sheet Mượn Trả Sách:', e); }
      }
      if (selectedSheets.includes('topBooks')) {
        try { await this.createTopBorrowedBooksSheet(workbook, stats.topBorrowedBooks); } catch (e) { console.warn('Lỗi sheet Top Sách:', e); }
      }
      if (selectedSheets.includes('topReaders')) {
        try { await this.createTopBorrowingReadersSheet(workbook, stats.topBorrowingReaders); } catch (e) { console.warn('Lỗi sheet Top Độc Giả:', e); }
      }
      if (selectedSheets.includes('outOfStock')) {
        try { await this.createOutOfStockSheet(workbook, stats.outOfStockBooks); } catch (e) { console.warn('Lỗi sheet Sách Hết Hàng:', e); }
      }
      if (selectedSheets.includes('overdue')) {
        try { await this.createOverdueSheet(workbook, stats.overdueBooks); } catch (e) { console.warn('Lỗi sheet Phiếu Quá Hạn:', e); }
      }

      // Lưu file
      const fileName = `Báo Cáo Quản Lý Mượn Sách_${new Date().toLocaleDateString('vi-VN')}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);

      return {
        success: true,
        message: 'Export Excel thành công!'
      };
    } catch (error) {
      console.error('Lỗi khi export Excel:', error);
      throw new Error('Lỗi khi export Excel: ' + (error.message || 'Vui lòng thử lại'));
    }
  }
}

export default new ExportService();
