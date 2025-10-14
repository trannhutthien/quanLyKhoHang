## 🎯 BƯỚC 1: KHỞI ĐỘNG BACKEND
```powershell

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

## 🧪 BƯỚC 2: TEST BACKEND API

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

###  Nếu tất cả API trả về dữ liệu → Backend OK!**


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
