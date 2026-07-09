'use strict';

const params = new URLSearchParams(location.search);
const next   = params.get('next');

if (Utils.isLoggedIn()) {
  location.href = next ? decodeURIComponent(next) : '../index.html';
}

function validate() {
  let ok = true;

  const name = document.getElementById('f-name').value.trim();
  const errName = document.getElementById('err-name');
  if (!name) { errName.textContent = '이름을 입력하세요.'; ok = false; }
  else { errName.textContent = ''; }

  const email = document.getElementById('f-email').value.trim();
  const errEmail = document.getElementById('err-email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEmail.textContent = '올바른 이메일을 입력하세요.'; ok = false; }
  else { errEmail.textContent = ''; }

  const password = document.getElementById('f-password').value;
  const errPassword = document.getElementById('err-password');
  if (password.length < 6) { errPassword.textContent = '비밀번호는 6자 이상이어야 해요.'; ok = false; }
  else { errPassword.textContent = ''; }

  const password2 = document.getElementById('f-password2').value;
  const errPassword2 = document.getElementById('err-password2');
  if (password !== password2) { errPassword2.textContent = '비밀번호가 일치하지 않아요.'; ok = false; }
  else { errPassword2.textContent = ''; }

  return ok;
}

document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  const name     = document.getElementById('f-name').value.trim();
  const email    = document.getElementById('f-email').value.trim();
  const password = document.getElementById('f-password').value;
  const errorEl  = document.getElementById('auth-error');

  const result = Utils.signup({ name, email, password });
  if (!result.ok) {
    errorEl.textContent = result.error;
    return;
  }

  location.href = next ? decodeURIComponent(next) : '../index.html';
});
