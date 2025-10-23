
function mapWarehouse(row) {
    return {
        id: row.MaKho,
        name: row.TenKho,
        location: row.DiaChi,
        // Các trường mở rộng (không có trong JSON cũ)
        capacity: row.SucChuaToiDa,
        status: row.TrangThai,
        managerId: row.NguoiQuanLyId
    };
}


function mapItem(row) {
    return {
        id: row.MaHang,
        warehouseId: row.MaKho || null,  // Từ TON_KHO (nếu có)
        name: row.TenHang,
        sku: row.MaSKU,
        quantity: row.SoLuongTon || 0,   // Từ TON_KHO
        unit: row.DonVi,
        category: row.DanhMuc,
        dateAdded: row.NgayThem ? row.NgayThem.toISOString().split('T')[0] : null,
        purchasePrice: row.GiaNhap,
        salePrice: row.GiaBan
    };
}


function mapUser(row) {
    return {
        id: row.MaNguoiDung,
        username: row.TenDangNhap,
        name: row.HoTen,
        role: row.VaiTro
    };
}

module.exports = { mapWarehouse, mapItem, mapUser };