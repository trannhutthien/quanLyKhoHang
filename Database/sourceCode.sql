
=========================== */
IF DB_ID(N'QuanLyKho_JSON') IS NULL
    CREATE DATABASE QuanLyKho_JSON;
GO
USE QuanLyKho_JSON;
GO

CREATE TABLE dbo.NGUOI_DUNG (
    MaNguoiDung  NVARCHAR(50)   NOT NULL PRIMARY KEY,
    TenDangNhap  NVARCHAR(100)  NOT NULL,
    MatKhau      NVARCHAR(255)  NOT NULL,
    HoTen        NVARCHAR(200)  NOT NULL,
    VaiTro       NVARCHAR(50)   NOT NULL, -- 'admin', 'user', 'kho' ...
    CONSTRAINT UQ_NGUOIDUNG_TenDangNhap UNIQUE (TenDangNhap)
);
GO


CREATE TABLE dbo.KHO (
    MaKho          NVARCHAR(50)   NOT NULL PRIMARY KEY,
    TenKho         NVARCHAR(200)  NOT NULL,
    DiaChi         NVARCHAR(300)  NOT NULL,
    NguoiQuanLyId  NVARCHAR(50)   NULL,
    TrangThai      NVARCHAR(20)   NOT NULL CONSTRAINT DF_KHO_TrangThai DEFAULT (N'Hoạt động'),
    DaXoa          BIT            NOT NULL CONSTRAINT DF_KHO_DaXoa DEFAULT (0),
    TaoLuc         DATETIME2(0)   NOT NULL CONSTRAINT DF_KHO_TaoLuc DEFAULT (SYSDATETIME()),
    CapNhatLuc     DATETIME2(0)   NOT NULL CONSTRAINT DF_KHO_CapNhatLuc DEFAULT (SYSDATETIME()),

    CONSTRAINT CK_KHO_TrangThai CHECK (TrangThai IN (N'Hoạt động', N'Tạm dừng', N'Đóng')),
    CONSTRAINT FK_KHO_NGUOIDUNG
        FOREIGN KEY (NguoiQuanLyId) REFERENCES dbo.NGUOI_DUNG(MaNguoiDung)
        ON UPDATE NO ACTION ON DELETE SET NULL
);
GO


CREATE TABLE dbo.HANG_HOA (
    MaHang     NVARCHAR(50)   NOT NULL PRIMARY KEY,      -- 'sp-001'
    TenHang    NVARCHAR(200)  NOT NULL,
    MaSKU      NVARCHAR(100)  NOT NULL,
    DonVi      NVARCHAR(50)   NOT NULL,                  -- 'cái', 'cuộn', 'hộp'
    DanhMuc    NVARCHAR(100)  NULL,
    NgayThem   DATE           NULL CONSTRAINT DF_HH_NgayThem DEFAULT (CONVERT(date, GETDATE())),
    GiaNhap    DECIMAL(18,2)  NULL,    -- Giá nhập tham khảo/lần cuối
    GiaBan     DECIMAL(18,2)  NULL,    -- Giá bán đề nghị

    CONSTRAINT UQ_HANGHOA_MaSKU UNIQUE (MaSKU),
    CONSTRAINT CK_HANGHOA_GiaNhap_NonNegative CHECK (GiaNhap IS NULL OR GiaNhap >= 0),
    CONSTRAINT CK_HANGHOA_GiaBan_NonNegative  CHECK (GiaBan  IS NULL OR GiaBan  >= 0)
);
GO


CREATE TABLE dbo.TON_KHO (
    MaHang     NVARCHAR(50)   NOT NULL, -- FK -> HANG_HOA
    MaKho      NVARCHAR(50)   NOT NULL, -- FK -> KHO
    SoLuongTon INT           NOT NULL CONSTRAINT DF_TONKHO_SoLuong DEFAULT (0),

    -- Khóa chính là cặp (Mã hàng, Mã kho)
    CONSTRAINT PK_TON_KHO PRIMARY KEY (MaHang, MaKho),
    
    CONSTRAINT FK_TONKHO_HANGHOA
        FOREIGN KEY (MaHang) REFERENCES dbo.HANG_HOA(MaHang)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT FK_TONKHO_KHO
        FOREIGN KEY (MaKho) REFERENCES dbo.KHO(MaKho)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT CK_TONKHO_SoLuong_NonNegative CHECK (SoLuongTon >= 0)
);
GO


CREATE TABLE dbo.NHA_CUNG_CAP (
    MaNhaCungCap   NVARCHAR(50)   NOT NULL PRIMARY KEY,
    TenNhaCungCap  NVARCHAR(200)  NOT NULL,
    MaSoThue       NVARCHAR(20)   NULL,
    DiaChi         NVARCHAR(300)  NULL,
    SoDienThoai    NVARCHAR(20)   NULL,
    Email          NVARCHAR(100)  NULL,
    GhiChu         NVARCHAR(500)  NULL
);
GO


CREATE TABLE dbo.PHIEU_NHAP_KHO (
    MaPhieuNhap    NVARCHAR(50)   NOT NULL PRIMARY KEY,
    NgayChungTu    DATE           NOT NULL,
    NgayHachToan   DATE           NULL,
    MaNhaCungCap   NVARCHAR(50)   NULL,
    SoThamChieu    NVARCHAR(100)  NULL,
    GhiChu         NVARCHAR(1000) NULL,
    TongTien       DECIMAL(18,2)  NULL CONSTRAINT DF_PN_TongTien DEFAULT(0),
    NguoiTaoId     NVARCHAR(50)   NULL,
    
    CONSTRAINT FK_PHIEUNHAP_NHACUNGCAP
        FOREIGN KEY (MaNhaCungCap) REFERENCES dbo.NHA_CUNG_CAP(MaNhaCungCap)
        ON UPDATE CASCADE ON DELETE SET NULL,
        
    CONSTRAINT FK_PHIEUNHAP_NGUOIDUNG
        FOREIGN KEY (NguoiTaoId) REFERENCES dbo.NGUOI_DUNG(MaNguoiDung)
        ON UPDATE NO ACTION ON DELETE SET NULL
);
GO


CREATE TABLE dbo.CHI_TIET_NHAP_KHO (
    MaChiTietNhap   BIGINT         NOT NULL PRIMARY KEY IDENTITY(1,1),
    MaPhieuNhap     NVARCHAR(50)   NOT NULL, -- FK -> PHIEU_NHAP_KHO
    MaHang          NVARCHAR(50)   NOT NULL, -- FK -> HANG_HOA
    MaKho           NVARCHAR(50)   NOT NULL, -- FK -> KHO (Kho đích)
    SoLuong         INT           NOT NULL,
    DonGiaNhap       DECIMAL(18,2)  NULL,
    DonGiaXuatDeNghi DECIMAL(18,2)  NULL,
    HanSuDung       DATE           NULL,
    DanhGiaChatLuong NVARCHAR(100)  NULL,
    
    CONSTRAINT FK_CTN_PHIEUNHAP
        FOREIGN KEY (MaPhieuNhap) REFERENCES dbo.PHIEU_NHAP_KHO(MaPhieuNhap)
        ON UPDATE CASCADE ON DELETE CASCADE,
    
    CONSTRAINT FK_CTN_HANGHOA
        FOREIGN KEY (MaHang) REFERENCES dbo.HANG_HOA(MaHang)
        ON UPDATE CASCADE ON DELETE NO ACTION,
        
    CONSTRAINT FK_CTN_KHO
        FOREIGN KEY (MaKho) REFERENCES dbo.KHO(MaKho)
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    
    CONSTRAINT CK_CTN_SoLuong_Positive CHECK (SoLuong > 0)
);
GO


CREATE TABLE dbo.PHIEU_XUAT_KHO (
    MaPhieuXuat NVARCHAR(50)   NOT NULL PRIMARY KEY,
    NgayChungTu          DATE           NOT NULL,
    MaPhieuNhapThamChieu NVARCHAR(50)   NULL,
    GhiChu               NVARCHAR(1000) NULL,
    TongTien             DECIMAL(18,2)  NULL CONSTRAINT DF_PX_TongTien DEFAULT(0),
    NguoiTaoId          NVARCHAR(50)   NULL,
    
    CONSTRAINT FK_PHIEUXUAT_NGUOIDUNG
        FOREIGN KEY (NguoiTaoId) REFERENCES dbo.NGUOI_DUNG(MaNguoiDung)
        ON UPDATE NO ACTION ON DELETE SET NULL
);
GO


CREATE TABLE dbo.CHI_TIET_XUAT_KHO (
    MaChiTietXuat  BIGINT         NOT NULL PRIMARY KEY IDENTITY(1,1),
    MaPhieuXuat    NVARCHAR(50)   NOT NULL, -- FK -> PHIEU_XUAT_KHO
    MaHang         NVARCHAR(50)   NOT NULL, -- FK -> HANG_HOA
    MaKho           NVARCHAR(50)   NOT NULL, -- FK -> KHO (Kho nguồn)
    SoLuong         INT           NOT NULL,
    DonGiaXuat      DECIMAL(18,2)  NULL,
    
    CONSTRAINT FK_CTX_PHIEUXUAT
        FOREIGN KEY (MaPhieuXuat) REFERENCES dbo.PHIEU_XUAT_KHO(MaPhieuXuat)
        ON UPDATE CASCADE ON DELETE CASCADE,
    
    CONSTRAINT FK_CTX_HANGHOA
        FOREIGN KEY (MaHang) REFERENCES dbo.HANG_HOA(MaHang)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    
    CONSTRAINT FK_CTX_KHO
        FOREIGN KEY (MaKho) REFERENCES dbo.KHO(MaKho)
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    
    CONSTRAINT CK_CTX_SoLuong_Positive CHECK (SoLuong > 0)
);
GO