import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizePrices,retrievePassages} from '../server/core.mjs';
import {createApp} from '../server/app.mjs';
import {answerQuestion} from '../server/research.mjs';

test('reprocessing a saved intraday snapshot never promotes its incomplete candle',()=>{
 const start=Date.parse('2026-11-11T03:45:00Z')/1000;
 const chart={timestamp:[start-86400,start],meta:{currentTradingPeriod:{regular:{start,end:start+22500}}},indicators:{quote:[{close:[100,107],volume:[100,20]}]}};
 assert.equal(summarizePrices(chart,Date.parse('2026-11-11T06:30:19Z')).close,100);
});

test('a new watched symbol is collected even after a cached portfolio refresh',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify([{symbol:'WIPRO',desc:'Financial Results',an_dt:'13-Nov-2026 12:00:00',attchmntFile:'https://archives.nseindia.com/wipro.pdf'}])));
 const app=createApp({assets:{},bootstrap:{portfolio:[],events:[],sourceStatus:{}},researchPacks:{}});
 await app.fetch(new Request('https://finn.test/api/refresh'));
 const r=await app.fetch(new Request('https://finn.test/api/watch-check',{method:'POST',body:JSON.stringify({watches:[{id:'w',symbol:'WIPRO',question:'Revenue growth?',createdAt:'2026-11-01T00:00:00Z'}]})}));
 const {checks}=await r.json();
 assert.equal(checks[0].status,'checked');
 assert.equal(checks[0].events[0]?.symbol,'WIPRO');
});

const evidencePack={symbol:'TEST',sources:[{id:'report',url:'https://www.infosys.com/report.pdf',title:'Report',kind:'annual_report'}],_documents:[{pages:['Revenue growth initial guidance was ten percent for the year.','Revenue growth revenue growth actual outcome was five percent for the year.']}]};
test('financial passage boundaries preserve decimal numbers and percentage units',()=>{
 const pages=['Revenues were flat sequentially in constant currency terms. Our operating margin for the quarter was 16.8%. Revenue was $2.6 billion.'];
 const passages=retrievePassages(pages,'operating margin',2);
 assert.equal(passages.length,2);
 for(const passage of passages)assert.match(passage.text,/16\.8%/);
 assert.ok(passages.some(p=>p.text.includes('$2.6 billion')));
});
test('extractive answers preserve both page citations from the same document',async()=>{
 const a=await answerQuestion(evidencePack,'revenue growth');
 assert.equal(a.sources.length,2);
 assert.equal(new Set(a.sourceIds).size,2);
 assert.deepEqual(a.sources.map(s=>s.page).sort(),[1,2]);
});
test('generated answers retain the exact cited page, not the highest ranked page',async t=>{
 t.mock.method(globalThis,'fetch',async(_url,options)=>{
  const body=JSON.parse(options.body),evidence=JSON.parse(body.contents[0].parts[0].text).evidence;
  const source=evidence.find(p=>p.page===1);
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({answer:'Initial guidance was ten percent.',sourceIds:[source.id]})}]}}]}));
 });
 const a=await answerQuestion(evidencePack,'revenue growth',{GEMINI_API_KEY:'test-only',GEMINI_MODEL:'test-only'});
 assert.equal(a.mode,'model');
 assert.equal(a.sources[0].page,1);
 assert.match(a.sources[0].excerpt,/initial guidance/);
});
