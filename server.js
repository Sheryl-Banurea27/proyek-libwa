require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Konfigurasi Database - MySQL (Laragon)
const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',  // Laragon default: KOSONG
  database: 'db_libwa_project',
  port: 3306
};

// API: Get Mahasiswa
app.get('/api/mahasiswa', async (req, res) => {
  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT * FROM mahasiswa ORDER BY nama ASC');
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching mahasiswa:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Get Statistik Dashboard
app.get('/api/statistik', async (req, res) => {
  try {
    const connection = await mysql.createConnection(config);
    
    const [total] = await connection.execute('SELECT COUNT(*) as total FROM peminjaman');
    const [jatuhTempo] = await connection.execute("SELECT COUNT(*) as total FROM peminjaman WHERE tgl_kembali < CURDATE() AND status = 'dipinjam'");
    const [botTerkirim] = await connection.execute('SELECT COUNT(*) as total FROM log_bot');
    
    await connection.end();
    
    res.json({
      total: total[0].total || 0,
      jatuhTempo: jatuhTempo[0].total || 0,
      botTerkirim: botTerkirim[0].total || 0
    });
  } catch (err) {
    console.error('Error fetching statistik:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Get Peminjaman
app.get('/api/peminjaman', async (req, res) => {
  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(`
      SELECT p.*, m.nama 
      FROM peminjaman p 
      LEFT JOIN mahasiswa m ON p.nim = m.nim 
      ORDER BY p.id_pinjam DESC
    `);
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching peminjaman:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Update Status Peminjaman (Kembali)
app.post('/api/peminjaman/update-status', async (req, res) => {
  const { nim, nama_buku } = req.body;
  
  try {
    const connection = await mysql.createConnection(config);
    await connection.execute(
      `UPDATE peminjaman SET status = 'kembali' WHERE nim = ? AND nama_buku = ? AND status = 'dipinjam'`,
      [nim, nama_buku]
    );
    await connection.end();
    res.json({ success: true, message: 'Status berhasil diupdate menjadi kembali' });
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Tambah Peminjaman Baru
app.post('/api/peminjaman/tambah', async (req, res) => {
  const { nim, nama, prodi, no_whatsapp, nama_buku, tgl_pinjam } = req.body;
  
  try {
    const tglPinjam = new Date(tgl_pinjam);
    const tglKembali = new Date(tglPinjam);
    tglKembali.setDate(tglKembali.getDate() + 7);
    
    const connection = await mysql.createConnection(config);
    
    const [cekMhs] = await connection.execute('SELECT COUNT(*) as ada FROM mahasiswa WHERE nim = ?', [nim]);
    
    if (cekMhs[0].ada === 0) {
      await connection.execute(
        'INSERT INTO mahasiswa (nim, nama, prodi, no_whatsapp) VALUES (?, ?, ?, ?)',
        [nim, nama || 'Mahasiswa Baru', prodi || 'Umum', no_whatsapp || '628000000000']
      );
    }
    
    await connection.execute(
      `INSERT INTO peminjaman (nim, nama_buku, tgl_pinjam, tgl_kembali, status) 
       VALUES (?, ?, ?, ?, 'dipinjam')`,
      [nim, nama_buku, tglPinjam.toISOString().split('T')[0], tglKembali.toISOString().split('T')[0]]
    );
    
    await connection.end();
    res.json({ success: true, message: 'Data peminjaman berhasil disimpan' });
  } catch (err) {
    console.error('Error adding peminjaman:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Tambah Mahasiswa Baru
app.post('/api/mahasiswa/tambah', async (req, res) => {
  const { nim, nama, prodi, no_whatsapp } = req.body;
  
  try {
    const connection = await mysql.createConnection(config);
    await connection.execute(
      'INSERT INTO mahasiswa (nim, nama, prodi, no_whatsapp) VALUES (?, ?, ?, ?)',
      [nim, nama, prodi, no_whatsapp]
    );
    await connection.end();
    res.json({ success: true, message: 'Mahasiswa berhasil ditambahkan' });
  } catch (err) {
    console.error('Error adding mahasiswa:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server LibWA sudah aktif di http://localhost:${PORT}`);
  console.log(`📊 Database MySQL: ${config.database}`);
});