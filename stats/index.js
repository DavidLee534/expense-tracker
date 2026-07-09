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

let chartView = 'donut';

/* ── 월/연 선택기 초기값 ── */
const now = new Date();
const monthInput = document.getElementById('month-input');
monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const yearSelect = document.getElementById('year-select');
const thisYear   = now.getFullYear();
for (let y = thisYear; y >= thisYear - 4; y--) {
  const opt = document.createElement('option');
  opt.value = y;
  opt.textContent = `${y}년`;
  yearSelect.appendChild(opt);
}

/* ── 카테고리별 비중 ── */
function renderCategoryPanel() {
  const [year, month] = monthInput.value.split('-').map(Number);
  const { total, byCategory } = Utils.getMonthlyStats(year, month);

  const wrap = document.getElementById('donut-wrap');
  const rankList = document.getElementById('rank-list');

  if (!byCategory.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty__icon">📊</div><p>해당 월의 지출 내역이 없습니다.</p></div>`;
    rankList.innerHTML = '';
    return;
  }

  if (chartView === 'donut') {
    let cursor = 0;
    const stops = byCategory.map((c) => {
      const start = cursor;
      cursor += c.percent * 100;
      return `${c.color} ${start}% ${cursor}%`;
    }).join(', ');

    wrap.innerHTML = `
      <div class="donut" style="background: conic-gradient(${stops})">
        <div class="donut__center">
          <span class="donut__center-label">합계</span>
          <span class="donut__center-value">${Utils.formatCurrency(total)}</span>
        </div>
      </div>`;
  } else {
    wrap.innerHTML = `<div class="bar-chart">${byCategory.map((c) => `
      <div class="cat-bar-row">
        <span class="cat-bar-label">${c.icon} ${c.name}</span>
        <span class="cat-bar-track"><span class="cat-bar-fill" style="width:${(c.percent * 100).toFixed(1)}%; background:${c.color}"></span></span>
        <span class="cat-bar-amount">${Utils.formatCurrency(c.amount)}</span>
      </div>`).join('')}</div>`;
  }

  rankList.innerHTML = byCategory.map((c) => `
    <li class="rank-item">
      <span class="rank-dot" style="background:${c.color}"></span>
      <span class="rank-name">${c.icon} ${c.name}</span>
      <span class="rank-percent">${Math.round(c.percent * 100)}%</span>
      <span class="rank-amount">${Utils.formatCurrency(c.amount)}</span>
    </li>`).join('');
}

/* ── 월별 지출 추이 ── */
function renderTrendPanel() {
  const year = Number(yearSelect.value);
  const { byMonth } = Utils.getYearlyStats(year);
  const max = Math.max(...byMonth.map((m) => m.amount), 1);

  document.getElementById('trend-chart').innerHTML = byMonth.map((m) => `
    <div class="trend-col" title="${m.month}월 ${Utils.formatCurrency(m.amount)}">
      <div class="trend-bar-track">
        <div class="trend-bar" style="height:${(m.amount / max) * 100}%"></div>
      </div>
      <span class="trend-label">${m.month}월</span>
    </div>`).join('');
}

/* ── 이벤트 ── */
monthInput.addEventListener('change', renderCategoryPanel);
yearSelect.addEventListener('change', renderTrendPanel);
document.getElementById('chart-toggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.chart-toggle__btn');
  if (!btn) return;
  document.querySelectorAll('.chart-toggle__btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  chartView = btn.dataset.view;
  renderCategoryPanel();
});

/* ── Init ── */
renderCategoryPanel();
renderTrendPanel();
