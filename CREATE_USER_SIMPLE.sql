-- ============================================
-- SCRIPT ĐƠN GIẢN: Tạo user cho Backend
-- ============================================

-- 1. Tạo login (tài khoản SQL Server)
USE master;
GO

CREATE LOGIN backend_app WITH PASSWORD = 'Backend@123456';
GO

-- 2. Cấp quyền vào database
USE QuanLyKho_JSON;
GO

CREATE USER backend_app FOR LOGIN backend_app;
GO

-- 3. Cho phép user này làm mọi thứ trong database
ALTER ROLE db_owner ADD MEMBER backend_app;
GO

PRINT '✅ Hoàn tất! User backend_app đã được tạo';
PRINT 'Username: backend_app';
PRINT 'Password: Backend@123456';
