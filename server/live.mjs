import {summarizePrices,classifyEvent} from './core.mjs';
export const HEADERS={'User-Agent':'Mozilla/5.0','Accept':'application/json, text/html;q=0.9, */*;q=0.8'};
export async function fetchJson(url,timeout=12000) {
  const response=await fetch(url,{headers:HEADERS,signal:AbortSignal.timeout(timeout)});
  if(!response.ok)throw new Error(`Source returned HTTP ${response.status}.`);
  return response.json();
}
export async function pooled(items,fn,concurrency=4) {
  const result=new Array(items.length);let next=0;
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)},async()=>{while(next<items.length){const i=next++;result[i]=await fn(items[i],i);}}));
  return result;
}
export async function refreshMarket(previous) {
  const checkedAt=new Date().toISOString();
  const portfolio=await pooled(previous.portfolio,async company=>{
    try{
      const raw=await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(company.symbol)}.NS?range=3mo&interval=1d`);
      const {error,...rest}=company;
      return {...rest,price:summarizePrices(raw.chart.result[0])};
    }catch{return {...company,error:'Price refresh failed; showing last saved data.'};}
  });
  // One exchange request covers the portfolio, avoiding a request per holding.
  let events=previous.events,announcementStatus='error',announcementMessage='Exchange refresh failed; last saved filings remain visible.';
  try{
    const raw=await fetchJson('https://www.nseindia.com/api/corporate-announcements?index=equities',18000);
    if(!Array.isArray(raw))throw new Error('Unexpected exchange format.');
    const symbols=new Set(portfolio.map(p=>p.symbol));
    const current=raw.filter(r=>symbols.has(r.symbol)).map(classifyEvent).filter(e=>e.publishedAt);
    const merged=new Map([...previous.events,...current].map(e=>[e.id,e]));
    events=[...merged.values()].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,1800);
    announcementStatus='ok';announcementMessage=`Exchange checked. ${current.length} portfolio filings in the returned feed; saved history retained.`;
  }catch{}
  const ok=portfolio.filter(p=>!p.error).length;
  const sourceStatus={prices:{status:ok===portfolio.length?'ok':ok?'partial':'error',checkedAt,message:`${ok}/${portfolio.length} price histories refreshed. Failed sources retain their saved date.`},announcements:{status:announcementStatus,checkedAt,message:announcementMessage}};
  return {...previous,portfolio,events,asOf:checkedAt,sourceStatus};
}
