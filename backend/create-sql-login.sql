-- =============================================
-- Script: Tạo SQL Login cho Backend
-- =============================================

USE [master]
GO

-- Tạo SQL Login
CREATE LOGIN [backend_user] WITH PASSWORD=N'Backend@123456', 
    DEFAULT_DATABASE=[QuanLyKho_JSON], 
    CHECK_EXPIRATION=OFF, 
    CHECK_POLICY=OFF
GO

-- Chuyển sang database
USE [QuanLyKho_JSON]
GO

-- Tạo user trong database
CREATE USER [backend_user] FOR LOGIN [backend_user]
GO

-- Gán quyền db_owner (hoặc chỉ định quyền cụ thể nếu muốn)
ALTER ROLE [db_owner] ADD MEMBER [backend_user]
GO

-- Verify
SELECT 
    name AS LoginName,
    type_desc AS LoginType,
    create_date,
    is_disabled
FROM sys.server_principals
WHERE name = 'backend_user';
GO

PRINT '✅ SQL Login "backend_user" created successfully!'
PRINT 'Username: backend_user'
PRINT 'Password: Backend@123456'
GO
