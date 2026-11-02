import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {escapeHtml, validateData, weekSelection, matchesRecord} from '../src/model.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(`${root}data/incidents.json`, 'utf8'));

test('published data has unique IDs, ranks, source references and dated history', () => {
  assert.doesNotThrow(() => validateData(data));
  const bad = structuredClone(data);
  bad.incidents[0].facts[0].sources = ['missing'];
  assert.throws(() => validateData(bad), /근거 연결/);
  const duplicate = structuredClone(data);
  duplicate.incidents.push(duplicate.incidents[0]);
  assert.throws(() => validateData(duplicate), /중복/);
  const unsafe = structuredClone(data);
  unsafe.incidents[0].sources[0].url = 'javascript:alert(1)';
  assert.throws(() => validateData(unsafe), /HTTPS/);
});

test('weekly boundaries use occurrence dates, fallback only for unknown-start disclosures, and omit advisories', () => {
  const fixtures = [
    {id:'before',kind:'incident',occurredDate:'2026-10-18',disclosedDate:'2026-10-20'},
    {id:'monday',kind:'incident',occurredDate:'2026-10-19',disclosedDate:'2026-10-20'},
    {id:'sunday',kind:'incident',occurredDate:'2026-10-25',disclosedDate:'2026-10-26'},
    {id:'after',kind:'incident',occurredDate:'2026-10-26',disclosedDate:'2026-10-26'},
    {id:'unknown',kind:'incident',occurredDate:null,disclosedDate:'2026-10-21'},
    {id:'advisory',kind:'advisory',occurredDate:null,disclosedDate:'2026-10-21'}
  ];
  assert.deepEqual(weekSelection(fixtures,'2026-10-19','2026-10-25').map(i=>i.id), ['monday','sunday','unknown']);
});

test('search combines keyword, chain, asset and record kind without assuming EVM-only scope', () => {
  const byId = id => data.incidents.find(i=>i.id===id);
  assert.equal(matchesRecord(byId('coindcx-2026-10'),{q:'COINDCX usdt',chain:'TRON',asset:'USDT'}),true);
  assert.equal(matchesRecord(byId('coindcx-2026-10'),{chain:'Ethereum'}),false);
  assert.equal(matchesRecord(byId('wax-bridge-2026-10'),{chain:'Solana',asset:'USDC'}),true);
  assert.equal(matchesRecord(byId('bloom-2026-10'),{asset:'USDC',kind:'advisory'}),false);
  assert.equal(matchesRecord(byId('fireblocks-mpc-lib-2026'),{kind:'advisory'}),true);
  assert.equal(matchesRecord(byId('coindcx-2026-10'),{q:'없는검색어'}),false);
});

test('generated project-site pages have no broken local links, missing fragments or root-relative assets', async () => {
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'pipe'});
  const dist = `${root}dist/`;
  const files = await readdir(dist,{recursive:true});
  const known = new Set(files);
  const htmlCache = new Map();
  for(const name of files.filter(f=>f.endsWith('.html'))) htmlCache.set(name,await readFile(dist+name,'utf8'));
  for(const [name,html] of htmlCache) {
    assert.match(html,/<html lang="ko">/);
    assert.match(html,/name="viewport"/);
    assert.doesNotMatch(html,/(?:href|src)="\/(?!\/)/,`${name}: absolute root asset`);
    for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if(/^https?:/.test(raw)) continue;
      const url = new URL(raw,`https://example.test/custody-security-watch/${name}`);
      assert.ok(url.pathname.startsWith('/custody-security-watch/'),`${name}: escaped project base`);
      const target = decodeURIComponent(url.pathname.slice('/custody-security-watch/'.length));
      assert.ok(known.has(target),`${name} → ${target} missing`);
      if(url.hash && htmlCache.has(target)) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(htmlCache.get(target).includes(`id="${id}"`),`${name} → ${target}${url.hash} missing fragment`);
      }
    }
    assert.doesNotMatch(html,/undefined|\[object Object\]/);
  }
  assert.equal(htmlCache.size,data.incidents.length+4+(await readdir(`${root}data/reports/`)).filter(f=>f.endsWith('.json')).length);
  assert.equal([...htmlCache.get('index.html').matchAll(/class="case-card"/g)].length, data.incidents.length);
  assert.ok(htmlCache.get('weekly-2026-10-19.html').includes('7개 사례'));
  const reportFiles=(await readdir(`${root}data/reports/`)).filter(f=>f.endsWith('.json')).sort();
  const latest=JSON.parse(await readFile(`${root}data/reports/${reportFiles.at(-1)}`,'utf8'));
  assert.ok(htmlCache.get('weekly.html').includes(`${latest.start} 00:00 — ${latest.end} 23:59:59 KST`));
  assert.ok(htmlCache.get('weekly-2026-10-26.html').includes('Binance'));
  assert.ok(htmlCache.get('weekly.html').includes('주간보고 보관함'));
  const topHtml=htmlCache.get('index.html').split('id="case-grid"')[1].split('archive-heading')[0];
  assert.deepEqual([...topHtml.matchAll(/data-id="([^"]+)"/g)].map(m=>m[1]),latest.rankedIncidentIds);
  const thor=htmlCache.get('cases/thorchain-2026-10.html');
  assert.ok(thor.includes('시간순 경과'));
  assert.ok(thor.indexOf('datetime="2026-10-31T20:34:00+09:00"')<thor.indexOf('datetime="2026-11-02T06:51:00+09:00"'));
  assert.ok(thor.includes('10 ETH를 반환'));
  const initia=htmlCache.get('cases/initia-2026-10.html');
  assert.ok(initia.includes('2116087208688099687'));
  assert.ok(initia.includes('11월 2일 재시작 계획 · 완료 미확인'));
  assert.ok(initia.includes('자료 검토: 2026-11-02 KST'));
  assert.ok(htmlCache.get('index.html').includes('개별 검토일은 상세 페이지 참고'));
  assert.ok(data.incidents.find(i=>i.id==='coindcx-2026-10').timeline.length>=4);
  assert.ok(htmlCache.get('cases/coindcx-2026-10.html').includes('자료 검토: 2026-10-28 KST'));
  assert.ok(htmlCache.get('index.html').includes('최신 주간보고'));
  assert.equal(htmlCache.get('weekly.html').includes('turn955view0'),false);
});

test('HTML escapes source-derived text and attributes', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">&'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;');
});

test('Binance timeline retains independently sourced incident response milestones', () => {
  const incident=data.incidents.find(i=>i.id==='binance-2026-10');
  const linked=new Set(incident.timeline.flatMap(event=>event.sources));
  for (const source of ['arb-freeze','initial-update','recovery-90','recovery-95','wallet-rotation','withdrawal-phase-one','laundering-solana']) {
    assert.ok(linked.has(source), `missing response milestone: ${source}`);
  }
  assert.ok(incident.timeline.some(e=>e.label.includes('80%')));
  assert.ok(incident.timeline.some(e=>e.text.includes('고객 입출금 통계')));
  assert.ok(incident.timeline.some(e=>e.label.includes('배후 공개') && e.text.includes('KST 공개 시각은 미확인')));
});
