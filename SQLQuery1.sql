USE master;
GO

-- 1. Buat Login User
CREATE LOGIN admin_libwa WITH PASSWORD = 'LibwaPassword123!', CHECK_POLICY = OFF;
GO

-- 2. Buat Database
CREATE DATABASE db_libwa_project;
GO

USE db_libwa_project;
GO

-- 3. Buat User di Database
CREATE USER admin_libwa FOR LOGIN admin_libwa;
ALTER ROLE db_owner ADD MEMBER admin_libwa;
GO

-- 4. Buat Tabel Mahasiswa
CREATE TABLE mahasiswa (
    nim VARCHAR(20) PRIMARY KEY,
    nama NVARCHAR(100) NOT NULL,
    prodi NVARCHAR(50),
    no_whatsapp VARCHAR(20)
);

-- 5. Buat Tabel Peminjaman
CREATE TABLE peminjaman (
    id_pinjam INT IDENTITY(1,1) PRIMARY KEY,
    nim VARCHAR(20) FOREIGN KEY REFERENCES mahasiswa(nim) ON DELETE CASCADE,
    nama_buku NVARCHAR(200) NOT NULL,
    tgl_pinjam DATE NOT NULL,
    tgl_kembali DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'dipinjam'
);

-- 6. Buat Tabel Log Bot
CREATE TABLE log_bot (
    id_log INT IDENTITY(1,1) PRIMARY KEY,
    id_pinjam INT FOREIGN KEY REFERENCES peminjaman(id_pinjam),
    tgl_kirim DATETIME DEFAULT GETDATE(),
    pesan_terkirim TEXT
);

PRINT '? Database dan tabel berhasil dibuat!';

USE master;
GO

-- 1. Buat Login (jika belum ada)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'admin_libwa')
BEGIN
    CREATE LOGIN admin_libwa WITH PASSWORD = 'LibwaPassword123!', CHECK_POLICY = OFF;
    PRINT '? Login admin_libwa berhasil dibuat';
END
ELSE
BEGIN
    PRINT '?? Login admin_libwa sudah ada';
END
GO

-- 2. Pastikan user ada di database
USE db_libwa_project;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'admin_libwa')
BEGIN
    CREATE USER admin_libwa FOR LOGIN admin_libwa;
    PRINT '? User admin_libwa berhasil dibuat di database';
END
ELSE
BEGIN
    PRINT '?? User admin_libwa sudah ada di database';
END
GO

-- 3. Berikan akses penuh (db_owner)
ALTER ROLE db_owner ADD MEMBER admin_libwa;
PRINT '? Admin_libwa sekarang memiliki akses penuh ke database';
GO

USE master;
GO

-- 1. Drop login jika sudah ada (untuk reset total)
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'admin_libwa')
BEGIN
    DROP LOGIN admin_libwa;
    PRINT '? Login admin_libwa lama dihapus';
END
GO

-- 2. Buat login baru dengan password yang benar
CREATE LOGIN admin_libwa 
WITH PASSWORD = 'LibwaPassword123!', 
CHECK_POLICY = OFF, 
CHECK_EXPIRATION = OFF;
GO

-- 3. Buat user di database
USE db_libwa_project;
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'admin_libwa')
BEGIN
    DROP USER admin_libwa;
END

CREATE USER admin_libwa FOR LOGIN admin_libwa;
GO

-- 4. Berikan akses penuh
ALTER ROLE db_owner ADD MEMBER admin_libwa;
GO


PRINT '? User admin_libwa berhasil dibuat ulang dengan akses penuh!';
GO