#!/bin/bash
# Script tự động chạy SQL files khi SQL Server khởi động lần đầu

# Đợi SQL Server sẵn sàng
echo "Waiting for SQL Server to start..."
sleep 30s

# Chạy schema
echo "Creating database schema..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /docker-entrypoint-initdb.d/01-schema.sql

# Chạy data
echo "Inserting initial data..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /docker-entrypoint-initdb.d/02-data.sql

echo "Database initialization completed!"
