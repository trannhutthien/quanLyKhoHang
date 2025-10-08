# 🚀 HƯỚNG DẪN CHẠY LOCAL BACKEND + FRONTEND

## 📋 CHUẨN BỊ

### ✅ Đã hoàn thành:
- [x] SQL Server đang chạy
- [x] Database `QuanLyKho_JSON` đã tạo và có dữ liệu
- [x] SQL Login `backend_user` đã tạo
- [x] Backend code đã sẵn sàng
- [x] Frontend đã cập nhật LoginView.vue

---

## 🎯 BƯỚC 1: KHỞI ĐỘNG BACKEND

### **Mở Terminal 1 (PowerShell)**

```powershell
# Di chuyển vào thư mục backend
cd d:\CongNghePhanMem\quanLyKhoHang\backend

# Kiểm tra .env có đúng không
Get-Content .env

# Phải thấy:
# DB_SERVER=LAPTOP-NHUTTHIE
# DB_PORT=62978
# DB_USER=backend_user
# DB_PASSWORD=Backend@123456
# DB_TRUSTED_CONNECTION=false

# Khởi động backend
npm run dev
```

### **Kết quả mong đợi:**

```
✅ Connected to SQL Server: QuanLyKho_JSON
🚀 Server running on http://localhost:3001
📊 Database: QuanLyKho_JSON
```

### **⚠️ Nếu gặp lỗi:**

**Lỗi 1: "Login failed for user 'backend_user'"**
→ Chạy script tạo user:
```powershell
sqlcmd -S "LAPTOP-NHUTTHIE\SQLNHUTTHIEN" -E -i create-sql-login.sql
```

**Lỗi 2: "Port ... not found"**
→ Kiểm tra SQL Server đang chạy:
```powershell
Get-Service -Name "MSSQL$SQLNHUTTHIEN"
```

---

## 🧪 BƯỚC 2: TEST BACKEND API

### **Mở Terminal 2 (PowerShell mới)**

```powershell
# Test 1: Health Check
Invoke-RestMethod -Uri "http://localhost:3001/healthz"
# Kết quả: {"status":"ok","database":"QuanLyKho_JSON"}

# Test 2: Lấy danh sách kho
Invoke-RestMethod -Uri "http://localhost:3001/warehouses"
# Kết quả: Array các kho [{"id":"kho-a","name":"Kho A",...}]

# Test 3: Lấy danh sách hàng hóa
Invoke-RestMethod -Uri "http://localhost:3001/items"
# Kết quả: Array các item
```

### **✅ Nếu tất cả API trả về dữ liệu → Backend OK!**

---

## 🎨 BƯỚC 3: KHỞI ĐỘNG FRONTEND

### **Mở Terminal 3 (PowerShell mới)**

```powershell
# Di chuyển vào thư mục frontend
cd d:\CongNghePhanMem\quanLyKhoHang\warehouse-management

# Kiểm tra vite.config.ts có proxy chưa
Get-Content vite.config.ts | Select-String -Pattern "proxy"

# Phải thấy:
# server: {
#   proxy: {
#     '/api': {
#       target: 'http://localhost:3001',
#       ...

# Khởi động frontend
npm run dev
```

### **Kết quả mong đợi:**

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 BƯỚC 4: KIỂM TRA TRONG TRÌNH DUYỆT

### **1. Mở trình duyệt:**
```
http://localhost:5173/login
```

### **2. Đăng nhập:**
- **Username:** `admin`
- **Password:** `123456`

### **3. Kiểm tra:**

**✅ Nếu login thành công:**
- Chuyển đến trang Home
- Xem danh sách kho trong menu Inventory

**❌ Nếu login thất bại:**

**Lỗi: "Invalid credentials"**
→ Password trong database chưa được hash đúng.

**FIX:** Chạy script này trong SQL Server:

```sql
USE QuanLyKho_JSON;

-- Password '123456' đã hash bằng bcrypt (10 rounds)
UPDATE dbo.NGUOI_DUNG 
SET MatKhau = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE TenDangNhap = 'admin';
```

Hoặc tạo user mới với password đã hash:

```sql
-- Xóa user cũ (nếu có)
DELETE FROM dbo.NGUOI_DUNG WHERE MaNguoiDung = 'u-1';

-- Thêm user mới với password đã hash
INSERT INTO dbo.NGUOI_DUNG (MaNguoiDung, TenDangNhap, MatKhau, HoTen, VaiTro)
VALUES (
    'u-1',
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password: 123456
    N'Quản trị viên',
    'admin'
);
```

---

## 📊 BƯỚC 5: KIỂM TRA DỮ LIỆU RENDER

### **Sau khi login thành công:**

1. **Vào menu "Inventory" hoặc "Kho hàng"**
   - Phải thấy danh sách kho: Kho A, kho d, kho i

2. **Click vào một kho**
   - Phải thấy danh sách hàng hóa trong kho đó
   - Ví dụ: Kho A có "Thùng carton", "Băng keo", "Nón bảo hộ"

3. **Mở DevTools (F12) → Network tab**
   - Refresh trang
   - Xem các request:
     - `GET /api/warehouses` → Status 200
     - `GET /api/items?warehouseId=kho-a` → Status 200

### **✅ Nếu thấy dữ liệu → HOÀN THÀNH!**

---

## 🔧 TROUBLESHOOTING

### **Backend không start**
```powershell
# Kiểm tra port 3001 có bị chiếm không
netstat -ano | findstr :3001

# Kill process nếu có
taskkill /PID <PID> /F
```

### **Frontend không gọi được API**
```powershell
# Kiểm tra Vite proxy
cd warehouse-management
cat vite.config.ts
```

Phải có:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
  }
}
```

### **CORS Error**
→ Backend đã có `app.use(cors())`, kiểm tra lại `server.js`

---

## 📸 DEMO FLOW

```
1. User mở http://localhost:5173/login
2. Nhập admin / 123456
3. Frontend gọi: POST http://localhost:5173/api/auth/login
4. Vite proxy chuyển sang: POST http://localhost:3001/auth/login
5. Backend query: SELECT * FROM NGUOI_DUNG WHERE TenDangNhap = 'admin'
6. Backend verify password bằng bcrypt.compare()
7. Backend trả về: { id, username, name, role, isAuthenticated: true }
8. Frontend lưu vào localStorage và redirect đến /
9. Frontend load danh sách kho: GET /api/warehouses
10. Backend query: SELECT * FROM KHO WHERE DaXoa = 0
11. Backend map dữ liệu tiếng Việt → tiếng Anh và trả về
12. Frontend render danh sách kho
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Backend đang chạy trên http://localhost:3001
- [ ] Test API `/healthz` trả về OK
- [ ] Test API `/warehouses` trả về danh sách kho
- [ ] Frontend đang chạy trên http://localhost:5173
- [ ] Login thành công với admin/123456
- [ ] Danh sách kho hiển thị đúng
- [ ] Danh sách hàng hóa hiển thị đúng
- [ ] DevTools Network tab không có lỗi

---

## 🎉 KẾT LUẬN

**Bạn đã hoàn thành:**
- ✅ Chuyển từ json-server sang SQL Server
- ✅ Backend Node.js kết nối database thật
- ✅ Frontend gọi API qua backend
- ✅ Dữ liệu được query từ SQL Server và render lên UI

**Bước tiếp theo:**
- Docker Compose setup (nếu cần deploy)
- Thêm các API khác (POST/PUT/DELETE)
- Tối ưu performance và security
