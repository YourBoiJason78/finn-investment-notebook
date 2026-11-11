import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/app.mjs';
import {isPublicDocumentUrl,validateModelAnswer} from '../server/research.mjs';

const bootstrap={portfolio:[],events:[],asOf:'2026-11-11T00:00:00Z',sourceStatus:{},researchExamples:[]};
const pack={symbol:'INFY',name:'Infosys',mode:'verified_snapshot',sources:[{id:'s1',url:'https://www.infosys.com/report.pdf',excerpt:'Revenue growth was 4.2%.',kind:'annual_report'}],findings:[],commitments:[]};
const app=()=>createApp({assets:{'/':{body:'hello',type:'text/html'}},bootstrap,researchPacks:{INFY:pack}});
test('invalid ticker is rejected before source retrieval',async()=>{
 const r=await app().fetch(new Request('https://finn.test/api/research?symbol=..%2Fetc'),{});
 assert.equal(r.status,400);
});
test('prepared company is dated and never impersonates a model run',async()=>{
 const r=await app().fetch(new Request('https://finn.test/api/research?symbol=INFY'),{});
 assert.equal((await r.json()).mode,'verified_snapshot');
});
test('unknown API route does not silently return application HTML',async()=>{
 const r=await app().fetch(new Request('https://finn.test/api/not-real'),{});
 assert.equal(r.status,404);
 assert.match(r.headers.get('content-type'),/json/);
});
test('question limits protect research endpoint',async()=>{
 const r=await app().fetch(new Request('https://finn.test/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({symbol:'INFY',question:'x'.repeat(1001)})}),{});
 assert.equal(r.status,400);
});
test('document fetch rejects private or ambiguous hosts',()=>{
 for(const url of ['http://example.com/a.pdf','https://127.0.0.1/a','https://localhost/a','https://10.0.1.2/a','https://[::1]/a','https://user:pass@example.com/a','https://2130706433/a','https://foo.local/a']) assert.equal(isPublicDocumentUrl(url),false,url);
 assert.equal(isPublicDocumentUrl('https://www.infosys.com/investors/report.pdf'),true);
});
test('model answer cannot introduce nonexistent citations',()=>{
 assert.throws(()=>validateModelAnswer({answer:'A fact',sourceIds:['invented']},['s1']));
 assert.throws(()=>validateModelAnswer({answer:'A fact',sourceIds:[]},['s1']));
 assert.equal(validateModelAnswer({answer:'A fact',sourceIds:['s1']},['s1']).answer,'A fact');
});
