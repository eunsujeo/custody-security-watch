import {escapeHtml as e} from './model.mjs';

// Short explanations for readers, shared by every generated page.
export const glossary = [
  {term:'PoR',aliases:['Proof of Reserves'],description:'준비금 증명. 고객에게 돌려줄 자산과 거래소가 보유한 자산을 대조·검증하는 자료입니다. 특정 시점과 범위의 자료이므로 전체 지급 능력을 보증하는 것은 아닙니다.'},
  {term:'Binance 14',description:'분석에서 바이낸스의 특정 Ethereum 핫월렛 주소에 붙인 식별 이름입니다. 고객 출금 등을 처리하는 온라인 지갑을 가리킵니다.'},
  {term:'ZachXBT',description:'블록체인 거래를 추적해 해킹·사기 자금의 흐름을 조사하는 독립 조사자입니다. 이 사건에서는 Arbitrum의 자산 동결 조치를 알렸습니다.'},
  {term:'Security Council',description:'이 사건에서는 Arbitrum의 보안위원회를 뜻합니다. 긴급 보안 조치 등을 결정·실행하며, 정해진 수 이상의 구성원 승인이 필요합니다.'},
  {term:'SAFU',description:'바이낸스가 해킹 같은 긴급 상황에서 이용자 자산을 보호하기 위해 마련한 비상 기금입니다.'},
  {term:'ZKP',aliases:['영지식 증명'],description:'영지식 증명. 세부 정보를 모두 공개하지 않고도 어떤 계산이나 조건이 맞다는 것을 검증하는 암호 기술입니다.'},
  {term:'EIP-7702',description:'Ethereum 지갑 주소가 지정한 스마트컨트랙트의 기능을 사용하도록 위임할 수 있게 하는 규격입니다. 잘못된 위임 서명은 자산을 움직일 권한을 넘길 수 있습니다.'},
  {term:'nonce',description:'거래나 서명을 구분하는 순번입니다. Ethereum 지갑에서는 이미 쓴 거래를 다시 실행하지 못하게 하고 거래 순서를 정하는 데 쓰입니다.'},
  {term:'MPC',description:'여러 참여자가 비밀 정보를 나눠 가진 채 함께 계산하는 기술입니다. 지갑에서는 개인키를 한곳에 모으지 않고 공동 서명하는 데 활용합니다.'},
  {term:'HSM',description:'암호키를 보호하고 서명 같은 암호 연산을 수행하는 전용 보안 장치입니다. 출금 요청 자체의 정당성은 별도 정책으로 확인해야 합니다.'},
  {term:'Blockaid',description:'블록체인 거래와 앱의 위협을 탐지·분석하는 보안 업체입니다. 본문의 공격 경로 설명은 이 업체의 분석임을 표시한 것입니다.'},
  {term:'Chainalysis',description:'블록체인 거래와 주소 사이의 자금 흐름을 추적·분석하는 업체입니다.'},
  {term:'MEV',description:'블록에 거래를 넣는 순서나 포함 여부를 이용해 얻는 수익을 뜻합니다. 이 사건의 MEV 봇은 수익성 있는 거래를 발견해 먼저 실행한 자동 프로그램입니다.'},
  {term:'Safe',description:'여러 서명자의 승인을 모아 자산을 관리할 수 있는 스마트컨트랙트 지갑입니다. 예를 들어 2-of-7은 등록된 7명 중 2명의 승인이 필요하다는 뜻입니다.'},
  {term:'approve',description:'토큰 보유자가 다른 주소에 토큰을 가져갈 권한을 부여하는 기능입니다. 이후 권한 범위의 인출에는 새로운 소유자 서명이 필요하지 않을 수 있습니다.'},
  {term:'allowance',description:'어떤 주소가 내 토큰을 얼마나 가져갈 수 있는지 정한 승인 한도입니다. 기존 한도가 남아 있으면 과거의 승인이 계속 작동할 수 있습니다.'},
  {term:'transferFrom',description:'기존에 부여받은 토큰 승인 한도를 사용해 다른 주소의 토큰을 옮기는 기능입니다.'},
  {term:'리오그',aliases:['reorg'],description:'체인 재구성. 이미 관측한 블록이 다른 블록으로 교체돼 그 안의 입금이 사라지거나 다른 위치에 다시 포함될 수 있는 현상입니다.'},
  {term:'스윕',aliases:['sweep'],description:'여러 입금 주소에 모인 자산을 운영 지갑이나 보관 지갑으로 옮겨 모으는 작업입니다.'},
  {term:'핫월렛',description:'온라인 시스템에서 거래 서명을 처리하는 지갑입니다. 빠른 입출금에 쓰이지만 시스템 침해 시 자산 접근 경로가 될 수 있습니다.'},
  {term:'브리지',description:'서로 다른 블록체인 사이에서 자산이나 메시지를 이동시키는 연결 장치입니다. 다른 체인의 표현 토큰은 원래 자산을 돌려받는 경로도 확인해야 합니다.'},
  {term:'디페깅',description:'1달러처럼 목표로 정한 가격에서 스테이블코인의 가치가 크게 벗어나는 현상입니다.'},
  {term:'스냅샷',description:'특정 시점의 잔액이나 상태를 기록한 자료입니다. 그 시점 이후의 입출금·손실까지 자동으로 반영하는 자료는 아닙니다.'},
  {term:'화이트리스트',description:'전송을 허용할 목적지나 계약 등을 미리 정해 둔 목록입니다. 주소와 함께 체인·자산도 구분해 관리해야 합니다.'},
  {term:'거버넌스',description:'프로토콜의 규칙·업그레이드·자금 사용 등을 제안과 투표 같은 절차로 결정하는 운영 체계입니다.'},
  {term:'오라클',description:'가격처럼 블록체인 밖의 정보를 스마트컨트랙트에 전달하는 장치입니다. 잘못된 정보가 들어오면 정산이나 담보 계산에 영향을 줄 수 있습니다.'},
];

const entries = glossary.flatMap(entry=>[entry.term,...(entry.aliases??[])].map(alias=>({alias,...entry})));
const escapeRegex = s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern = new RegExp(entries.map(entry=>escapeRegex(entry.alias)).sort((a,b)=>b.length-a.length).join('|'),'g');
const byAlias = new Map(entries.map(entry=>[entry.alias,entry]));
function annotateText(text) {
  return text.replace(pattern,(match,offset)=>{
    if (/^[A-Za-z]/.test(match) && /[A-Za-z0-9_]/.test(text[offset-1]??'')) return match;
    if (/[A-Za-z0-9]$/.test(match) && /[A-Za-z0-9_]/.test(text[offset+match.length]??'')) return match;
    const entry=byAlias.get(match);
    return `<button type="button" class="term-help" data-term="${e(entry.term)}" data-explanation="${e(entry.description)}" title="${e(entry.description)}" aria-label="${e(match)} 용어 설명">${match}</button>`;
  });
}

// Touch text nodes only; preserve hrefs, code blocks, headings and existing controls.
export function annotateTerms(html) {
  const stack=[];
  const excluded=new Set(['a','button','script','style','pre','textarea','select','option','h1','h2','h3','h4','nav','time']);
  const prose=new Set(['p','li','td','th','dd']);
  return html.split(/(<[^>]+>)/g).map(token=>{
    if (!token.startsWith('<')) return stack.some(t=>prose.has(t)) && !stack.some(t=>excluded.has(t)) ? annotateText(token) : token;
    const tag=token.match(/^<\/?([a-z][\w-]*)\b/i);
    if (!tag) return token;
    const name=tag[1].toLowerCase();
    if(token.startsWith('</')) {const n=stack.lastIndexOf(name);if(n>=0)stack.splice(n);}
    else if(!/\/\s*>$/.test(token) && !['br','hr','img','input','meta','link','wbr'].includes(name)) stack.push(name);
    return token;
  }).join('');
}
