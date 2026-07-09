// 기본 카테고리 데이터 — 고정값이며 CRUD로 편집하지 않는다.
// 모든 고객이 지출 등록 시 이 목록에서 카테고리를 선택한다.

const DEFAULT_CATEGORIES = [
  { id: 'food',      name: '식비',      icon: '🍚', color: '#2DD4BF' },
  { id: 'transport',  name: '교통',      icon: '🚌', color: '#60A5FA' },
  { id: 'housing',    name: '주거',      icon: '🏠', color: '#A78BFA' },
  { id: 'leisure',    name: '문화/여가', icon: '🎬', color: '#F472B6' },
  { id: 'shopping',   name: '쇼핑',      icon: '🛍️', color: '#FBBF24' },
  { id: 'health',     name: '의료',      icon: '💊', color: '#F87171' },
  { id: 'education',  name: '교육',      icon: '📚', color: '#34D399' },
  { id: 'etc',        name: '기타',      icon: '📦', color: '#94A3B8' },
];
