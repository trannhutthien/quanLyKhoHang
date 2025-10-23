-- Script tạo user backend_user cho SQL Server local
USE master;
GO

-- Tạo login nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'backend_user')
BEGIN
    CREATE LOGIN backend_user WITH PASSWORD = 'Backend@123456';
    PRINT 'Created login: backend_user';
END
ELSE
BEGIN
    PRINT 'Login backend_user already exists';
END
GO

-- Chuyển sang database QuanLyKho_JSON
USE QuanLyKho_JSON;
GO

-- Tạo user trong database
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'backend_user')
BEGIN
    CREATE USER backend_user FOR LOGIN backend_user;
    PRINT 'Created user: backend_user';
END
ELSE
BEGIN
    PRINT 'User backend_user already exists';
END
GO

-- Cấp quyền đầy đủ
ALTER ROLE db_owner ADD MEMBER backend_user;
GO

PRINT 'User backend_user has been granted db_owner role';
GO
