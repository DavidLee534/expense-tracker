'use strict';

if (!Utils.isLoggedIn()) {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `../auth/login.html?next=${next}`;
  throw new Error('로그인이 필요합니다.');
}

let currentPeriod = 'all';

/* ── 상단 사용자 정보 ── */
document.getElementById('user-name').textContent = `${Utils.getCurrentUser().name}님`;
document.getElementById('logout-btn').addEventListener('click', () => {
  Utils.logout();
  location.href = '../auth/login.html';
});

/* ── 카테고리 필터 옵션 ── */
const categorySelect = document.getElementById('category-filter');
Utils.getCategories().forEach((c) => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = `${c.icon} ${c.name}`;
  categorySelect.appendChild(opt);
});

/* ── 기간 범위 계산 ── */
function getPeriodRange(period) {
  const now = new Date();
  const y   = now.getFullYear();
  const mm  = String(now.getMonth() + 1).padStart(2, '0');

  if (period === 'month') return { from: `${y}-${mm}-01`, to: `${y}-${mm}-31` };
  if (period === 'year')  return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: undefined, to: undefined };
}

/* ── 렌더링 ── */
function render() {
  const { from, to } = getPeriodRange(currentPeriod);
  const categoryId    = categorySelect.value;
  const search         = document.getElementById('search-input').value;

  const items = Utils.getExpenses({ from, to, categoryId, search });
  const total = items.reduce((s, e) => s + e.amount, 0);

  document.getElementById('summary-total').textContent = Utils.formatCurrency(total);

  const tbody = document.getElementById('expense-tbody');
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty">
        <div class="empty__icon">🧾</div>
        <p>조건에 맞는 지출 내역이 없습니다.</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((e) => {
    const c = Utils.getCategory(e.categoryId);
    return `
    <tr>
      <td>${Utils.formatDate(e.date)}</td>
      <td><span class="category-badge">${c ? `${c.icon} ${c.name}` : '-'}</span></td>
      <td class="expense-memo">${e.memo || '-'}</td>
      <td class="expense-amount">${Utils.formatCurrency(e.amount)}</td>
      <td>
        <div class="action-btns">
          <a class="btn-edit" href="edit.html?id=${e.id}">수정</a>
          <button class="btn-del" onclick="confirmDelete('${e.id}')">삭제</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ── 삭제 ── */
function confirmDelete(id) {
  if (!confirm('이 지출 내역을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
  Utils.deleteExpense(id);
  toast('삭제 완료');
  render();
}

/* ── 필터 이벤트 ── */
document.getElementById('period-btns').addEventListener('click', (e) => {
  const btn = e.target.closest('.period-btn');
  if (!btn) return;
  document.querySelectorAll('.period-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  currentPeriod = btn.dataset.period;
  render();
});
categorySelect.addEventListener('change', render);
document.getElementById('search-input').addEventListener('input', render);

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
