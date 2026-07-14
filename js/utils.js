'use strict';

/* ════════════════════════════════════════
   연간 지출 관리 — 공유 유틸리티 모듈
   모든 페이지가 이 파일 하나를 통해 localStorage 를 읽고 씁니다.
   이 파일은 반드시 <script src="js/data.js"> 다음에 로드되어야 합니다.
════════════════════════════════════════ */
const Utils = (() => {

  /* ── 키 상수 ── */
  const KEYS = {
    USERS:         'expense_users',
    SESSION:       'expense_session',
    ADMIN_SESSION: 'expense_admin_session',
    EXPENSES:      'expense_records',
    POSTS:         'board_posts',
    COMMENTS:      'board_comments',
  };

  /* 관리자는 회원가입이 없으므로 고정 계정으로 로그인한다 (데모용). */
  const ADMIN_CREDENTIALS = { id: 'admin', password: 'admin123' };

  /* ── 내부 헬퍼 ── */
  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) ?? null; }
    catch { return null; }
  }
  function _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ════════════════════
     포맷 유틸
  ════════════════════ */
  function formatCurrency(n) {
    return `${Number(n ?? 0).toLocaleString('ko-KR')}원`;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  }

  /* ════════════════════
     카테고리 (읽기 전용 — CRUD 없음)
  ════════════════════ */
  function getCategories() {
    return DEFAULT_CATEGORIES;
  }

  function getCategory(id) {
    return DEFAULT_CATEGORIES.find((c) => c.id === id) ?? null;
  }

  /* ════════════════════
     고객 — 회원가입 / 로그인 / 세션
  ════════════════════ */
  function _allUsers() { return _get(KEYS.USERS) ?? []; }

  function signup({ name, email, password }) {
    const users = _allUsers();
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: '이미 가입된 이메일이에요.' };
    }
    const user = { id: uid(), name, email, password, status: 'active', createdAt: new Date().toISOString() };
    _set(KEYS.USERS, [...users, user]);
    _set(KEYS.SESSION, { userId: user.id });
    return { ok: true, user };
  }

  function login(email, password) {
    const user = _allUsers().find((u) => u.email === email && u.password === password);
    if (!user) return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않아요.' };
    if (user.status === 'suspended') return { ok: false, error: '정지된 계정이에요. 관리자에게 문의하세요.' };
    _set(KEYS.SESSION, { userId: user.id });
    return { ok: true, user };
  }

  function logout() {
    localStorage.removeItem(KEYS.SESSION);
  }

  function getCurrentUser() {
    const session = _get(KEYS.SESSION);
    if (!session) return null;
    return _allUsers().find((u) => u.id === session.userId) ?? null;
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  /* ════════════════════
     관리자 — 고정 계정 로그인 / 세션
  ════════════════════ */
  function adminLogin(id, password) {
    if (id === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
      _set(KEYS.ADMIN_SESSION, true);
      return true;
    }
    return false;
  }

  function adminLogout() {
    localStorage.removeItem(KEYS.ADMIN_SESSION);
  }

  function isAdminLoggedIn() {
    return _get(KEYS.ADMIN_SESSION) === true;
  }

  /* ════════════════════
     지출 내역 — 로그인한 고객 본인 소유만
  ════════════════════ */
  function _allExpenses() { return _get(KEYS.EXPENSES) ?? []; }

  function _myExpenses() {
    const user = getCurrentUser();
    if (!user) return [];
    return _allExpenses().filter((e) => e.userId === user.id);
  }

  function getExpenses({ from, to, categoryId, search } = {}) {
    const q = search?.trim().toLowerCase();
    return _myExpenses()
      .filter((e) => {
        const matchesFrom     = !from || e.date >= from;
        const matchesTo       = !to || e.date <= to;
        const matchesCategory = !categoryId || categoryId === 'all' || e.categoryId === categoryId;
        const matchesSearch   = !q || (e.memo ?? '').toLowerCase().includes(q);
        return matchesFrom && matchesTo && matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  function getExpense(id) {
    return _myExpenses().find((e) => String(e.id) === String(id)) ?? null;
  }

  function addExpense({ amount, date, categoryId, memo }) {
    const user = getCurrentUser();
    if (!user) return null;
    const expense = {
      id:         uid(),
      userId:     user.id,
      amount:     Number(amount),
      date,
      categoryId,
      memo:       memo ?? '',
      createdAt:  new Date().toISOString(),
    };
    _set(KEYS.EXPENSES, [..._allExpenses(), expense]);
    return expense;
  }

  function updateExpense(id, patch) {
    const user = getCurrentUser();
    if (!user) return;
    const all = _allExpenses().map((e) =>
      String(e.id) === String(id) && e.userId === user.id ? { ...e, ...patch } : e
    );
    _set(KEYS.EXPENSES, all);
  }

  function deleteExpense(id) {
    const user = getCurrentUser();
    if (!user) return;
    _set(KEYS.EXPENSES, _allExpenses().filter((e) => !(String(e.id) === String(id) && e.userId === user.id)));
  }

  /* ════════════════════
     고객 — 개인 통계
  ════════════════════ */
  function getMonthlyStats(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const items  = _myExpenses().filter((e) => e.date.startsWith(prefix));
    const total  = items.reduce((s, e) => s + e.amount, 0);

    const byCategory = getCategories().map((c) => {
      const amount = items.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0);
      return { categoryId: c.id, name: c.name, icon: c.icon, color: c.color, amount, percent: total ? amount / total : 0 };
    }).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

    return { total, byCategory };
  }

  function getYearlyStats(year) {
    const items = _myExpenses().filter((e) => e.date.startsWith(String(year)));
    const total = items.reduce((s, e) => s + e.amount, 0);

    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const month  = i + 1;
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      const amount = items.filter((e) => e.date.startsWith(prefix)).reduce((s, e) => s + e.amount, 0);
      return { month, amount };
    });

    return { total, byMonth };
  }

  function getCategoryTotals({ from, to } = {}) {
    const items = getExpenses({ from, to });
    const total = items.reduce((s, e) => s + e.amount, 0);

    return getCategories().map((c) => {
      const amount = items.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0);
      return { categoryId: c.id, name: c.name, icon: c.icon, color: c.color, amount, percent: total ? amount / total : 0 };
    }).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }

  /* ════════════════════
     관리자 — 회원 관리
  ════════════════════ */
  function _userSummary(u) {
    const expenses = _allExpenses().filter((e) => e.userId === u.id);
    return {
      id:           u.id,
      name:         u.name,
      email:        u.email,
      status:       u.status,
      createdAt:    u.createdAt,
      expenseCount: expenses.length,
      totalAmount:  expenses.reduce((s, e) => s + e.amount, 0),
    };
  }

  function getUsers({ search } = {}) {
    const q = search?.trim().toLowerCase();
    return _allUsers()
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .map(_userSummary)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function getUser(id) {
    const user = _allUsers().find((u) => String(u.id) === String(id));
    if (!user) return null;
    const recentExpenses = _allExpenses()
      .filter((e) => e.userId === user.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
    return { ..._userSummary(user), recentExpenses };
  }

  function suspendUser(id) {
    _set(KEYS.USERS, _allUsers().map((u) => String(u.id) === String(id) ? { ...u, status: 'suspended' } : u));
  }

  function unsuspendUser(id) {
    _set(KEYS.USERS, _allUsers().map((u) => String(u.id) === String(id) ? { ...u, status: 'active' } : u));
  }

  function deleteUser(id) {
    _set(KEYS.USERS, _allUsers().filter((u) => String(u.id) !== String(id)));
    _set(KEYS.EXPENSES, _allExpenses().filter((e) => String(e.userId) !== String(id)));
  }

  /* ════════════════════
     관리자 — 전체 통계
  ════════════════════ */
  function getAdminStats() {
    const users    = _allUsers();
    const expenses = _allExpenses();
    const now      = new Date();
    const prefix   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalAmount     = expenses.reduce((s, e) => s + e.amount, 0);
    const thisMonthAmount = expenses.filter((e) => e.date.startsWith(prefix)).reduce((s, e) => s + e.amount, 0);

    const topCategories = getCategories()
      .map((c) => ({
        categoryId: c.id,
        name:       c.name,
        icon:       c.icon,
        color:      c.color,
        amount:     expenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const recentSignups = users
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));

    return { userCount: users.length, totalAmount, thisMonthAmount, topCategories, recentSignups };
  }

  /* ════════════════════
     게시판 — 절약 팁 공유 (글 / 댓글)
  ════════════════════ */
  function _allPosts() { return _get(KEYS.POSTS) ?? []; }
  function _allComments() { return _get(KEYS.COMMENTS) ?? []; }

  function getPosts({ search } = {}) {
    const q = search?.trim().toLowerCase();
    const comments = _allComments();
    return _allPosts()
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
      .map((p) => ({ ...p, commentCount: comments.filter((c) => c.postId === p.id).length }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function getPost(id) {
    return _allPosts().find((p) => String(p.id) === String(id)) ?? null;
  }

  function createPost({ title, content }) {
    const user = getCurrentUser();
    if (!user) return null;
    const post = {
      id:         uid(),
      userId:     user.id,
      authorName: user.name,
      title,
      content,
      createdAt:  new Date().toISOString(),
    };
    _set(KEYS.POSTS, [..._allPosts(), post]);
    return post;
  }

  function deletePost(id) {
    const user = getCurrentUser();
    if (!user) return;
    const post = getPost(id);
    if (!post || post.userId !== user.id) return;
    _set(KEYS.POSTS, _allPosts().filter((p) => String(p.id) !== String(id)));
    _set(KEYS.COMMENTS, _allComments().filter((c) => String(c.postId) !== String(id)));
  }

  function deletePostAsAdmin(id) {
    _set(KEYS.POSTS, _allPosts().filter((p) => String(p.id) !== String(id)));
    _set(KEYS.COMMENTS, _allComments().filter((c) => String(c.postId) !== String(id)));
  }

  function getComments(postId) {
    return _allComments()
      .filter((c) => String(c.postId) === String(postId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  function addComment(postId, content) {
    const user = getCurrentUser();
    if (!user) return null;
    const comment = {
      id:         uid(),
      postId,
      userId:     user.id,
      authorName: user.name,
      content,
      createdAt:  new Date().toISOString(),
    };
    _set(KEYS.COMMENTS, [..._allComments(), comment]);
    return comment;
  }

  function deleteComment(id) {
    const user = getCurrentUser();
    if (!user) return;
    _set(KEYS.COMMENTS, _allComments().filter((c) =>
      !(String(c.id) === String(id) && c.userId === user.id)
    ));
  }

  function deleteCommentAsAdmin(id) {
    _set(KEYS.COMMENTS, _allComments().filter((c) => String(c.id) !== String(id)));
  }

  /* ── 공개 API ── */
  return {
    uid,
    /* 포맷 */
    formatCurrency, formatDate,
    /* 카테고리 */
    getCategories, getCategory,
    /* 고객 인증 */
    signup, login, logout, getCurrentUser, isLoggedIn,
    /* 관리자 인증 */
    adminLogin, adminLogout, isAdminLoggedIn,
    /* 지출 내역 */
    getExpenses, getExpense, addExpense, updateExpense, deleteExpense,
    /* 개인 통계 */
    getMonthlyStats, getYearlyStats, getCategoryTotals,
    /* 관리자 — 회원 관리 */
    getUsers, getUser, suspendUser, unsuspendUser, deleteUser,
    /* 관리자 — 전체 통계 */
    getAdminStats,
    /* 게시판 */
    getPosts, getPost, createPost, deletePost, deletePostAsAdmin,
    getComments, addComment, deleteComment, deleteCommentAsAdmin,
  };

})();
