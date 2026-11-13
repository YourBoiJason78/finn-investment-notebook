import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSymbol, summarizePrices, classifyEvent, filterEvents, extractDocumentLinks, retrievePassages } from '../server/core.mjs';

test('normalizes exchange suffix but rejects paths and requests for other exchanges', () => {
  assert.equal(normalizeSymbol(' infy.ns '), 'INFY');
  assert.equal(normalizeSymbol('M&M'), 'M&M');
  for (const bad of ['', '../etc', 'https://foo', 'INFY.BO', 'a'.repeat(32)]) assert.throws(() => normalizeSymbol(bad));
});
test('EOD volume ratio excludes the latest day from the baseline', () => {
  const chart = {timestamp:[1,2,3,4],indicators:{quote:[{close:[100,102,null,110],volume:[100,100,0,300]}]}};
  const p = summarizePrices(chart);
  assert.equal(p.volumeRatio, 3);
  assert.ok(Math.abs(p.changePct - 7.843137) < 0.00001);
  assert.equal(p.history.length, 3);
});
test('unavailable previous volume yields no ratio, not infinity', () => {
  const p = summarizePrices({timestamp:[1,2],indicators:{quote:[{close:[0,10],volume:[0,300]}]}});
  assert.equal(p.volumeRatio, null);
  assert.equal(p.changePct, null);
});
test('material announcement outranks routine compliance and preserves primary link', () => {
  const e = classifyEvent({symbol:'INFY',desc:'Resignation of Chief Financial Officer',attchmntFile:'https://archives.nseindia.com/a.pdf',an_dt:'10-Nov-2026 12:00:00'});
  assert.equal(e.category, 'Leadership');
  assert.equal(e.priority, 90);
  assert.equal(e.url,'https://archives.nseindia.com/a.pdf');
  assert.equal(classifyEvent({desc:'Loss of share certificate'}).category,'Routine');
});
test('exchange boilerplate and lifecycle management do not imply leadership change',()=>{
 const e=classifyEvent({desc:'Updates',attchmntText:"HCL Technologies Limited has informed the Exchange regarding a collaboration for product lifecycle management."});
 assert.notEqual(e.category,'Leadership');
});
test('newspaper copies of financial results remain routine follow-up paperwork',()=>{
 assert.equal(classifyEvent({desc:'Copy of Newspaper Publication',attchmntText:'Newspaper publication for Unaudited financial results for the quarter'}).category,'Routine');
 assert.equal(classifyEvent({desc:'General Updates',attchmntText:'Publication of Newspaper Advertisements w.r.t Audited Financial Results'}).category,'Routine');
});
test('time window filters both start and end; zero means all available', () => {
  const e = [{id:'1',publishedAt:'2026-11-10T06:00:00Z',priority:60},{id:'2',publishedAt:'2026-11-11T06:00:00Z',priority:90},{id:'3',publishedAt:'2026-11-12T06:00:00Z',priority:99}];
  assert.deepEqual(filterEvents(e,{hours:24,now:'2026-11-11T07:00:00Z'}).map(x=>x.id),['2']);
  assert.deepEqual(filterEvents(e,{hours:0,now:'2026-11-11T07:00:00Z'}).map(x=>x.id),['2','1']);
});
test('discovers primary documents without admitting presentations as research evidence', () => {
  const html='<section id="documents"><h3>Annual reports</h3><a href="https://company.com/annual.pdf">Financial Year 2025</a><h3>Concalls</h3><a href="https://company.com/call.pdf">Transcript</a><a href="https://company.com/deck.pdf">PPT</a><a href="javascript:evil()">Transcript</a></section>';
  const docs = extractDocumentLinks(html,'https://www.screener.in/company/INFY/');
  assert.equal(docs.length,2);
  assert.deepEqual(docs.map(x=>x.kind),['annual_report','transcript']);
});
test('passage retrieval returns matching page and refuses unrelated evidence', () => {
  const pages = ['Dividend paid to shareholders.','Revenue growth guidance is between 3% and 5% for the fiscal year.'];
  const r = retrievePassages(pages,'revenue guidance');
  assert.equal(r[0].page,2);
  assert.match(r[0].text,/3% and 5%/);
  assert.equal(retrievePassages(pages,'lithium mining').length,0);
});
