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

const postId = new URLSearchParams(location.search).get('id');
const post   = postId ? Utils.getPost(postId) : null;

if (!post) {
  alert('존재하지 않는 게시글이에요.');
  location.href = 'list.html';
  throw new Error('게시글을 찾을 수 없습니다.');
}

const currentUser = Utils.getCurrentUser();

document.getElementById('post-title').textContent   = post.title;
document.getElementById('post-author').textContent  = post.authorName;
document.getElementById('post-date').textContent    = Utils.formatDate(post.createdAt);
document.getElementById('post-content').textContent = post.content;

if (post.userId === currentUser.id) {
  const delBtn = document.getElementById('post-delete-btn');
  delBtn.hidden = false;
  delBtn.addEventListener('click', () => {
    if (!confirm('이 게시글을 삭제할까요?\n댓글도 함께 삭제되며 되돌릴 수 없습니다.')) return;
    Utils.deletePost(postId);
    location.href = 'list.html';
  });
}

function renderComments() {
  const comments = Utils.getComments(postId);
  document.getElementById('comment-count').textContent = comments.length;

  const list = document.getElementById('comment-list');
  if (!comments.length) {
    list.innerHTML = `<li class="empty">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</li>`;
    return;
  }

  list.innerHTML = comments.map((c) => `
    <li class="comment-item">
      <div class="comment-item__head">
        <span class="comment-item__author">${c.authorName}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="comment-item__date">${Utils.formatDate(c.createdAt)}</span>
          ${c.userId === currentUser.id ? `<button class="btn-del" onclick="removeComment('${c.id}')">삭제</button>` : ''}
        </div>
      </div>
      <div class="comment-item__content">${c.content}</div>
    </li>`).join('');
}

function removeComment(id) {
  if (!confirm('이 댓글을 삭제할까요?')) return;
  Utils.deleteComment(id);
  renderComments();
}

document.getElementById('comment-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('comment-input');
  const content = input.value.trim();
  if (!content) return;
  Utils.addComment(postId, content);
  input.value = '';
  renderComments();
});

renderComments();
