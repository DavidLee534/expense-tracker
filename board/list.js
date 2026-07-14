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

function render() {
  const search = document.getElementById('search-input').value;
  const posts  = Utils.getPosts({ search });
  const list   = document.getElementById('post-list');

  if (!posts.length) {
    list.innerHTML = `<li class="empty">
      <div class="empty__icon">💬</div>
      <p>아직 등록된 글이 없어요. 첫 절약 팁을 남겨보세요!</p>
    </li>`;
    return;
  }

  list.innerHTML = posts.map((p) => `
    <li>
      <a class="post-card" href="detail.html?id=${p.id}">
        <div class="post-card__title">${p.title}</div>
        <div class="post-card__meta">
          <span>${p.authorName}</span>
          <span>${Utils.formatDate(p.createdAt)}</span>
          <span>댓글 ${p.commentCount}개</span>
        </div>
      </a>
    </li>`).join('');
}

document.getElementById('search-input').addEventListener('input', render);

render();
