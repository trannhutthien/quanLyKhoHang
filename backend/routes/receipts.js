const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET /receipts - Lấy tất cả phiếu nhập/xuất
router.get('/', async (req, res, next) => {
    try {
        const { type } = req.query; // 'import' hoặc 'export'
        const pool = await getConnection();

        let query = `
            SELECT 
                PN.MaPhieuNhap as id,
                'import' as type,
                PN.MaPhieuNhap as receiptNo,
                PN.NgayChungTu as docDate,
                PN.NgayHachToan as postDate,
                PN.MaNhaCungCap as supplierId,
                PN.SoThamChieu as referenceNo,
                PN.GhiChu as note,
                PN.TongTien as total,
                PN.NguoiTaoId as createdBy
            FROM dbo.PHIEU_NHAP_KHO PN
        `;

        if (type === 'import') {
            // Chỉ lấy phiếu nhập
        } else if (type === 'export') {
            // Lấy phiếu xuất
            query = `
                SELECT 
                    PX.MaPhieuXuat as id,
                    'export' as type,
                    PX.MaPhieuXuat as receiptNo,
                    PX.NgayChungTu as docDate,
                    PX.MaPhieuNhapThamChieu as referenceImport,
                    PX.GhiChu as note,
                    PX.TongTien as total,
                    PX.NguoiTaoId as createdBy
                FROM dbo.PHIEU_XUAT_KHO PX
            `;
        } else {
            // Lấy cả 2 loại (UNION) với đầy đủ thông tin
            query = `
                SELECT 
                    PN.MaPhieuNhap as id,
                    'import' as type,
                    PN.MaPhieuNhap as receiptNo,
                    PN.NgayChungTu as docDate,
                    PN.GhiChu as note,
                    PN.TongTien as total,
                    (SELECT COUNT(*) FROM dbo.CHI_TIET_NHAP_KHO WHERE MaPhieuNhap = PN.MaPhieuNhap) as itemsCount,
                    (SELECT TOP 1 MaKho FROM dbo.CHI_TIET_NHAP_KHO WHERE MaPhieuNhap = PN.MaPhieuNhap) as warehouseId
                FROM dbo.PHIEU_NHAP_KHO PN
                UNION ALL
                SELECT 
                    PX.MaPhieuXuat as id,
                    'export' as type,
                    PX.MaPhieuXuat as receiptNo,
                    PX.NgayChungTu as docDate,
                    PX.GhiChu as note,
                    PX.TongTien as total,
                    (SELECT COUNT(*) FROM dbo.CHI_TIET_XUAT_KHO WHERE MaPhieuXuat = PX.MaPhieuXuat) as itemsCount,
                    (SELECT TOP 1 MaKho FROM dbo.CHI_TIET_XUAT_KHO WHERE MaPhieuXuat = PX.MaPhieuXuat) as warehouseId
                FROM dbo.PHIEU_XUAT_KHO PX
                ORDER BY docDate DESC
            `;
        }

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
});

// POST /receipts/import - Tạo phiếu nhập
router.post('/import', async (req, res, next) => {
    try {
        const {
            receiptNo,
            docDate,
            postDate,
            supplierName,
            taxCode,
            supplierAddress,
            referenceNo,
            note,
            items,
            total
        } = req.body;

        if (!receiptNo || !docDate || !items || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pool = await getConnection();
        const transaction = pool.transaction();

        try {
            await transaction.begin();

            // 1. Tạo nhà cung cấp (nếu có)
            let supplierId = null;
            if (supplierName) {
                supplierId = `NCC-${Date.now()}`;
                await transaction.request()
                    .input('MaNhaCungCap', sql.NVarChar(50), supplierId)
                    .input('TenNhaCungCap', sql.NVarChar(200), supplierName)
                    .input('MaSoThue', sql.NVarChar(20), taxCode || null)
                    .input('DiaChi', sql.NVarChar(300), supplierAddress || null)
                    .query(`
                        INSERT INTO dbo.NHA_CUNG_CAP (MaNhaCungCap, TenNhaCungCap, MaSoThue, DiaChi)
                        VALUES (@MaNhaCungCap, @TenNhaCungCap, @MaSoThue, @DiaChi)
                    `);
            }

            // 2. Tạo phiếu nhập
            await transaction.request()
                .input('MaPhieuNhap', sql.NVarChar(50), receiptNo)
                .input('NgayChungTu', sql.Date, docDate)
                .input('NgayHachToan', sql.Date, postDate || null)
                .input('MaNhaCungCap', sql.NVarChar(50), supplierId)
                .input('SoThamChieu', sql.NVarChar(100), referenceNo || null)
                .input('GhiChu', sql.NVarChar(1000), note || null)
                .input('TongTien', sql.Decimal(18, 2), total || 0)
                .query(`
                    INSERT INTO dbo.PHIEU_NHAP_KHO 
                    (MaPhieuNhap, NgayChungTu, NgayHachToan, MaNhaCungCap, SoThamChieu, GhiChu, TongTien)
                    VALUES 
                    (@MaPhieuNhap, @NgayChungTu, @NgayHachToan, @MaNhaCungCap, @SoThamChieu, @GhiChu, @TongTien)
                `);

            // 3. Thêm chi tiết nhập và cập nhật tồn kho
            for (const item of items) {
                const itemId = `HH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Kiểm tra hàng hóa đã tồn tại chưa (theo SKU)
                const existingItem = await transaction.request()
                    .input('MaSKU', sql.NVarChar(100), item.itemCode)
                    .query('SELECT MaHang FROM dbo.HANG_HOA WHERE MaSKU = @MaSKU');

                let finalItemId = itemId;
                if (existingItem.recordset.length > 0) {
                    finalItemId = existingItem.recordset[0].MaHang;
                } else {
                    // Tạo hàng hóa mới
                    await transaction.request()
                        .input('MaHang', sql.NVarChar(50), itemId)
                        .input('TenHang', sql.NVarChar(200), item.itemName)
                        .input('MaSKU', sql.NVarChar(100), item.itemCode)
                        .input('DonVi', sql.NVarChar(50), item.unit)
                        .input('GiaNhap', sql.Decimal(18, 2), item.unitPrice || null)
                        .input('GiaBan', sql.Decimal(18, 2), item.salePrice || null)
                        .query(`
                            INSERT INTO dbo.HANG_HOA (MaHang, TenHang, MaSKU, DonVi, GiaNhap, GiaBan)
                            VALUES (@MaHang, @TenHang, @MaSKU, @DonVi, @GiaNhap, @GiaBan)
                        `);
                }

                // Thêm chi tiết nhập
                await transaction.request()
                    .input('MaPhieuNhap', sql.NVarChar(50), receiptNo)
                    .input('MaHang', sql.NVarChar(50), finalItemId)
                    .input('MaKho', sql.NVarChar(50), item.warehouseId)
                    .input('SoLuong', sql.Int, item.quantity || 1)
                    .input('DonGiaNhap', sql.Decimal(18, 2), item.unitPrice || null)
                    .input('DonGiaXuatDeNghi', sql.Decimal(18, 2), item.salePrice || null)
                    .input('HanSuDung', sql.Date, item.expiry || null)
                    .input('DanhGiaChatLuong', sql.NVarChar(100), item.quality || null)
                    .query(`
                        INSERT INTO dbo.CHI_TIET_NHAP_KHO 
                        (MaPhieuNhap, MaHang, MaKho, SoLuong, DonGiaNhap, DonGiaXuatDeNghi, HanSuDung, DanhGiaChatLuong)
                        VALUES 
                        (@MaPhieuNhap, @MaHang, @MaKho, @SoLuong, @DonGiaNhap, @DonGiaXuatDeNghi, @HanSuDung, @DanhGiaChatLuong)
                    `);

                // Cập nhật tồn kho
                const existingInventory = await transaction.request()
                    .input('MaHang', sql.NVarChar(50), finalItemId)
                    .input('MaKho', sql.NVarChar(50), item.warehouseId)
                    .query('SELECT SoLuongTon FROM dbo.TON_KHO WHERE MaHang = @MaHang AND MaKho = @MaKho');

                if (existingInventory.recordset.length > 0) {
                    // Cập nhật số lượng
                    await transaction.request()
                        .input('MaHang', sql.NVarChar(50), finalItemId)
                        .input('MaKho', sql.NVarChar(50), item.warehouseId)
                        .input('SoLuong', sql.Int, item.quantity || 1)
                        .query('UPDATE dbo.TON_KHO SET SoLuongTon = SoLuongTon + @SoLuong WHERE MaHang = @MaHang AND MaKho = @MaKho');
                } else {
                    // Tạo mới
                    await transaction.request()
                        .input('MaHang', sql.NVarChar(50), finalItemId)
                        .input('MaKho', sql.NVarChar(50), item.warehouseId)
                        .input('SoLuongTon', sql.Int, item.quantity || 1)
                        .query('INSERT INTO dbo.TON_KHO (MaHang, MaKho, SoLuongTon) VALUES (@MaHang, @MaKho, @SoLuongTon)');
                }
            }

            await transaction.commit();
            res.status(201).json({ id: receiptNo, message: 'Phiếu nhập đã được tạo' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        next(err);
    }
});

// POST /receipts/export - Tạo phiếu xuất
router.post('/export', async (req, res, next) => {
    try {
        const { receiptNo, docDate, referenceImport, note, items, total } = req.body;

        if (!receiptNo || !docDate || !items || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pool = await getConnection();
        const transaction = pool.transaction();

        try {
            await transaction.begin();

            // 1. Tạo phiếu xuất
            await transaction.request()
                .input('MaPhieuXuat', sql.NVarChar(50), receiptNo)
                .input('NgayChungTu', sql.Date, docDate)
                .input('MaPhieuNhapThamChieu', sql.NVarChar(50), referenceImport || null)
                .input('GhiChu', sql.NVarChar(1000), note || null)
                .input('TongTien', sql.Decimal(18, 2), total || 0)
                .query(`
                    INSERT INTO dbo.PHIEU_XUAT_KHO 
                    (MaPhieuXuat, NgayChungTu, MaPhieuNhapThamChieu, GhiChu, TongTien)
                    VALUES 
                    (@MaPhieuXuat, @NgayChungTu, @MaPhieuNhapThamChieu, @GhiChu, @TongTien)
                `);

            // 2. Thêm chi tiết xuất và trừ tồn kho
            for (const item of items) {
                // Lấy MaHang từ SKU
                const itemResult = await transaction.request()
                    .input('MaSKU', sql.NVarChar(100), item.itemCode)
                    .query('SELECT MaHang FROM dbo.HANG_HOA WHERE MaSKU = @MaSKU');

                if (itemResult.recordset.length === 0) {
                    throw new Error(`Không tìm thấy hàng hóa với SKU: ${item.itemCode}`);
                }

                const itemId = itemResult.recordset[0].MaHang;

                // Thêm chi tiết xuất
                await transaction.request()
                    .input('MaPhieuXuat', sql.NVarChar(50), receiptNo)
                    .input('MaHang', sql.NVarChar(50), itemId)
                    .input('MaKho', sql.NVarChar(50), item.warehouseId)
                    .input('SoLuong', sql.Int, item.quantity || 1)
                    .input('DonGiaXuat', sql.Decimal(18, 2), item.unitPrice || null)
                    .query(`
                        INSERT INTO dbo.CHI_TIET_XUAT_KHO 
                        (MaPhieuXuat, MaHang, MaKho, SoLuong, DonGiaXuat)
                        VALUES 
                        (@MaPhieuXuat, @MaHang, @MaKho, @SoLuong, @DonGiaXuat)
                    `);

                // Trừ tồn kho
                await transaction.request()
                    .input('MaHang', sql.NVarChar(50), itemId)
                    .input('MaKho', sql.NVarChar(50), item.warehouseId)
                    .input('SoLuong', sql.Int, item.quantity || 1)
                    .query('UPDATE dbo.TON_KHO SET SoLuongTon = SoLuongTon - @SoLuong WHERE MaHang = @MaHang AND MaKho = @MaKho');
            }

            await transaction.commit();
            res.status(201).json({ id: receiptNo, message: 'Phiếu xuất đã được tạo' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
