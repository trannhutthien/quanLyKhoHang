const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { mapItem } = require('../utils/mappers');

// GET /items?warehouseId=... - Lấy hàng hóa (filter theo kho nếu có)
router.get('/', async (req, res, next) => {
    try {
        const { warehouseId } = req.query;
        const pool = await getConnection();
        
        let query = `
            SELECT 
                H.MaHang, H.TenHang, H.MaSKU, H.DonVi, H.DanhMuc, 
                H.NgayThem, H.GiaNhap, H.GiaBan,
                T.MaKho, T.SoLuongTon
            FROM dbo.HANG_HOA H
            LEFT JOIN dbo.TON_KHO T ON H.MaHang = T.MaHang
        `;
        const request = pool.request();
        
        if (warehouseId) {
            query += ' WHERE T.MaKho = @MaKho';
            request.input('MaKho', sql.NVarChar(50), warehouseId);
        }
        
        query += ' ORDER BY H.NgayThem DESC';
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
            category, dateAdded, purchasePrice, salePrice
        } = req.body;
        
        if (!id || !warehouseId || !name || !sku || quantity == null || !unit) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pool = await getConnection();
        const transaction = pool.transaction();
        
        try {
            await transaction.begin();
            
            // 1. Insert vào HANG_HOA
            await transaction.request()
                .input('MaHang', sql.NVarChar(50), id)
                .input('TenHang', sql.NVarChar(200), name)
                .input('MaSKU', sql.NVarChar(100), sku)
                .input('DonVi', sql.NVarChar(50), unit)
                .input('DanhMuc', sql.NVarChar(100), category || null)
                .input('NgayThem', sql.Date, dateAdded || null)
                .input('GiaNhap', sql.Decimal(18, 2), purchasePrice || null)
                .input('GiaBan', sql.Decimal(18, 2), salePrice || null)
                .query(`
                    INSERT INTO dbo.HANG_HOA 
                    (MaHang, TenHang, MaSKU, DonVi, DanhMuc, NgayThem, GiaNhap, GiaBan)
                    VALUES 
                    (@MaHang, @TenHang, @MaSKU, @DonVi, @DanhMuc, @NgayThem, @GiaNhap, @GiaBan)
                `);
            
            // 2. Insert vào TON_KHO
            await transaction.request()
                .input('MaHang', sql.NVarChar(50), id)
                .input('MaKho', sql.NVarChar(50), warehouseId)
                .input('SoLuongTon', sql.Int, quantity)
                .query(`
                    INSERT INTO dbo.TON_KHO (MaHang, MaKho, SoLuongTon)
                    VALUES (@MaHang, @MaKho, @SoLuongTon)
                `);
            
            await transaction.commit();
            res.status(201).json({ id, warehouseId, name, sku, quantity, unit });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        next(err);
    }
});

// DELETE /items/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const pool = await getConnection();
        // Xóa HANG_HOA sẽ tự động xóa TON_KHO (CASCADE)
        await pool.request()
            .input('MaHang', sql.NVarChar(50), req.params.id)
            .query('DELETE FROM dbo.HANG_HOA WHERE MaHang = @MaHang');
        
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;