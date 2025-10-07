const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { mapWarehouse } = require('../utils/mappers');

// GET /warehouses - Lấy tất cả kho (chưa xóa)
router.get('/', async (req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM dbo.KHO WHERE DaXoa = 0 ORDER BY TaoLuc DESC');
        
        const warehouses = result.recordset.map(mapWarehouse);
        res.json(warehouses);
    } catch (err) {
        next(err);
    }
});

// POST /warehouses - Tạo kho mới
router.post('/', async (req, res, next) => {
    try {
        const { id, name, location } = req.body;
        
        if (!id || !name || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pool = await getConnection();
        await pool.request()
            .input('MaKho', sql.NVarChar(50), id)
            .input('TenKho', sql.NVarChar(200), name)
            .input('DiaChi', sql.NVarChar(300), location)
            .query(`
                INSERT INTO dbo.KHO (MaKho, TenKho, DiaChi)
                VALUES (@MaKho, @TenKho, @DiaChi)
            `);
        
        res.status(201).json({ id, name, location });
    } catch (err) {
        next(err);
    }
});

// DELETE /warehouses/:id - Soft delete
router.delete('/:id', async (req, res, next) => {
    try {
        const pool = await getConnection();
        
        // Xóa hàng hóa trước (hoặc dùng ON DELETE CASCADE nếu muốn hard delete)
        await pool.request()
            .input('MaKho', sql.NVarChar(50), req.params.id)
            .query('DELETE FROM dbo.HANG_HOA WHERE MaKho = @MaKho');
        
        // Soft delete kho
        await pool.request()
            .input('MaKho', sql.NVarChar(50), req.params.id)
            .query('UPDATE dbo.KHO SET DaXoa = 1 WHERE MaKho = @MaKho');
        
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;