# 🔍 DEBUG LOGIN ISSUE

## ✅ ĐÃ FIX

Password đã được hash thành công:
```
Password: 123456 (plaintext)
→ Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
Length: 60 characters
```

## 🧪 TEST ĐĂNG NHẬP

### **Cách 1: Test API trực tiếp**

Mở PowerShell và chạy:

```powershell
$body = @{
    username = "admin"
    password = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Kết quả mong đợi:**
```json
{
  "id": "u-1",
  "username": "admin",
  "name": "Quản trị viên",
  "role": "admin",
  "isAuthenticated": true
}
```

**Nếu lỗi 401:**
→ Backend không verify được password

**Nếu lỗi 500:**
→ Xem log backend trong terminal

---

### **Cách 2: Kiểm tra trong Browser**

1. Mở http://localhost:5173/login
2. Mở DevTools (F12) → Tab **Network**
3. Nhập admin / 123456
4. Click "Đăng nhập"
5. Xem request `auth/login`:
   - **Status 200** → Thành công ✅
   - **Status 401** → Password sai ❌
   - **Status 500** → Backend error ❌

---

## 🔧 NẾU VẪN LỖI 401

### **Check 1: Xem log backend**

Trong terminal backend, xem có lỗi gì không:
```
❌ Error: ...
```

### **Check 2: Verify bcrypt comparison**

Tạo file test:

```javascript
// test-bcrypt.js
const bcrypt = require('bcryptjs');

const plainPassword = '123456';
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

bcrypt.compare(plainPassword, hash)
    .then(result => {
        console.log('Password match:', result); // Should be true
    });
```

Chạy:
```powershell
node test-bcrypt.js
```

Phải ra: `Password match: true`

---

## 📊 CHECK DATABASE

Verify password trong database:

```sql
USE QuanLyKho_JSON;

SELECT 
    TenDangNhap,
    LEFT(MatKhau, 30) AS PasswordPreview,
    LEN(MatKhau) AS Length,
    CASE 
        WHEN MatKhau LIKE '$2a$%' THEN 'BCrypt Hash ✅'
        ELSE 'Plaintext ❌'
    END AS Format
FROM dbo.NGUOI_DUNG 
WHERE TenDangNhap = 'admin';
```

Kết quả phải là:
- Length: 60
- Format: BCrypt Hash ✅

---

## 🎯 TROUBLESHOOTING CHECKLIST

- [ ] Backend đang chạy (http://localhost:3001)
- [ ] Frontend đang chạy (http://localhost:5173)
- [ ] Database password đã hash (length = 60)
- [ ] API `/auth/login` test trực tiếp thành công
- [ ] DevTools Network tab không có CORS error
- [ ] Backend terminal không có error log
