require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sql = require('mssql');
const cron = require('node-cron');

const config = {
  user: process.env.DB_USER || 'admin_libwa',
  password: process.env.DB_PASSWORD || 'LibwaPassword123!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'db_libwa_project',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  port: parseInt(process.env.DB_PORT) || 1433
};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('\n📱 SCAN QR CODE INI DENGAN WHATSAPP:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot WhatsApp siap!');
  periksaReminderHmin1();
});

async function periksaReminderHmin1() {
  console.log('🔍 Memeriksa peminjaman H-1 jatuh tempo...');
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT p.id_pinjam, p.nim, p.nama_buku, p.tgl_kembali, m.nama, m.no_whatsapp
      FROM peminjaman p
      JOIN mahasiswa m ON p.nim = m.nim
      WHERE CAST(p.tgl_kembali AS DATE) = CAST(GETDATE() + 1 AS DATE) 
        AND p.status = 'dipinjam'
    `);

    const data = result.recordset;
    if (data.length === 0) {
      console.log('✅ Tidak ada jatuh tempo besok.');
      return;
    }

    console.log(`📦 Ditemukan ${data.length} data. Mengirim WhatsApp...`);
    for (const row of data) {
      const wa = row.no_whatsapp.includes('@c.us') ? row.no_whatsapp : `${row.no_whatsapp}@c.us`;
      const tgl = new Date(row.tgl_kembali).toISOString().split('T')[0];
      const pesan = `Halo *${row.nama}*,\n\nBuku *${row.nama_buku}* yang kamu pinjam akan jatuh tempo pada *${tgl}*. Mohon dikembalikan tepat waktu. Terima kasih 🙏📚`;

      try {
        await client.sendMessage(wa, pesan);
        console.log(`🚀 Terkirim ke ${row.nama} (${row.nim})`);
        
        await pool.request()
          .input('id', sql.Int, row.id_pinjam)
          .input('msg', sql.NVarChar, pesan)
          .query(`INSERT INTO log_bot (id_pinjam, tgl_kirim, pesan_terkirim) VALUES (@id, GETDATE(), @msg)`);
      } catch (err) {
        console.error(`❌ Gagal ke ${row.nama}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('💥 Error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

// Jadwalkan setiap hari jam 08:00
cron.schedule('0 8 * * *', () => {
  console.log('\n⏰ Trigger harian: Memeriksa jatuh tempo...');
  periksaReminderHmin1();
}, { timezone: 'Asia/Jakarta' });

client.initialize();