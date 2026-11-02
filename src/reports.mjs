import {escapeHtml as e} from './model.mjs';

const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export function validateReports(reports) {
  const starts = new Set();
  for (const report of reports) {
    const {start,end,asOf,title,markdown} = report;
    if (![start,end,asOf].every(validDate) || starts.has(start) || end < start || asOf < end ||
        new Date(`${start}T00:00:00Z`).getUTCDay() !== 1 ||
        Date.parse(end)-Date.parse(start) !== 6*86400000 || !title?.trim() || !markdown?.trim()) {
      throw new Error('주간 보고서의 기간·검토일·내용을 확인하세요.');
    }
    if (/genui|turn\d+(?:view|search)/.test(markdown)) throw new Error('공개 보고서는 실제 출처 URL을 사용해야 합니다.');
    starts.add(start);
  }
  return [...reports].sort((a,b)=>b.start.localeCompare(a.start));
}

// Deliberately small Markdown subset for reviewed reports. Raw HTML is always text.
function inline(text) {
  const tokens = /(`[^`]+`|\[[^\]\n]+\]\(https:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g;
  let out='', last=0;
  for (const m of text.matchAll(tokens)) {
    out += e(text.slice(last,m.index));
    const t=m[0];
    if (t.startsWith('`')) out += `<code>${e(t.slice(1,-1))}</code>`;
    else if (t.startsWith('**')) out += `<strong>${e(t.slice(2,-2))}</strong>`;
    else {
      const [,label,url]=t.match(/^\[([^\]]+)\]\((.+)\)$/);
      const parsed=new URL(url);
      out += parsed.protocol==='https:' && !parsed.username && !parsed.password
        ? `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>` : e(t);
    }
    last=m.index+t.length;
  }
  return out+e(text.slice(last));
}

export function renderReport(markdown) {
  const lines=markdown.split(/\r?\n/), out=[];
  for(let n=0;n<lines.length;) {
    const line=lines[n].trim();
    if(!line){n++;continue;}
    if(line.startsWith('|') && /^\|[\s:|\-]+\|$/.test(lines[n+1]?.trim()||'')) {
      const cells=s=>s.trim().slice(1,-1).split('|').map(c=>inline(c.trim()));
      const head=cells(line); n+=2; const rows=[];
      while(lines[n]?.trim().startsWith('|')){rows.push(cells(lines[n]));n++;}
      if(rows.some(r=>r.length!==head.length)) throw new Error('주간 보고서 표의 열 수가 일치하지 않습니다.');
      out.push(`<div class="report-table" tabindex="0" role="region" aria-label="보고서 표"><table><thead><tr>${head.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if(line.startsWith('- ')) {
      const items=[];
      while(lines[n]?.trim().startsWith('- ')){items.push(`<li>${inline(lines[n].trim().slice(2))}</li>`);n++;}
      out.push(`<ul>${items.join('')}</ul>`);
    } else if(/^\*\*[^*]+\*\*$/.test(line)) {out.push(`<h2>${inline(line)}</h2>`);n++;}
    else {
      const p=[];
      while(n<lines.length && lines[n].trim() && !lines[n].trim().startsWith('- ') && !lines[n].trim().startsWith('|') && !(p.length && /^\*\*[^*]+\*\*$/.test(lines[n].trim()))) {p.push(lines[n].trim());n++;}
      if(!p.length){p.push(lines[n]);n++;}
      out.push(`<p>${p.map(inline).join('<br>')}</p>`);
    }
  }
  return out.join('\n');
}
