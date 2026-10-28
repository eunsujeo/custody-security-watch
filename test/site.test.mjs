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
  assert.equal(htmlCache.size,13);
  assert.equal([...htmlCache.get('index.html').matchAll(/class="case-card"/g)].length, data.incidents.length);
  assert.ok(htmlCache.get('weekly.html').includes('7개 사례'));
});

test('HTML escapes source-derived text and attributes', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">&'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;');
});
