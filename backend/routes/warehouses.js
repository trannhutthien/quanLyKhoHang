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

// GET /warehouses/:id - Lấy thông tin 1 kho
router.get('/:id', async (req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('MaKho', sql.NVarChar(50), req.params.id)
            .query('SELECT * FROM dbo.KHO WHERE MaKho = @MaKho AND DaXoa = 0');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }

        const warehouse = mapWarehouse(result.recordset[0]);
        res.json(warehouse);
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

        console.log('🗑️ Deleting warehouse:', req.params.id);

        // Xóa tồn kho của kho này trước
        const deleteInventory = await pool.request()
            .input('MaKho', sql.NVarChar(50), req.params.id)
            .query('DELETE FROM dbo.TON_KHO WHERE MaKho = @MaKho');

        console.log('  Deleted inventory records:', deleteInventory.rowsAffected[0]);

        // Soft delete kho
        const deleteWarehouse = await pool.request()
            .input('MaKho', sql.NVarChar(50), req.params.id)
            .query('UPDATE dbo.KHO SET DaXoa = 1 WHERE MaKho = @MaKho');

        console.log('  Soft deleted warehouse:', deleteWarehouse.rowsAffected[0]);

        res.status(204).send();
    } catch (err) {
        console.error('❌ Error deleting warehouse:', err.message);
        next(err);
    }
});

module.exports = router;