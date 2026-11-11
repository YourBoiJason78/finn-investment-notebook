import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {researchCompany} from '../server/research.mjs';

test('unseen ticker reads primary PDF and retains source page after cleanup',async()=>{
 const original=globalThis.fetch,pdf=await fs.readFile(new URL('./fixtures/primary-source.pdf',import.meta.url));
 globalThis.fetch=async url=>{
  if(String(url).startsWith('https://www.screener.in/company/TESTCO/')){const r=new Response('<h1>Test Company</h1><h3>Concalls</h3><a href="https://www.bseindia.com/test.pdf">Transcript</a>');Object.defineProperty(r,'url',{value:String(url)});return r;}
  if(url==='https://www.bseindia.com/test.pdf')return new Response(pdf);
  throw new Error('Unexpected network request');
 };
 try{
  const result=await researchCompany('TESTCO');
  assert.equal(result.symbol,'TESTCO');
  assert.equal(result.findings.length,1);
  assert.equal(result.sources[0].page,1);
  assert.match(result.sources[0].excerpt,/Revenue growth guidance/);
 }finally{globalThis.fetch=original;}
});
