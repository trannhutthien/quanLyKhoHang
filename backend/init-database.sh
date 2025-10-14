#!/bin/sh
# Script để init database sau khi SQL Server ready

echo "⏳ Waiting for SQL Server to be ready..."
sleep 30

echo "🔧 Initializing database..."
# Chạy script SQL từ mounted volume
/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -d master \
  -Q "IF DB_ID(N'QuanLyKho_JSON') IS NULL CREATE DATABASE QuanLyKho_JSON"

echo "✅ Database initialization complete!"
