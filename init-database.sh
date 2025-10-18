#!/bin/bash
# Script để khởi tạo database trong Docker container

echo "Đợi SQL Server khởi động hoàn toàn..."
sleep 30

echo "Tạo database và import dữ liệu..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /docker-entrypoint-initdb.d/sourceCode.sql

echo "Database đã được khởi tạo thành công!"
