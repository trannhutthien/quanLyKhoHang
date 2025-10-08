# 🧪 HƯỚNG DẪN TEST API

## 🚀 BƯỚC 1: KHỞI ĐỘNG BACKEND

```bash
cd backend
npm run dev
```

Nếu thấy:
```
✅ Connected to SQL Server: QuanLyKho_JSON
🚀 Server running on http://localhost:3001
📊 Database: QuanLyKho_JSON
```
→ Backend đã sẵn sàng!

---

## 📋 BƯỚC 2: TEST CÁC ENDPOINT

### **1. Health Check**
```http
GET http://localhost:3001/healthz
```
**Expected Response:**
```json
{
  "status": "ok",
  "database": "QuanLyKho_JSON"
}
```

---

### **2. Login (POST /auth/login)**

⚠️ **LƯU Ý**: Password trong database phải được hash bằng bcrypt trước!

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

**Expected Response (200):**
```json
{
  "id": "u-1",
  "username": "admin",
  "name": "Quản trị viên",
  "role": "admin",
  "isAuthenticated": true
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### **3. Lấy danh sách kho (GET /warehouses)**

```http
GET http://localhost:3001/warehouses
```

**Expected Response:**
```json
[
  {
    "id": "kho-a",
    "name": "Kho A",
    "location": "Hà Nội",
    "capacity": null,
    "status": "Hoạt động",
    "managerId": "u-1"
  },
  {
    "id": "kho-d",
    "name": "kho d",
    "location": "bến tre",
    "capacity": null,
    "status": "Hoạt động",
    "managerId": null
  }
]
```

---

### **4. Tạo kho mới (POST /warehouses)**

```http
POST http://localhost:3001/warehouses
Content-Type: application/json

{
  "id": "kho-test",
  "name": "Kho Test",
  "location": "TP.HCM"
}
```

**Expected Response (201):**
```json
{
  "id": "kho-test",
  "name": "Kho Test",
  "location": "TP.HCM"
}
```

---

### **5. Lấy danh sách hàng hóa (GET /items)**

**Tất cả items:**
```http
GET http://localhost:3001/items
```

**Lọc theo kho:**
```http
GET http://localhost:3001/items?warehouseId=kho-a
```

**Expected Response:**
```json
[
  {
    "id": "sp-001",
    "warehouseId": "kho-a",
    "name": "Thùng carton 60x40x40",
    "sku": "BOX-604040",
    "quantity": 120,
    "unit": "cái",
    "category": "Bao bì",
    "dateAdded": null,
    "expiry": null,
    "purchasePrice": null,
    "salePrice": null
  }
]
```

---

### **6. Tạo hàng hóa mới (POST /items)**

```http
POST http://localhost:3001/items
Content-Type: application/json

{
  "id": "sp-test",
  "warehouseId": "kho-a",
  "name": "Sản phẩm test",
  "sku": "TEST-001",
  "quantity": 10,
  "unit": "cái",
  "category": "Test",
  "dateAdded": "2025-10-07",
  "expiry": "2026-10-07",
  "purchasePrice": 50000,
  "salePrice": 70000
}
```

**Expected Response (201):**
```json
{
  "id": "sp-test",
  "warehouseId": "kho-a",
  "name": "Sản phẩm test",
  "sku": "TEST-001",
  "quantity": 10,
  "unit": "cái"
}
```

---

### **7. Xóa hàng hóa (DELETE /items/:id)**

```http
DELETE http://localhost:3001/items/sp-test
```

**Expected Response:** 204 No Content

---

### **8. Xóa kho (DELETE /warehouses/:id)**

```http
DELETE http://localhost:3001/warehouses/kho-test
```

**Expected Response:** 204 No Content

---

## 🔧 FIX PASSWORD HASH (NẾU CẦN)

Nếu login bị lỗi 401, chạy script này trong SQL Server để hash password:

```sql
USE QuanLyKho_JSON;
GO

-- Password '123456' đã hash bằng bcrypt (10 rounds)
UPDATE dbo.NGUOI_DUNG 
SET MatKhau = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE MaNguoiDung = 'u-1';
```

Hoặc dùng bcrypt online: https://bcrypt-generator.com/
- Input: `123456`
- Rounds: 10
- Copy hash vào SQL

---

## 🎯 TEST FRONTEND

1. **Khởi động backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Khởi động frontend:**
   ```bash
   cd warehouse-management
   npm run dev
   ```

3. **Mở trình duyệt:** http://localhost:5173/login
4. **Login:**
   - Username: `admin`
   - Password: `123456`

---

## ❌ TROUBLESHOOTING

### **Lỗi: "Login failed to connect to..."**
→ Kiểm tra SQL Server đang chạy và connection string trong `.env` đúng.

### **Lỗi: "Invalid credentials" khi login**
→ Password chưa được hash. Chạy script UPDATE ở trên.

### **Lỗi: CORS**
→ Backend đã có `app.use(cors())`, kiểm tra lại `server.js`.

### **Lỗi: Frontend không gọi được API**
→ Kiểm tra Vite proxy trong `vite.config.ts`:
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
