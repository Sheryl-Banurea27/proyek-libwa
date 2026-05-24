document.addEventListener('DOMContentLoaded', () => {
  // Cek login
  if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
  }

  // Dropdown Toggle
  const bellIcon = document.getElementById('bellIcon');
  const userIcon = document.getElementById('userIcon');
  const notifDropdown = document.getElementById('notifDropdown');
  const userDropdown = document.getElementById('userDropdown');

  // Toggle Notifikasi
  if (bellIcon) {
    bellIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
      userDropdown.classList.remove('show');
    });
  }

  // Toggle User Menu
  if (userIcon) {
    userIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
      notifDropdown.classList.remove('show');
    });
  }

  // Close dropdown saat klik di luar
  document.addEventListener('click', () => {
    notifDropdown.classList.remove('show');
    userDropdown.classList.remove('show');
  });

  // Load data statistik & notifikasi
  loadDashboardData();
});

// Fungsi Logout
function logout() {
  if (confirm('Yakin ingin keluar dari sistem?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminName');
    window.location.href = 'login.html';
  }
}

// Load Data Dashboard dari API
async function loadDashboardData() {
  try {
    // 1. Load Statistik
    const statRes = await fetch('/api/statistik');
    const statData = await statRes.json();
    
    document.getElementById('statTotal').textContent = statData.total || 0;
    document.getElementById('statDue').textContent = statData.jatuhTempo || 0;
    document.getElementById('statSent').textContent = statData.botTerkirim || 0;

    // Update badge notifikasi
    const notifBadge = document.getElementById('notifBadge');
    if (notifBadge && statData.jatuhTempo > 0) {
      notifBadge.textContent = statData.jatuhTempo;
      notifBadge.style.display = 'inline-block';
    } else if (notifBadge) {
      notifBadge.style.display = 'none';
    }

    // 2. Load Notifikasi Jatuh Tempo
    await loadNotifikasi();

    // 3. Load Tabel Mahasiswa (4 teratas)
    const mhsRes = await fetch('/api/mahasiswa');
    const mhsData = await mhsRes.json();
    
    const tbody = document.getElementById('dashboardTableBody');
    if (tbody) {
      tbody.innerHTML = mhsData.slice(0, 4).map(m => `
        <tr>
          <td>${m.nim}</td>
          <td>${m.nama}</td>
          <td>${m.no_whatsapp}</td>
          <td>${m.prodi}</td>
        </tr>
      `).join('');
    }

  } catch (err) {
    console.warn('Server belum jalan atau error:', err.message);
    // Fallback data demo
    document.getElementById('statTotal').textContent = '12';
    document.getElementById('statDue').textContent = '1';
    document.getElementById('statSent').textContent = '8';
  }
}

// Load Notifikasi Jatuh Tempo
async function loadNotifikasi() {
  try {
    const res = await fetch('/api/peminjaman');
    const data = await res.json();
    
    const today = new Date();
    const jatuhTempoList = data.filter(d => {
      const tglKembali = new Date(d.tgl_kembali);
      return d.status === 'dipinjam' && tglKembali < today;
    });

    const notifContent = document.getElementById('notifContent');
    
    if (jatuhTempoList.length === 0) {
      notifContent.innerHTML = '<div class="no-notif">✅ Tidak ada buku jatuh tempo</div>';
    } else {
      notifContent.innerHTML = jatuhTempoList.slice(0, 5).map(item => `
        <div class="notif-item" onclick="window.location.href='peminjaman.html'">
          <strong>${item.nama || item.nim}</strong>
          <small>📚 ${item.nama_buku}</small>
          <div style="margin-top: 4px;">
            <span class="badge-danger">Telat ${hitungTelat(item.tgl_kembali)} hari</span>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Gagal load notifikasi:', err);
  }
}

// Hitung berapa hari terlambat
function hitungTelat(tglKembali) {
  const today = new Date();
  const kembali = new Date(tglKembali);
  const diffTime = Math.abs(today - kembali);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}