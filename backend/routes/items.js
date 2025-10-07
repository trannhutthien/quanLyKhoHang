const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { mapItem } = require('../utils/mappers');

// GET /items?warehouseId=... - Lấy hàng hóa (filter theo kho nếu có)
router.get('/', async (req, res, next) => {
    try {
        const { warehouseId } = req.query;
        const pool = await getConnection();
        
        let query = 'SELECT * FROM dbo.HANG_HOA';
        const request = pool.request();
        
        if (warehouseId) {
            query += ' WHERE MaKho = @MaKho';
            request.input('MaKho', sql.NVarChar(50), warehouseId);
        }
        
        query += ' ORDER BY NgayThem DESC';
        const result = await request.query(query);
        
        const items = result.recordset.map(mapItem);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// POST /items - Tạo hàng hóa mới
router.post('/', async (req, res, next) => {
    try {
        const {
            id, warehouseId, name, sku, quantity, unit,
            category, dateAdded, expiry, purchasePrice, salePrice
        } = req.body;
        
        if (!id || !warehouseId || !name || !sku || quantity == null || !unit) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pool = await getConnection();
        await pool.request()
            .input('MaHang', sql.NVarChar(50), id)
            .input('MaKho', sql.NVarChar(50), warehouseId)
            .input('TenHang', sql.NVarChar(200), name)
            .input('MaSKU', sql.NVarChar(100), sku)
            .input('SoLuong', sql.Int, quantity)
            .input('DonVi', sql.NVarChar(50), unit)
            .input('DanhMuc', sql.NVarChar(100), category || null)
            .input('NgayThem', sql.Date, dateAdded || null)
            .input('HanSuDung', sql.Date, expiry || null)
            .input('GiaNhap', sql.Decimal(18, 2), purchasePrice || null)
            .input('GiaBan', sql.Decimal(18, 2), salePrice || null)
            .query(`
                INSERT INTO dbo.HANG_HOA 
                (MaHang, MaKho, TenHang, MaSKU, SoLuong, DonVi, DanhMuc, NgayThem, HanSuDung, GiaNhap, GiaBan)
                VALUES 
                (@MaHang, @MaKho, @TenHang, @MaSKU, @SoLuong, @DonVi, @DanhMuc, @NgayThem, @HanSuDung, @GiaNhap, @GiaBan)
            `);
        
        res.status(201).json({ id, warehouseId, name, sku, quantity, unit });
    } catch (err) {
        next(err);
    }
});

// DELETE /items/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const pool = await getConnection();
        await pool.request()
            .input('MaHang', sql.NVarChar(50), req.params.id)
            .query('DELETE FROM dbo.HANG_HOA WHERE MaHang = @MaHang');
        
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;