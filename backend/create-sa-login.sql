-- Chạy script này trong SQL Server Management Studio
-- Để tạo login 'sa' hoặc user khác cho backend

USE master;
GO

-- Bật SQL Server Authentication (Mixed Mode)
EXEC xp_instance_regwrite 
    N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode', 
    REG_DWORD, 
    2;
GO

-- Tạo login mới cho backend (nếu không muốn dùng sa)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'backend_app')
BEGIN
    CREATE LOGIN backend_app WITH PASSWORD = 'Backend@123456';
    PRINT 'Created login: backend_app';
END
GO

-- Cấp quyền cho database QuanLyKho_JSON
USE QuanLyKho_JSON;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'backend_app')
BEGIN
    CREATE USER backend_app FOR LOGIN backend_app;
    ALTER ROLE db_owner ADD MEMBER backend_app;
    PRINT 'Created user and granted permissions';
END
GO

PRINT '✅ Hoàn tất! Khởi động lại SQL Server để áp dụng Mixed Mode';
PRINT 'Sau đó cập nhật .env:';
PRINT '  DB_USER=backend_app';
PRINT '  DB_PASSWORD=Backend@123456';
PRINT '  DB_TRUSTED_CONNECTION=false';
GO
