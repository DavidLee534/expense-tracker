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

/* ── 카테고리 옵션 ── */
const categoryGroup = document.getElementById('category-group');
categoryGroup.innerHTML = Utils.getCategories().map((c, i) => `
  <label class="category-card">
    <input type="radio" name="category" value="${c.id}" ${i === 0 ? 'checked' : ''}>
    <span>${c.icon} ${c.name}</span>
  </label>`).join('');

/* ── 날짜 기본값: 오늘 ── */
document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);

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
document.getElementById('create-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  const item = {
    amount:     Number(document.getElementById('f-amount').value),
    date:       document.getElementById('f-date').value,
    categoryId: document.querySelector('input[name="category"]:checked').value,
    memo:       document.getElementById('f-memo').value.trim(),
  };

  Utils.addExpense(item);
  toast('지출 추가 완료!');
  setTimeout(() => { location.href = 'list.html'; }, 800);
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
