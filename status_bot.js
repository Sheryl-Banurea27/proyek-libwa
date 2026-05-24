document.addEventListener('DOMContentLoaded', () => {
  const statusText = document.getElementById('botStatusText');
  const btnToggle = document.getElementById('btnToggleBot');
  const templateInput = document.getElementById('inputTemplate');
  const previewPesan = document.getElementById('previewPesan');
  const btnSimpan = document.getElementById('btnSimpanTemplate');
  const waIcon = document.getElementById('waIcon');

  let isConnected = false;

  const updateUI = () => {
    if (isConnected) {
      statusText.textContent = '✅ Bot WhatsApp terhubung & aktif memantau database.';
      statusText.style.color = '#27AE60';
      btnToggle.textContent = 'DISCONNECT BOT';
      btnToggle.classList.add('connected');
      waIcon.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
    } else {
      statusText.textContent = '⏳ Bot belum dijalankan. Buka terminal & ketik: node bot.js';
      statusText.style.color = '#888';
      btnToggle.textContent = 'CONNECT BOT';
      btnToggle.classList.remove('connected');
      waIcon.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };
  updateUI();

  btnToggle.addEventListener('click', () => {
    isConnected = !isConnected;
    updateUI();
  });

  templateInput.addEventListener('input', () => {
    previewPesan.textContent = templateInput.value || 'Preview kosong...';
  });

  btnSimpan.addEventListener('click', () => {
    localStorage.setItem('waTemplate', templateInput.value);
    alert('✅ Template pesan berhasil disimpan ke local storage!');
  });

  const saved = localStorage.getItem('waTemplate');
  if (saved) {
    templateInput.value = saved;
    previewPesan.textContent = saved;
  }
});