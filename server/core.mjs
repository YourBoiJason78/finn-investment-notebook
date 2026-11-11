export function normalizeSymbol(value) {
  const symbol = String(value || '').trim().toUpperCase().replace(/\.NS$/, '');
  if (!/^[A-Z0-9][A-Z0-9&-]{0,24}$/.test(symbol)) throw new Error('Enter an NSE symbol, such as INFY or M&M.');
  return symbol;
}

export function summarizePrices(chart) {
  const quote = chart?.indicators?.quote?.[0] || {};
  // The current trading session is not end-of-day data until the exchange closes.
  const end = chart?.meta?.currentTradingPeriod?.regular?.end;
  const start = chart?.meta?.currentTradingPeriod?.regular?.start;
  const history = (chart?.timestamp || []).map((t, i) => ({date:new Date(t * 1000).toISOString(),close:quote.close?.[i],volume:quote.volume?.[i],timestamp:t}))
    .filter(p => Number.isFinite(p.close) && p.close > 0 && !(end && Date.now() / 1000 < end && p.timestamp >= start))
    .map(({timestamp,...p})=>p);
  if (!history.length) throw new Error('No completed trading-day prices available.');
  const last = history.at(-1), prev = history.at(-2);
  const volumes = history.slice(-21,-1).map(p=>p.volume).filter(v=>Number.isFinite(v) && v>0);
  const average = volumes.length ? volumes.reduce((a,b)=>a+b,0)/volumes.length : 0;
  return {close:last.close,changePct:prev?.close>0?(last.close/prev.close-1)*100:null,volumeRatio:average && Number.isFinite(last.volume)?last.volume/average:null,asOf:last.date,history};
}

export const cleanText = text => String(text || '').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
export function parseExchangeDate(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{2})-([A-Za-z]{3})-(\d{4})[ T](\d{2}:\d{2}:\d{2})$/);
  if (match) {
    const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[2].toLowerCase())+1;
    if(month) return new Date(`${match[3]}-${String(month).padStart(2,'0')}-${match[1]}T${match[4]}+05:30`).toISOString();
  }
  const time = Date.parse(value);
  return Number.isFinite(time)?new Date(time).toISOString():null;
}
export function classifyEvent(record) {
  const title = cleanText(record.desc || record.subject || record.title || 'Company announcement');
  const detail = cleanText(record.attchmntText || record.details || record.detail || '');
  const text = `${title} ${detail}`.toLowerCase();
  let category='Other',priority=40,reason='A new company disclosure. Open the original filing to assess its relevance.';
  const rules=[
    [/\bresign(?:ation|ed|s)?\b|\bchief financial\b|\bchief executive\b|\bchange(?:s)?\b.*\bmanagement\b|\bappointment\b.*\b(?:cfo|ceo|director)\b/,'Leadership',90,'A leadership change can affect execution and financial oversight.'],
    [/financial results|quarterly results|audited.*results|unaudited.*results/,'Results',95,'New financial results can change the evidence behind your investment view.'],
    [/acquisition|merger|demerger|scheme of arrangement|divest/,'Corporate action',85,'A change in business ownership or structure deserves a closer look.'],
    [/default|fraud|litigation|penalt|regulatory action/,'Risk',88,'A disclosed financial or regulatory issue needs review.'],
    [/order.*(?:award|receipt|win)|bag.*order/,'Business update',75,'A new business development may affect future activity.'],
    [/collaborat|partnership|strategic agreement/,'Business update',55,'A business partnership or collaboration has been disclosed. Review its scope before inferring financial impact.'],
    [/dividend|buyback|bonus|stock split/,'Capital return',70,'A proposed or declared capital action may matter to shareholders.'],
    [/transcript|earnings call|conference call/,'Earnings call',65,'New management commentary may answer a question you are tracking.'],
    [/loss of share|duplicate.*certificate|demat|compliance certificate|trading window|newspaper publication|regulation 74|investor.*meet|voting result|record date/,'Routine',10,'Routine administration; kept accessible without taking priority.']
  ];
  for (const [pattern,c,p,r] of rules) if(pattern.test(text)){category=c;priority=p;reason=r;break;}
  const symbol=record.symbol||'',publishedAt=parseExchangeDate(record.an_dt||record.sort_date||record.publishedAt);
  const url=record.attchmntFile||record.url||'';
  return {id:`${symbol}:${publishedAt}:${url||title}`,symbol,company:record.sm_name||record.company||symbol,title,detail,category,priority,publishedAt,url,reason};
}
export function filterEvents(events,{hours=24,now=new Date().toISOString(),symbol='',routine=true}={}) {
  const end=Date.parse(now),start=hours?end-hours*3600000:-Infinity;
  return events.filter(e=>{const t=Date.parse(e.publishedAt);return t>=start&&t<=end&&(!symbol||e.symbol===symbol)&&(routine||e.priority>10);})
    .sort((a,b)=>b.priority-a.priority||Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
export function extractDocumentLinks(html,baseUrl) {
  const tokens=String(html).matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>|<a\b([^>]*?)>([\s\S]*?)<\/a>/gi);
  const docs=[],seen=new Set();let section='';
  for(const m of tokens){
    if(m[1]!==undefined){section=cleanText(m[1]).toLowerCase();continue;}
    const label=cleanText(m[3]),href=m[2]?.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    const kind=/^transcript$/i.test(label)?'transcript':/annual reports/.test(section)&&/financial year|annual report/i.test(label)?'annual_report':null;
    if(!kind||!href)continue;
    try{
      let url=new URL(href.replace(/&amp;/g,'&'),baseUrl);
      if(url.protocol!=='https:'||url.username||url.password)continue;
      if(/bseindia\.com$/.test(url.hostname)&&url.pathname.toLowerCase().includes('annpdfopen.aspx')){
        const name=url.searchParams.get('Pname');
        if(name&&/^[\w-]+\.pdf$/i.test(name))url=new URL(`https://www.bseindia.com/xml-data/corpfiling/AttachHis/${name}`);
      }
      if(seen.has(url.href))continue;
      seen.add(url.href);docs.push({url:url.href,kind,title:kind==='annual_report'?label:'Earnings-call transcript'});
    }catch{}
  }
  return docs;
}
export function retrievePassages(pages,question,limit=5) {
  const stop=new Set(['what','does','this','that','with','from','have','company','about','were','their','which','will','been','they','the','and','for','are']);
  const words=[...new Set(String(question).toLowerCase().match(/[a-z]{3,}/g)||[])].filter(w=>!stop.has(w));
  if(!words.length)return [];
  const candidates=[];
  pages.forEach((page,i)=>{
    const lines=cleanText(page).match(/[^.!?]+[.!?]?/g)||[];
    for(let j=0;j<lines.length;j++){
      const text=lines.slice(j,j+2).join(' ').trim().slice(0,1100);
      const lower=text.toLowerCase(),matches=words.filter(w=>lower.includes(w)).length;
      if(matches) candidates.push({page:i+1,text,score:matches/words.length+Math.min(text.length,200)/10000});
    }
  });
  const seen=new Set();
  return candidates.sort((a,b)=>b.score-a.score).filter(p=>{const key=`${p.page}:${p.text.slice(0,100)}`;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,limit);
}
