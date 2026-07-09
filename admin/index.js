'use strict';

if (!Utils.isAdminLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `auth/login.html?next=${next}`;
  throw new Error('관리자 로그인이 필요합니다.');
}

document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.adminLogout();
  location.href = 'auth/login.html';
});

const stats = Utils.getAdminStats();

document.getElementById('stat-users').textContent = `${stats.userCount}명`;
document.getElementById('stat-total').textContent = Utils.formatCurrency(stats.totalAmount);
document.getElementById('stat-month').textContent = Utils.formatCurrency(stats.thisMonthAmount);

/* ── 인기 카테고리 TOP5 ── */
const topEl = document.getElementById('top-categories');
if (!stats.topCategories.length) {
  topEl.innerHTML = `<div class="empty"><div class="empty__icon">📊</div><p>아직 지출 데이터가 없습니다.</p></div>`;
} else {
  const max = Math.max(...stats.topCategories.map((c) => c.amount));
  topEl.innerHTML = stats.topCategories.map((c) => `
    <div class="cat-bar-row">
      <span class="cat-bar-label">${c.icon} ${c.name}</span>
      <span class="cat-bar-track"><span class="cat-bar-fill" style="width:${(c.amount / max) * 100}%; background:${c.color}"></span></span>
      <span class="cat-bar-amount">${Utils.formatCurrency(c.amount)}</span>
    </div>`).join('');
}

/* ── 최근 가입 회원 ── */
const signupEl = document.getElementById('signup-list');
if (!stats.recentSignups.length) {
  signupEl.innerHTML = `<div class="empty"><div class="empty__icon">👥</div><p>아직 가입한 회원이 없습니다.</p></div>`;
} else {
  signupEl.innerHTML = stats.recentSignups.map((u) => `
    <li class="signup-item">
      <div>
        <div class="signup-name">${u.name}</div>
        <div class="signup-email">${u.email}</div>
      </div>
      <span class="signup-date">${Utils.formatDate(u.createdAt)}</span>
    </li>`).join('');
}
