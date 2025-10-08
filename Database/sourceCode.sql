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


