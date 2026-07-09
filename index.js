'use strict';

if (!Utils.isLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `auth/login.html?next=${next}`;
  throw new Error('로그인이 필요합니다.');
}

const user = Utils.getCurrentUser();
document.getElementById('user-name').textContent = `${user.name}님`;
document.getElementById('welcome-title').textContent = `안녕하세요, ${user.name}님!`;
document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.logout();
  location.href = 'auth/login.html';
});

const now = new Date();
const y   = now.getFullYear();
const m   = now.getMonth() + 1;

const prevDate = new Date(y, m - 2, 1); // 전월 1일
const py = prevDate.getFullYear();
const pm = prevDate.getMonth() + 1;

/* ── 요약 카드 ── */
const thisMonth = Utils.getMonthlyStats(y, m);
const prevMonth = Utils.getMonthlyStats(py, pm);
const monthRange = { from: `${y}-${String(m).padStart(2, '0')}-01`, to: `${y}-${String(m).padStart(2, '0')}-31` };

document.getElementById('stat-total').textContent = Utils.formatCurrency(thisMonth.total);
document.getElementById('stat-count').textContent = `${Utils.getExpenses(monthRange).length}건`;

const diffEl = document.getElementById('stat-diff');
if (prevMonth.total > 0) {
  const diffPercent = Math.round(((thisMonth.total - prevMonth.total) / prevMonth.total) * 100);
  diffEl.textContent = `${diffPercent > 0 ? '+' : ''}${diffPercent}%`;
  diffEl.classList.add(diffPercent > 0 ? 'up' : diffPercent < 0 ? 'down' : '');
} else if (thisMonth.total > 0) {
  diffEl.textContent = '신규';
} else {
  diffEl.textContent = '-';
}

/* ── 카테고리 비중 (미니) ── */
const miniEl = document.getElementById('mini-category');
if (!thisMonth.byCategory.length) {
  miniEl.innerHTML = `<div class="empty"><div class="empty__icon">📊</div><p>이번 달 지출 내역이 없습니다.</p></div>`;
} else {
  miniEl.innerHTML = thisMonth.byCategory.slice(0, 5).map((c) => `
    <div class="mini-row">
      <span class="mini-label">${c.icon} ${c.name}</span>
      <span class="mini-track"><span class="mini-fill" style="width:${(c.percent * 100).toFixed(1)}%; background:${c.color}"></span></span>
      <span class="mini-amount">${Utils.formatCurrency(c.amount)}</span>
    </div>`).join('');
}

/* ── 최근 지출 내역 ── */
const recentEl = document.getElementById('recent-list');
const recent = Utils.getExpenses().slice(0, 5);
if (!recent.length) {
  recentEl.innerHTML = `<div class="empty"><div class="empty__icon">🧾</div><p>아직 등록된 지출이 없습니다.</p></div>`;
} else {
  recentEl.innerHTML = recent.map((e) => {
    const c = Utils.getCategory(e.categoryId);
    return `
    <li class="recent-item">
      <span class="recent-icon">${c ? c.icon : '📦'}</span>
      <div class="recent-info">
        <div class="recent-name">${e.memo || (c ? c.name : '지출')}</div>
        <div class="recent-date">${Utils.formatDate(e.date)}</div>
      </div>
      <span class="recent-amount">${Utils.formatCurrency(e.amount)}</span>
    </li>`;
  }).join('');
}
