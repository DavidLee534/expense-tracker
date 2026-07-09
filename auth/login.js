'use strict';

const params = new URLSearchParams(location.search);
const next   = params.get('next');

/* 이미 로그인된 상태면 목적지로 바로 이동 */
if (Utils.isLoggedIn()) {
  location.href = next ? decodeURIComponent(next) : '../index.html';
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email    = document.getElementById('f-email').value.trim();
  const password = document.getElementById('f-password').value;
  const errorEl  = document.getElementById('auth-error');

  const result = Utils.login(email, password);
  if (!result.ok) {
    errorEl.textContent = result.error;
    return;
  }

  location.href = next ? decodeURIComponent(next) : '../index.html';
});
