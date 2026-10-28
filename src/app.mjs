import {matchesRecord} from './model.mjs';

const filters = document.querySelector('#filters');
const reset = document.querySelector('#reset');
const cards = [...document.querySelectorAll('.case-card')];
try {
  const response = await fetch(new URL('./data/incidents.json', import.meta.url));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const {incidents} = await response.json();
  const records = new Map(incidents.map(i => [i.id, i]));
  if (cards.some(c => !records.has(c.dataset.id))) throw new Error('기록 불일치');
  const inputs = [...filters.querySelectorAll('input,select')];
  const restore = () => {
    const params = new URLSearchParams(location.search);
    for (const input of inputs) input.value = params.get(input.name) ?? '';
    apply(false);
  };
  function apply(updateUrl = true) {
    const state = Object.fromEntries(inputs.map(input => [input.name, input.value]));
    let count = 0;
    for (const card of cards) {
      const match = matchesRecord(records.get(card.dataset.id), state);
      card.hidden = !match;
      if (match) count++;
    }
    const hasFilter = Object.values(state).some(Boolean);
    document.querySelector('#result-count').textContent = `${hasFilter ? '검색 결과' : '전체'} ${count}개 기록`;
    document.querySelector('#empty').hidden = count !== 0;
    reset.hidden = !hasFilter;
    if (updateUrl) {
      const url = new URL(location.href);
      for (const input of inputs) {
        if (input.value) url.searchParams.set(input.name,input.value);
        else url.searchParams.delete(input.name);
      }
      history.replaceState(null, '', url);
    }
  }
  filters.hidden = false;
  filters.addEventListener('input', () => apply());
  reset.addEventListener('click', () => {
    for (const input of inputs) input.value = '';
    apply();
    document.querySelector('#search').focus();
  });
  window.addEventListener('popstate', restore);
  restore();
} catch(error) {
  document.querySelector('#filter-error').hidden = false;
  console.error('검색 초기화 실패:', error);
}
