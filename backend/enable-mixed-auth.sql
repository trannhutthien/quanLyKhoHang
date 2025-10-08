-- =============================================
-- Script: Enable SQL Server Authentication Mode
-- =============================================

-- Kiểm tra authentication mode hiện tại
-- 0 = Windows Authentication Only
-- 1 = Mixed Mode (Windows + SQL Server Authentication)

EXEC xp_instance_regread 
    N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode'
GO

-- Enable Mixed Mode Authentication
EXEC xp_instance_regwrite 
    N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode', 
    REG_DWORD, 
    2  -- 2 = Mixed Mode
GO

PRINT '✅ Mixed Mode Authentication enabled!'
PRINT '⚠️ QUAN TRỌNG: Phải RESTART SQL Server service để thay đổi có hiệu lực!'
PRINT ''
PRINT 'Chạy lệnh sau trong PowerShell (as Administrator):'
PRINT 'Restart-Service -Name "MSSQL$SQLNHUTTHIEN" -Force'
GO
