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

const id      = new URLSearchParams(location.search).get('id');
const expense = id ? Utils.getExpense(id) : null;

if (!expense) {
  alert('존재하지 않는 지출 내역이에요.');
  location.href = 'list.html';
  throw new Error('지출 내역을 찾을 수 없습니다.');
}

/* ── 카테고리 옵션 (기존 값 선택) ── */
const categoryGroup = document.getElementById('category-group');
categoryGroup.innerHTML = Utils.getCategories().map((c) => `
  <label class="category-card">
    <input type="radio" name="category" value="${c.id}" ${c.id === expense.categoryId ? 'checked' : ''}>
    <span>${c.icon} ${c.name}</span>
  </label>`).join('');

/* ── 기존 값 프리필 ── */
document.getElementById('f-amount').value = expense.amount;
document.getElementById('f-date').value   = expense.date;
document.getElementById('f-memo').value   = expense.memo;

/* ── 유효성 검사 ── */
function validate() {
  let ok = true;

  const amount = Number(document.getElementById('f-amount').value);
  const errAmount = document.getElementById('err-amount');
  if (!amount || amount <= 0) { errAmount.textContent = '1원 이상의 금액을 입력하세요.'; document.getElementById('f-amount').classList.add('error'); ok = false; }
  else { errAmount.textContent = ''; document.getElementById('f-amount').classList.remove('error'); }

  const date = document.getElementById('f-date').value;
  const errDate = document.getElementById('err-date');
  if (!date) { errDate.textContent = '날짜를 선택하세요.'; document.getElementById('f-date').classList.add('error'); ok = false; }
  else { errDate.textContent = ''; document.getElementById('f-date').classList.remove('error'); }

  return ok;
}

/* ── 폼 제출 ── */
document.getElementById('edit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  Utils.updateExpense(id, {
    amount:     Number(document.getElementById('f-amount').value),
    date:       document.getElementById('f-date').value,
    categoryId: document.querySelector('input[name="category"]:checked').value,
    memo:       document.getElementById('f-memo').value.trim(),
  });

  toast('저장 완료!');
  setTimeout(() => { location.href = 'list.html'; }, 800);
});

/* ── 삭제 ── */
document.getElementById('delete-btn').addEventListener('click', () => {
  if (!confirm('이 지출 내역을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
  Utils.deleteExpense(id);
  location.href = 'list.html';
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
