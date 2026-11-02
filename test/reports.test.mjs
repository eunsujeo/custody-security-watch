import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReports,renderReport} from '../src/reports.mjs';

const report={start:'2026-10-26',end:'2026-11-01',asOf:'2026-11-02',title:'주간보고',markdown:'검토한 내용'};
test('latest report selection preserves explicit historical periods',()=>{
  const earlier={...report,start:'2026-10-19',end:'2026-10-25'};
  assert.deepEqual(validateReports([earlier,report]).map(r=>r.start),['2026-10-26','2026-10-19']);
  assert.throws(()=>validateReports([report,report]));
  assert.throws(()=>validateReports([{...report,end:'2026-11-02'}]));
  assert.throws(()=>validateReports([{...report,asOf:'2026-10-30'}]));
  assert.throws(()=>validateReports([{...report,markdown:'turn955view0'}]));
});
test('report Markdown escapes HTML and renders source links, lists and tables',()=>{
  const html=renderReport('**사건**\n\n<script>alert(1)</script>\n\n- **공식:** [원문](https://example.com/a?q=1&b=2)\n\n| 구분 | 내용 |\n|---|---|\n| 피해 | `10 USDC` |');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('<strong>공식:</strong>'));
  assert.ok(html.includes('rel="noopener noreferrer"'));
  assert.ok(html.includes('<table>'));
  assert.ok(!renderReport('[위험](javascript:alert(1))').includes('href='));
  assert.throws(()=>renderReport('| A | B |\n|---|---|\n| A |'));
});
