@echo off
echo ========================================
echo   KHOI TAO DATABASE TRONG DOCKER
echo ========================================
echo.

echo [1/2] Kiem tra SQL Server container...
docker ps | findstr quanly-sqlserver >nul
if errorlevel 1 (
    echo [ERROR] Container quanly-sqlserver khong chay!
    echo Hay chay: docker-compose up -d
    pause
    exit /b 1
)

echo [2/2] Import database tu file sourceCode.sql...
docker exec -i quanly-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd123" -C < Database\sourceCode.sql

if errorlevel 1 (
    echo [ERROR] Import database that bai!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   THANH CONG!
echo ========================================
echo Database QuanLyKho_JSON da duoc tao.
echo.
echo Kiem tra:
echo docker exec quanly-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd123" -C -Q "SELECT name FROM sys.databases"
echo.
pause
