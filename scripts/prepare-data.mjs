import fs from 'node:fs/promises';
import {summarizePrices,classifyEvent} from '../server/core.mjs';
const raw=JSON.parse(await fs.readFile('data/raw-market.json','utf8'));
const portfolio=raw.portfolio.map(({chart,...company})=>{
  try{return {...company,price:summarizePrices(chart,Date.parse(raw.collectedAt))};}catch{return {...company,price:null,error:company.error||'No completed trading-day prices available.'};}
});
const events=raw.filings.flatMap(f=>f.records.map(classifyEvent)).filter(e=>e.publishedAt);
const pricesOkay=portfolio.filter(p=>p.price).length;
const filingsOkay=raw.filings.filter(f=>!f.error).length;
const sourceStatus={
  prices:{status:pricesOkay===portfolio.length?'ok':pricesOkay?'partial':'error',checkedAt:raw.collectedAt,message:`${pricesOkay}/${portfolio.length} price histories collected. End-of-day data.`},
  announcements:{status:filingsOkay===portfolio.length?'ok':filingsOkay?'partial':'error',checkedAt:raw.collectedAt,message:`${filingsOkay}/${portfolio.length} company filing feeds collected.`}
};
await fs.writeFile('data/bootstrap.json',JSON.stringify({portfolio,events,asOf:raw.collectedAt,sourceStatus,researchExamples:['INFY','HCLTECH','TCS'],modelConfigured:false},null,2));
console.log(JSON.stringify({portfolio:portfolio.length,events:events.length,latestFiling:events.map(e=>e.publishedAt).sort().at(-1),latestPrice:portfolio.find(p=>p.price)?.price.asOf}));
