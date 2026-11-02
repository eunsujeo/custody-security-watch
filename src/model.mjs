export const repo = 'https://github.com/eunsujeo/custody-security-watch';
export const siteUrl = 'https://eunsujeo.github.io/custody-security-watch';
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function validateData(data) {
  const fail = message => { throw new Error(message); };
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) === value;
  if (!date(data.asOf) || !data.rankingBasis?.trim()) fail('검토일과 순위 기준이 필요합니다.');
  const ids = new Set(), ranks = new Set();
  if (!Array.isArray(data.incidents) || !data.incidents.length) fail('기록이 필요합니다.');
  for (const i of data.incidents) {
    if (!/^[a-z0-9-]+$/.test(i.id) || ids.has(i.id)) fail(`잘못되거나 중복된 ID: ${i.id}`);
    ids.add(i.id);
    if (!Number.isInteger(i.rank) || i.rank < 1 || ranks.has(i.rank)) fail(`잘못되거나 중복된 순위: ${i.id}`);
    ranks.add(i.rank);
    if (!['incident','advisory'].includes(i.kind)) fail(`종류 오류: ${i.id}`);
    if ((i.occurredDate !== null && !date(i.occurredDate)) || (i.disclosedDate !== null && !date(i.disclosedDate))) fail(`날짜 오류: ${i.id}`);
    if (i.disclosedDate > data.asOf || (i.occurredDate && i.occurredDate > data.asOf)) fail(`검토일 이후 기록: ${i.id}`);
    for (const key of ['title','subtitle','summary','timing','attack','status','why','cause','response','unknowns']) {
      if (typeof i[key] !== 'string' || !i[key].trim()) fail(`${i.id}: ${key} 누락`);
    }
    for (const key of ['chains','assets','lessons','sources','facts','loss','history']) if (!Array.isArray(i[key])) fail(`${i.id}: ${key} 배열 필요`);
    if (!i.sources.length || !i.facts.length || !i.loss.length || !i.lessons.length || !i.history.length) fail(`${i.id}: 근거·교훈·이력 필요`);
    const sourceIds = new Set();
    for (const s of i.sources) {
      if (sourceIds.has(s.id) || !s.id || !s.title || !s.type) fail(`${i.id}: 출처 오류`);
      sourceIds.add(s.id);
      const url = new URL(s.url);
      if (url.protocol !== 'https:' || url.username || url.password) fail(`${i.id}: HTTPS 출처만 허용`);
    }
    for (const f of [...i.facts, ...i.loss]) {
      if (!f.label || !f.text || !f.sources?.length || f.sources.some(s => !sourceIds.has(s))) fail(`${i.id}: 근거 연결 오류`);
    }
    for (const h of i.history) if (!date(h.date) || h.date > data.asOf || !h.text) fail(`${i.id}: 이력 오류`);
    if (i.reviewedAt && (!date(i.reviewedAt) || i.reviewedAt > data.asOf)) fail(`${i.id}: 검토일 오류`);
    for (const event of i.timeline ?? []) {
      if (!event.at || !Number.isFinite(Date.parse(event.at)) || !event.label || !event.text ||
          !event.sources?.length || event.sources.some(id=>!sourceIds.has(id))) fail(`${i.id}: 시간순 경과 오류`);
    }
  }
  return data;
}

export function chronologicalEvents(events = []) {
  // A date-only source does not establish ordering within that calendar day.
  return [...events].sort((a,b)=>a.at.slice(0,10).localeCompare(b.at.slice(0,10)) ||
    ((a.at.length===10 || b.at.length===10) ? 0 : Date.parse(a.at)-Date.parse(b.at)));
}

export function rankedRecords(incidents, ids) {
  if (!Array.isArray(ids) || ids.length>10 || new Set(ids).size!==ids.length) throw new Error('TOP 10 연결 오류');
  const records=new Map(incidents.map(i=>[i.id,i]));
  return ids.map(id=>{if(!records.has(id)) throw new Error(`TOP 10 사건 누락: ${id}`); return records.get(id);});
}

// Weekly inclusion uses the incident's KST date. Only unknown-start cases fall back to disclosure.
// This selects records in this curated collection; it does not imply exhaustive incident coverage.
export function weekSelection(incidents, start, end) {
  return incidents.filter(i => i.kind === 'incident' && (i.occurredDate ?? i.disclosedDate) && (i.occurredDate ?? i.disclosedDate) >= start && (i.occurredDate ?? i.disclosedDate) <= end);
}

export function matchesRecord(record, {q = '', chain = '', asset = '', attack = '', kind = ''} = {}) {
  const haystack = [record.title, record.subtitle, record.summary, record.attack, ...record.chains, ...record.assets, ...record.lessons].join(' ').normalize('NFKC').toLocaleLowerCase();
  return q.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).every(token => haystack.includes(token)) &&
    (!chain || record.chains.includes(chain)) && (!asset || record.assets.includes(asset)) &&
    (!attack || record.attack === attack) && (!kind || record.kind === kind);
}
