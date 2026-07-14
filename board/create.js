'use strict';

if (!Utils.isLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `../auth/login.html?next=${next}`;
  throw new Error('로그인이 필요합니다.');
}

document.getElementById('user-name').textContent = `${Utils.getCurrentUser().name}님`;
document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.logout();
  location.href = '../auth/login.html';
});

function validate() {
  let ok = true;

  const title = document.getElementById('f-title').value.trim();
  const errTitle = document.getElementById('err-title');
  if (!title) { errTitle.textContent = '제목을 입력하세요.'; document.getElementById('f-title').classList.add('error'); ok = false; }
  else { errTitle.textContent = ''; document.getElementById('f-title').classList.remove('error'); }

  const content = document.getElementById('f-content').value.trim();
  const errContent = document.getElementById('err-content');
  if (!content) { errContent.textContent = '내용을 입력하세요.'; document.getElementById('f-content').classList.add('error'); ok = false; }
  else { errContent.textContent = ''; document.getElementById('f-content').classList.remove('error'); }

  return ok;
}

document.getElementById('create-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  const post = Utils.createPost({
    title:   document.getElementById('f-title').value.trim(),
    content: document.getElementById('f-content').value.trim(),
  });

  toast('등록 완료!');
  setTimeout(() => { location.href = `detail.html?id=${post.id}`; }, 800);
});

function toast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
