document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('isLoggedIn')) window.location.href = 'login.html';

  const searchInput = document.getElementById('searchMahasiswa');
  const btnTambah = document.getElementById('btnTambahMhs');
  const modal = document.getElementById('modalMhs');
  const closeModal = document.getElementById('closeMhsModal');
  const form = document.getElementById('formMhs');

  // Toggle Modal
  btnTambah.onclick = () => modal.style.display = 'flex';
  closeModal.onclick = () => modal.style.display = 'none';
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  async function renderTable(data = null) {
    try {
      const res = await fetch('/api/mahasiswa');
      const list = data || await res.json();
      const tbody = document.getElementById('mhsTableBody');
      
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada data</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(m => `
        <tr>
          <td>${m.nim}</td>
          <td>${m.nama}</td>
          <td>${m.prodi}</td>
          <td>${m.no_whatsapp}</td>
          <td><a href="#" class="link-edit" data-nim="${m.nim}">Edit</a></td>
        </tr>
      `).join('');
    } catch (err) {
      document.getElementById('mhsTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Gagal load data. Pastikan server.js berjalan.</td></tr>';
    }
  }

  // Search Realtime
  searchInput.addEventListener('input', async () => {
    const keyword = searchInput.value.toLowerCase();
    try {
      const res = await fetch('/api/mahasiswa');
      const all = await res.json();
      const filtered = all.filter(m => m.nim.includes(keyword) || m.nama.toLowerCase().includes(keyword));
      renderTable(filtered);
    } catch (err) { renderTable([]); }
  });

  // Submit Form Tambah
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nim: document.getElementById('nimMhs').value,
      nama: document.getElementById('namaMhs').value,
      prodi: document.getElementById('prodiMhs').value,
      no_whatsapp: document.getElementById('waMhs').value,
      nama_buku: 'Demo', tgl_pinjam: new Date().toISOString().split('T')[0]
    };
    try {
      const res = await fetch('/api/peminjaman/tambah', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const result = await res.json();
      if (result.success) { alert(result.message); modal.style.display = 'none'; form.reset(); renderTable(); }
      else alert('Gagal: ' + result.message);
    } catch (err) { alert('Server error. Pastikan node server.js aktif.'); }
  });

  renderTable();
});