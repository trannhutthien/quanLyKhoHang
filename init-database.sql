-- Script tự động khởi tạo dữ liệu cho Docker
USE QuanLyKho_JSON;
GO

-- Kiểm tra nếu chưa có dữ liệu thì mới insert
IF NOT EXISTS (SELECT 1 FROM NGUOI_DUNG WHERE TenDangNhap = 'admin')
BEGIN
    INSERT INTO NGUOI_DUNG (MaNguoiDung, TenDangNhap, MatKhau, HoTen, VaiTro) 
    VALUES ('u-1', 'admin', 'admin123', N'Quản trị viên', 'admin');
    
    PRINT 'Created admin user';
END
GO

-- Thêm kho mẫu
IF NOT EXISTS (SELECT 1 FROM KHO WHERE MaKho = 'kho-a')
BEGIN
    INSERT INTO KHO (MaKho, TenKho, DiaChi, NguoiQuanLyId, TrangThai) 
    VALUES 
        ('kho-a', N'Kho A', N'Hà Nội', 'u-1', N'Hoạt động'),
        ('kho-b', N'Kho B', N'Hồ Chí Minh', 'u-1', N'Hoạt động');
    
    PRINT 'Created sample warehouses';
END
GO

-- Thêm hàng hóa mẫu
IF NOT EXISTS (SELECT 1 FROM HANG_HOA WHERE MaHang = 'sp-001')
BEGIN
    INSERT INTO HANG_HOA (MaHang, TenHang, MaSKU, DonVi, DanhMuc, GiaNhap, GiaBan)
    VALUES 
        ('sp-001', N'Bao bì carton', 'SKU-001', N'cái', N'Bao bì', 5000, 8000),
        ('sp-002', N'Găng tay bảo hộ', 'SKU-002', N'đôi', N'An toàn', 15000, 25000);
    
    -- Thêm tồn kho
    INSERT INTO TON_KHO (MaHang, MaKho, SoLuongTon)
    VALUES 
        ('sp-001', 'kho-a', 100),
        ('sp-002', 'kho-a', 50),
        ('sp-001', 'kho-b', 200);
    
    PRINT 'Created sample items and inventory';
END
GO

PRINT 'Database initialization completed';
GO
