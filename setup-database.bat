@echo off
echo ========================================
echo   KHOI TAO DATABASE LAN DAU
echo ========================================
echo.

echo [1/3] Cho SQL Server khoi dong (30 giay)...
timeout /t 30 /nobreak
echo.

echo [2/3] Tao cau truc database...
docker exec quanly-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd123" -C -i /docker-entrypoint-initdb.d/01-schema.sql
echo.

echo [3/3] Them du lieu mau...
docker exec quanly-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd123" -C -i /docker-entrypoint-initdb.d/02-data.sql
echo.

echo ========================================
echo   HOAN TAT!
echo ========================================
echo Du lieu da duoc khoi tao:
echo - User: admin / admin123
echo - Kho A (Ha Noi)
echo - Kho B (Ho Chi Minh)
echo.
pause
