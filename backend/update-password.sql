USE [QuanLyKho_JSON]
GO

-- Update password admin với bcrypt hash
-- Password gốc: 123456
UPDATE dbo.NGUOI_DUNG 
SET MatKhau = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE TenDangNhap = 'admin';
GO

-- Verify
SELECT 
    TenDangNhap,
    LEFT(MatKhau, 30) AS PasswordHash,
    LEN(MatKhau) AS Length
FROM dbo.NGUOI_DUNG 
WHERE TenDangNhap = 'admin';
GO

PRINT 'Password updated successfully!'
GO
