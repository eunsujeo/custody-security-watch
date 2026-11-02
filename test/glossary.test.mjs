import test from 'node:test';
import assert from 'node:assert/strict';
import {annotateTerms,glossary} from '../src/glossary.mjs';

test('glossary annotates terms in prose and preserves source links and controls',()=>{
  const original='<h1>PoR</h1><p>PoR와 Binance 14, ZachXBT, Security Council. SAFU.</p><a href="https://example.test/PoR">PoR</a><pre>PoR</pre><button>PoR</button>';
  const result=annotateTerms(original);
  for(const term of ['PoR','Binance 14','ZachXBT','Security Council','SAFU']) assert.ok(result.includes(`data-term="${term}"`));
  assert.ok(result.includes('<h1>PoR</h1>'));
  assert.ok(result.includes('<a href="https://example.test/PoR">PoR</a>'));
  assert.ok(result.includes('<pre>PoR</pre>'));
  assert.ok(result.includes('<button>PoR</button>'));
  assert.equal(annotateTerms('<p>SAFUnexpected unsafely</p>'),'<p>SAFUnexpected unsafely</p>');
  assert.equal((annotateTerms('<p>Proof of Reserves</p>').match(/class="term-help"/g)||[]).length,1);
  assert.ok(glossary.every(t=>t.description.length>10));
});
