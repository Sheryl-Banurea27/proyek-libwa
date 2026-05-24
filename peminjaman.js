document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Halaman Peminjaman berhasil dimuat!');

  // Ambil elemen-elemen penting
  var btnTambah = document.getElementById('btnTambahPeminjaman');
  var modal = document.getElementById('modalPeminjaman');
  var btnClose = document.getElementById('closeModal');
  var form = document.getElementById('formPeminjaman');

  // 1. Fungsi Buka Modal
  if (btnTambah) {
    btnTambah.onclick = function() {
      console.log('🔔 Tombol Tambah diklik!');
      modal.style.display = 'flex';
    };
  }

  // 2. Fungsi Tutup Modal (tombol X)
  if (btnClose) {
    btnClose.onclick = function() {
      modal.style.display = 'none';
    };
  }

  // 3. Tutup Modal kalau klik di luar kotak
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  // 4. Handle Form Submit
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault(); // Mencegah reload halaman
      
      console.log('📝 Form sedang dikirim...');
      
      // Ambil data dari form
      var data = {
        nim: document.getElementById('nimMhs').value,
        nama: document.getElementById('namaMhs').value,
        prodi: 'Umum',
        no_whatsapp: '628000000000',
        nama_buku: document.getElementById('judulBuku').value,
        tgl_pinjam: document.getElementById('tglPinjam').value
      };

      // Kirim ke server
      fetch('/api/peminjaman/tambah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(result) {
        if (result.success) {
          alert('✅ Berhasil! Data peminjaman tersimpan.');
          modal.style.display = 'none';
          form.reset();
          location.reload(); // Refresh halaman
        } else {
          alert('❌ Gagal: ' + result.message);
        }
      })
      .catch(function(error) {
        console.error('Error:', error);
        alert('⚠️ Server error! Pastikan "node server.js" sudah berjalan.');
      });
    };
  }

  // 5. Load data peminjaman ke tabel
  loadTabelPeminjaman();
});

// Fungsi untuk mengambil dan menampilkan data dari database
function loadTabelPeminjaman() {
  console.log('📊 Memuat data peminjaman...');
  
  fetch('/api/peminjaman')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log('Data diterima:', data);
      var tbody = document.getElementById('peminjamanTableBody');
      
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">Belum ada data peminjaman</td></tr>';
        return;
      }

      var html = '';
      data.forEach(function(item) {
        var statusClass = item.status === 'dipinjam' ? 'dipinjam' : 
                         item.status === 'kembali' ? 'kembali' : 'jatuhtempo';
        
        var aksiBtn = item.status === 'dipinjam' 
          ? '<a href="#" class="link-edit" onclick="updateStatus(\'' + item.nim + '\', \'' + item.nama_buku.replace(/'/g, "\\'") + '\')">Update Status</a>'
          : '<span style="color:#888; font-size:12px;">✅ Selesai</span>';

        html += '<tr>' +
          '<td><strong>' + (item.nama || item.nim) + '</strong><br><small>' + item.nim + '</small></td>' +
          '<td>' + item.nama_buku + '</td>' +
          '<td>' + item.tgl_pinjam + '</td>' +
          '<td>' + item.tgl_kembali + '</td>' +
          '<td><span class="badge ' + statusClass + '">' + item.status + '</span></td>' +
          '<td>' + aksiBtn + '</td>' +
        '</tr>';
      });

      tbody.innerHTML = html;
    })
    .catch(function(error) {
      console.error('Error load data:', error);
      document.getElementById('peminjamanTableBody').innerHTML = 
        '<tr><td colspan="6" style="text-align:center; color:red;">Gagal memuat data. Pastikan server.js berjalan!</td></tr>';
    });
}

// Fungsi Update Status (global agar bisa dipanggil dari HTML)
function updateStatus(nim, namaBuku) {
  if (!confirm('Tandai buku ini sudah dikembalikan?')) {
    return;
  }

  fetch('/api/peminjaman/update-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nim: nim,
      nama_buku: namaBuku
    })
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(result) {
    if (result.success) {
      alert('✅ Status berhasil diubah!');
      loadTabelPeminjaman(); // Reload tabel
    } else {
      alert('❌ Gagal: ' + result.message);
    }
  })
  .catch(function(error) {
    alert('⚠️ Error koneksi server!');
  });
}