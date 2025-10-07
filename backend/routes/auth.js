const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../config/database');
const { mapUser } = require('../utils/mappers');

// POST /auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('TenDangNhap', sql.NVarChar(100), username)
            .query('SELECT * FROM dbo.NGUOI_DUNG WHERE TenDangNhap = @TenDangNhap');
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        
        // So sánh password (nếu đã hash)
        const isValid = await bcrypt.compare(password, user.MatKhau);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Trả về thông tin user (không có password)
        const userData = mapUser(user);
        userData.isAuthenticated = true;
        
        res.json(userData);
    } catch (err) {
        next(err);
    }
});

module.exports = router;