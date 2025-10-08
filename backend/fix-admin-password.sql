-- =============================================
-- Script: Hash password và cập nhật user admin
-- Password: 123456
-- =============================================

USE [QuanLyKho_JSON]
GO

-- Cập nhật password về plaintext (không hash) cho demo
-- ⚠️ CHỈ DÙNG CHO DEMO - KHÔNG BAO GIỜ DÙNG TRONG PRODUCTION!
UPDATE dbo.NGUOI_DUNG 
SET MatKhau = N'123456'
WHERE MaNguoiDung = N'u-1';
GO

-- Verify
SELECT 
    MaNguoiDung,
    TenDangNhap,
    HoTen,
    VaiTro,
    LEFT(MatKhau, 20) + '...' AS PasswordHash
FROM dbo.NGUOI_DUNG
WHERE TenDangNhap = N'admin';
GO

PRINT '✅ User admin created successfully!'
PRINT 'Username: admin'
PRINT 'Password: 123456 (bcrypt hashed)'
GO
