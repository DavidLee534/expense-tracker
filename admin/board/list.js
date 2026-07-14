'use strict';

if (!Utils.isAdminLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `../auth/login.html?next=${next}`;
  throw new Error('관리자 로그인이 필요합니다.');
}

function render() {
  const search = document.getElementById('search-input').value;
  const posts  = Utils.getPosts({ search });
  const tbody  = document.getElementById('post-tbody');

  if (!posts.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty">
        <div class="empty__icon">💬</div>
        <p>조건에 맞는 게시글이 없습니다.</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = posts.map((p) => `
    <tr>
      <td><span class="post-title-text">${p.title}</span></td>
      <td>${p.authorName}</td>
      <td>${Utils.formatDate(p.createdAt)}</td>
      <td>${p.commentCount}개</td>
      <td>
        <div class="action-btns">
          <button class="btn-del" onclick="removePost('${p.id}')">삭제</button>
        </div>
      </td>
    </tr>`).join('');
}

function removePost(id) {
  if (!confirm('이 게시글을 삭제할까요?\n댓글도 함께 삭제되며 되돌릴 수 없습니다.')) return;
  Utils.deletePostAsAdmin(id);
  toast('삭제 완료');
  render();
}

document.getElementById('search-input').addEventListener('input', render);

document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.adminLogout();
  location.href = '../auth/login.html';
});

function toast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

render();
