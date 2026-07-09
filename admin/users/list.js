'use strict';

if (!Utils.isAdminLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `../auth/login.html?next=${next}`;
  throw new Error('관리자 로그인이 필요합니다.');
}

function render() {
  const search = document.getElementById('search-input').value;
  const users  = Utils.getUsers({ search });
  const tbody  = document.getElementById('user-tbody');

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty">
        <div class="empty__icon">👥</div>
        <p>조건에 맞는 회원이 없습니다.</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u) => `
    <tr>
      <td><span class="user-name-text"><a href="detail.html?id=${u.id}">${u.name}</a></span></td>
      <td>${u.email}</td>
      <td>${Utils.formatDate(u.createdAt)}</td>
      <td>${u.expenseCount}건</td>
      <td>${Utils.formatCurrency(u.totalAmount)}</td>
      <td><span class="status-badge ${u.status}">${u.status === 'active' ? '활성' : '정지'}</span></td>
      <td>
        <div class="action-btns">
          <a class="btn-edit" href="detail.html?id=${u.id}">상세</a>
          <button class="btn-toggle" onclick="toggleStatus('${u.id}', '${u.status}')">${u.status === 'active' ? '정지' : '해제'}</button>
        </div>
      </td>
    </tr>`).join('');
}

function toggleStatus(id, status) {
  if (status === 'active') {
    if (!confirm('이 회원을 정지할까요? 정지된 계정은 로그인할 수 없어요.')) return;
    Utils.suspendUser(id);
    toast('정지 처리 완료');
  } else {
    Utils.unsuspendUser(id);
    toast('정지 해제 완료');
  }
  render();
}

document.getElementById('search-input').addEventListener('input', render);

/* ── 로그아웃 ── */
document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.adminLogout();
  location.href = '../auth/login.html';
});

/* ── Toast ── */
function toast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

/* ── Init ── */
render();
