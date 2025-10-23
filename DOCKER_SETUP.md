# Hướng dẫn chạy Docker

## Bước 1: Build
```cmd
docker-compose build --no-cache
```

## Bước 2: Khởi động
```cmd
docker-compose up -d
```

## Bước 3: Khởi tạo database (chỉ lần đầu)
```cmd
setup-database.bat
```

## Truy cập
- Frontend: http://localhost:8080
- Login: `admin` / `admin123`

## Lần sau chỉ cần
```cmd
docker-compose up -d
```
(Dữ liệu đã lưu trong volume, không cần setup lại)

## Xóa tất cả và bắt đầu lại
```cmd
docker-compose down -v
docker-compose up -d
setup-database.bat
```
