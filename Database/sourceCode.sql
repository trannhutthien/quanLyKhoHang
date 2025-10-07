/* ===========================
   1) TẠO DATABASE & SỬ DỤNG
=========================== */
IF DB_ID(N'QuanLyKho_JSON') IS NULL
    CREATE DATABASE QuanLyKho_JSON;
GO
USE QuanLyKho_JSON;
GO

/* ===========================
   2) DỌN BẢNG CŨ (NẾU CÓ)
=========================== */
IF OBJECT_ID(N'dbo.HANG_HOA', N'U') IS NOT NULL DROP TABLE dbo.HANG_HOA;
IF OBJECT_ID(N'dbo.KHO', N'U') IS NOT NULL DROP TABLE dbo.KHO;
IF OBJECT_ID(N'dbo.NGUOI_DUNG', N'U') IS NOT NULL DROP TABLE dbo.NGUOI_DUNG;
GO

/* ===========================
   3) BẢNG NGƯỜI DÙNG
=========================== */
CREATE TABLE dbo.NGUOI_DUNG (
    MaNguoiDung  NVARCHAR(50)   NOT NULL PRIMARY KEY,   -- ví dụ: 'u-1'
    TenDangNhap  NVARCHAR(100)  NOT NULL,               -- ví dụ: 'admin' (UNIQUE)
    MatKhau      NVARCHAR(255)  NOT NULL,               -- thực tế nên lưu hash
    HoTen        NVARCHAR(200)  NOT NULL,               -- ví dụ: 'Quản trị viên'
    VaiTro       NVARCHAR(50)   NOT NULL,               -- 'admin', 'user', ...
    CONSTRAINT UQ_NGUOIDUNG_TenDangNhap UNIQUE (TenDangNhap)
);
GO

/* ===========================
   4) BẢNG KHO
   - Có Người quản lý (FK tới NGUOI_DUNG)
   - Có Sức chứa, Trạng thái, Soft delete, Audit time
=========================== */
CREATE TABLE dbo.KHO (
    MaKho          NVARCHAR(50)   NOT NULL PRIMARY KEY,                   -- 'kho-a'
    TenKho         NVARCHAR(200)  NOT NULL,                               -- 'Kho A'
    DiaChi         NVARCHAR(300)  NOT NULL,                               -- 'Hà Nội'
    SucChuaToiDa   DECIMAL(18,2)  NULL,                                   -- sức chứa (đơn vị tùy bạn)
    TrangThai      NVARCHAR(20)   NOT NULL CONSTRAINT DF_KHO_TrangThai DEFAULT (N'Hoạt động'),
    NguoiQuanLyId  NVARCHAR(50)   NULL,                                   -- FK -> NGUOI_DUNG.MaNguoiDung

    DaXoa          BIT            NOT NULL CONSTRAINT DF_KHO_DaXoa DEFAULT (0),
    TaoLuc         DATETIME2(0)   NOT NULL CONSTRAINT DF_KHO_TaoLuc DEFAULT (SYSDATETIME()),
    CapNhatLuc     DATETIME2(0)   NOT NULL CONSTRAINT DF_KHO_CapNhatLuc DEFAULT (SYSDATETIME()),

    CONSTRAINT CK_KHO_SucChua_KhongAm CHECK (SucChuaToiDa IS NULL OR SucChuaToiDa >= 0),
    CONSTRAINT CK_KHO_TrangThai CHECK (TrangThai IN (N'Hoạt động', N'Tạm dừng', N'Đóng'))
);
GO

-- Khóa ngoại Người quản lý
ALTER TABLE dbo.KHO
ADD CONSTRAINT FK_KHO_NGUOIDUNG
    FOREIGN KEY (NguoiQuanLyId)
    REFERENCES dbo.NGUOI_DUNG(MaNguoiDung)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;   -- xóa user → gỡ liên kết, kho vẫn tồn tại
GO

-- Trigger tự động cập nhật CapNhatLuc khi UPDATE
CREATE OR ALTER TRIGGER dbo.tr_KHO_SetCapNhatLuc
ON dbo.KHO
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE K
      SET CapNhatLuc = SYSDATETIME()
    FROM dbo.KHO K
    INNER JOIN inserted i ON K.MaKho = i.MaKho;
END
GO

-- Chỉ mục: Tên kho duy nhất cho các bản ghi chưa xóa (soft-delete friendly)
CREATE UNIQUE INDEX UX_KHO_TenKho_Active
ON dbo.KHO (TenKho)
WHERE DaXoa = 0;

-- Chỉ mục phổ biến
CREATE INDEX IX_KHO_TrangThai ON dbo.KHO (TrangThai) WHERE DaXoa = 0;
CREATE INDEX IX_KHO_DaXoa     ON dbo.KHO (DaXoa);
GO

/* ===========================
   5) BẢNG HÀNG HÓA
   - Bám JSON: SKU, số lượng, đơn vị, danh mục
   - Ngày thêm, hạn sử dụng, giá nhập/bán
=========================== */
CREATE TABLE dbo.HANG_HOA (
    MaHang     NVARCHAR(50)   NOT NULL PRIMARY KEY,      -- 'sp-001'
    MaKho      NVARCHAR(50)   NOT NULL,                  -- FK → KHO.MaKho
    TenHang    NVARCHAR(200)  NOT NULL,
    MaSKU      NVARCHAR(100)  NOT NULL,                  -- UNIQUE
    SoLuong    INT            NOT NULL CONSTRAINT DF_HH_SoLuong DEFAULT(0),
    DonVi      NVARCHAR(50)   NOT NULL,                  -- 'cái', 'cuộn', 'hộp', ...
    DanhMuc    NVARCHAR(100)  NULL,                      -- 'Bao bì', 'An toàn', ...
    NgayThem   DATE           NULL CONSTRAINT DF_HH_NgayThem DEFAULT (CONVERT(date, GETDATE())),
    HanSuDung  DATE           NULL,
    GiaNhap    DECIMAL(18,2)  NULL,
    GiaBan     DECIMAL(18,2)  NULL,

    CONSTRAINT FK_HANGHOA_KHO
        FOREIGN KEY (MaKho) REFERENCES dbo.KHO(MaKho)
        ON UPDATE CASCADE ON DELETE NO ACTION,

    CONSTRAINT UQ_HANGHOA_MaSKU UNIQUE (MaSKU),
    CONSTRAINT CK_HANGHOA_SoLuong_NonNegative CHECK (SoLuong >= 0),
    CONSTRAINT CK_HANGHOA_GiaNhap_NonNegative CHECK (GiaNhap IS NULL OR GiaNhap >= 0),
    CONSTRAINT CK_HANGHOA_GiaBan_NonNegative  CHECK (GiaBan  IS NULL OR GiaBan  >= 0),
    CONSTRAINT CK_HANGHOA_Ngay_Logic CHECK (HanSuDung IS NULL OR NgayThem IS NULL OR HanSuDung >= NgayThem)
);
GO

-- (Tùy chọn) Trigger update nhanh ngày thêm/cập nhật — nếu bạn muốn
-- (Giữ gọn: không tạo trigger cho HANG_HOA để tránh nặng hệ thống)

/* ===========================
   6) DỮ LIỆU MẪU (KHỚP JSON)
=========================== */
-- Người dùng
INSERT INTO dbo.NGUOI_DUNG (MaNguoiDung, TenDangNhap, MatKhau, HoTen, VaiTro) VALUES
(N'u-1', N'admin', N'123456', N'Quản trị viên', N'admin');

-- Kho (gán quản lý thử cho kho-a)
INSERT INTO dbo.KHO (MaKho, TenKho, DiaChi, SucChuaToiDa, TrangThai, NguoiQuanLyId)
VALUES
(N'kho-a', N'Kho A', N'Hà Nội',             NULL,         N'Hoạt động', N'u-1'),
(N'kho-d', N'kho d', N'bến tre',            NULL,         N'Hoạt động', NULL),
(N'kho-i', N'kho i', N'duyên hải trà vinh', NULL,         N'Hoạt động', NULL);

-- Hàng hóa
INSERT INTO dbo.HANG_HOA (MaHang, MaKho, TenHang, MaSKU, SoLuong, DonVi, DanhMuc, NgayThem, HanSuDung, GiaNhap, GiaBan) VALUES
(N'sp-001',    N'kho-a', N'Thùng carton 60x40x40', N'BOX-604040', 120, N'cái',  N'Bao bì',            NULL,                         NULL,                    NULL,   NULL),
(N'sp-002',    N'kho-a', N'Băng keo 48mm',          N'TAPE-48',    340, N'cuộn', N'Bao bì',            NULL,                         NULL,                    NULL,   NULL),
(N'sp-003',    N'kho-a', N'Nón bảo hộ',             N'SAF-HELM',    58, N'cái',  N'An toàn',           NULL,                         NULL,                    NULL,   NULL),
(N'sp-md01',   N'kho-a', N'muc dau',                N'md01',         5, N'chay', NULL,                 NULL,                         NULL,                    NULL,   NULL),
(N'sp-md-120', N'kho-a', N'Mức đào',                N'md-120',      20, N'hộp',  N'nguyên liệu phụ',   CONVERT(date,'2025-10-02'),  CONVERT(date,'2026-10-02'), 50000, 70000);
GO

/* ===========================
   7) GỢI Ý TRUY VẤN KIỂM TRA
=========================== */
-- Xem danh sách kho + người quản lý
SELECT K.MaKho, K.TenKho, K.TrangThai, ND.HoTen AS NguoiQuanLy
FROM dbo.KHO K
LEFT JOIN dbo.NGUOI_DUNG ND ON ND.MaNguoiDung = K.NguoiQuanLyId;

-- Xem tồn kho theo kho
SELECT MaKho, COUNT(*) AS SoMatHang, SUM(SoLuong) AS TongSoLuong
FROM dbo.HANG_HOA
GROUP BY MaKho;
