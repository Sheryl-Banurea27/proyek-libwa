document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('loginError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Demo: username=admin, password=1234
    if (username.toLowerCase() === 'admin' && password === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('adminName', 'Sheryl Valentina');
      window.location.href = 'index.html';
    } else {
      errorMsg.style.display = 'block';
      setTimeout(() => errorMsg.style.display = 'none', 3000);
    }
  });
});