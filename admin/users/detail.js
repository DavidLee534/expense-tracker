'use strict';

if (!Utils.isAdminLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `../auth/login.html?next=${next}`;
  throw new Error('관리자 로그인이 필요합니다.');
}

document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.adminLogout();
  location.href = '../auth/login.html';
});

const id = new URLSearchParams(location.search).get('id');

function render() {
  const user = id ? Utils.getUser(id) : null;
  if (!user) {
    alert('존재하지 않는 회원이에요.');
    location.href = 'list.html';
    return;
  }

  document.getElementById('detail-grid').innerHTML = `
    <div class="profile-card">
      <div class="profile-name">${user.name}</div>
      <div class="profile-email">${user.email}</div>

      <div class="profile-row">
        <span class="profile-row__label">가입일</span>
        <span class="profile-row__value">${Utils.formatDate(user.createdAt)}</span>
      </div>
      <div class="profile-row">
        <span class="profile-row__label">상태</span>
        <span class="status-badge ${user.status}">${user.status === 'active' ? '활성' : '정지'}</span>
      </div>
      <div class="profile-row">
        <span class="profile-row__label">총 지출액</span>
        <span class="profile-row__value">${Utils.formatCurrency(user.totalAmount)}</span>
      </div>
      <div class="profile-row">
        <span class="profile-row__label">지출 건수</span>
        <span class="profile-row__value">${user.expenseCount}건</span>
      </div>

      <div class="profile-actions">
        <button class="btn btn-warning" id="toggle-btn">${user.status === 'active' ? '이 회원 정지하기' : '정지 해제하기'}</button>
        <button class="btn btn-danger" id="delete-btn">계정 삭제</button>
      </div>
    </div>

    <div class="recent-card">
      <div class="recent-card__title">최근 지출 내역</div>
      ${user.recentExpenses.length ? user.recentExpenses.map((e) => {
        const c = Utils.getCategory(e.categoryId);
        return `
        <div class="recent-item">
          <span class="recent-icon">${c ? c.icon : '📦'}</span>
          <div class="recent-info">
            <div class="recent-name">${e.memo || (c ? c.name : '지출')}</div>
            <div class="recent-date">${Utils.formatDate(e.date)}</div>
          </div>
          <span class="recent-amount">${Utils.formatCurrency(e.amount)}</span>
        </div>`;
      }).join('') : `<p style="color:var(--color-muted); font-size:var(--text-sm)">등록된 지출 내역이 없습니다.</p>`}
    </div>`;

  document.getElementById('toggle-btn').addEventListener('click', () => {
    if (user.status === 'active') {
      if (!confirm('이 회원을 정지할까요? 정지된 계정은 로그인할 수 없어요.')) return;
      Utils.suspendUser(id);
    } else {
      Utils.unsuspendUser(id);
    }
    render();
  });

  document.getElementById('delete-btn').addEventListener('click', () => {
    if (!confirm(`"${user.name}" 계정을 삭제할까요?\n보유한 지출 내역도 함께 삭제되며, 되돌릴 수 없습니다.`)) return;
    Utils.deleteUser(id);
    location.href = 'list.html';
  });
}

render();
