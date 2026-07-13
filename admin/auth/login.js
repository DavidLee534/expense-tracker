'use strict';

const params = new URLSearchParams(location.search);
const next   = params.get('next');

if (Utils.isAdminLoggedIn()) {
  location.href = next ? decodeURIComponent(next) : '../index.html';
}

document.getElementById('admin-login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const id       = document.getElementById('f-id').value.trim();
  const password = document.getElementById('f-password').value;
  const errorEl  = document.getElementById('auth-error');

  const ok = Utils.adminLogin(id, password);
  if (!ok) {
    errorEl.textContent = 'ID 또는 비밀번호가 올바르지 않아요.';
    return;
  }

  location.href = next ? decodeURIComponent(next) : '../index.html';
});
