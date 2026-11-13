import {normalizeSymbol} from './core.mjs';
import {refreshMarket} from './live.mjs';
import {researchCompany,publicResearch,answerQuestion} from './research.mjs';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
export function createApp({assets,bootstrap,researchPacks}) {
  let market=bootstrap,lastRefresh=0,refreshing=null;
  const recentRequests=new Map();
  const checkedSymbols=new Set();
  async function refresh(symbols=[]){
    if(refreshing)await refreshing;
    if(Date.now()-lastRefresh<900000&&symbols.every(s=>checkedSymbols.has(s)))return market;
    const requested=[...new Set([...checkedSymbols,...symbols])];
    refreshing=refreshMarket(market,requested).then(value=>{
      market=value;lastRefresh=Date.now();
      checkedSymbols.clear();
      if(value.sourceStatus.announcements.status==='ok')for(const s of [...value.portfolio.map(p=>p.symbol),...requested])checkedSymbols.add(s);
      return value;
    }).finally(()=>refreshing=null);
    return refreshing;
  }
  async function research(symbol,fresh){return !fresh&&researchPacks[symbol]?researchPacks[symbol]:researchCompany(symbol,{force:fresh});}
  return {async fetch(request,env={}) {
    const url=new URL(request.url),path=url.pathname;
    try{
      if(path.startsWith('/api/')){
        if(!['GET','POST'].includes(request.method))return json({error:'Method not supported.'},405);
        if(request.method==='POST'){
          const origin=request.headers.get('Origin');
          if(origin&&origin!==url.origin)return json({error:'Use FINN from its own page.'},403);
          if(Number(request.headers.get('Content-Length'))>12000)return json({error:'Request is too large.'},413);
        }
        // Per-isolate guard limits accidental repeated expensive research requests.
        if(path==='/api/research'||path==='/api/ask'){
          const key=request.headers.get('CF-Connecting-IP')||'local',now=Date.now();
          const times=(recentRequests.get(key)||[]).filter(t=>now-t<60000);
          if(times.length>=20)return json({error:'Please wait a moment before another research request.'},429);
          times.push(now);if(recentRequests.size>500)recentRequests.clear();recentRequests.set(key,times);
        }
        if(path==='/api/bootstrap'&&request.method==='GET')return json({...market,modelConfigured:!!(env.GEMINI_API_KEY&&env.GEMINI_MODEL)});
        if(path==='/api/refresh'&&request.method==='GET')return json({...await refresh(),modelConfigured:!!(env.GEMINI_API_KEY&&env.GEMINI_MODEL)});
        if(path==='/api/research'&&request.method==='GET'){
          const symbol=normalizeSymbol(url.searchParams.get('symbol'));
          return json(publicResearch(await research(symbol,url.searchParams.get('fresh')==='1')));
        }
        if(path==='/api/ask'&&request.method==='POST'){
          const text=await request.text();if(text.length>12000)return json({error:'Request is too large.'},413);
          const body=JSON.parse(text),symbol=normalizeSymbol(body.symbol),question=String(body.question||'').trim();
          if(question.length<3||question.length>1000)return json({error:'Use a question between 3 and 1,000 characters.'},400);
          return json(await answerQuestion(await research(symbol,body.fresh===true),question,env));
        }
        if(path==='/api/watch-check'&&request.method==='POST'){
          const text=await request.text();if(text.length>12000)return json({error:'Request is too large.'},413);
          const {watches}=JSON.parse(text);
          if(!Array.isArray(watches)||watches.length>30)return json({error:'Check up to 30 saved questions at a time.'},400);
          const valid=watches.map(w=>({...w,symbol:normalizeSymbol(w.symbol)}));
          if(valid.some(w=>!Number.isFinite(Date.parse(w.createdAt))||String(w.question).length>1000))return json({error:'Invalid saved question.'},400);
          const data=await refresh(valid.map(w=>w.symbol));
          const checks=valid.map(w=>({id:w.id,checkedAt:new Date().toISOString(),status:data.sourceStatus.announcements.status==='error'?'unavailable':'checked',events:data.events.filter(e=>e.symbol===w.symbol&&Date.parse(e.publishedAt)>Date.parse(w.createdAt)&&e.priority>10).slice(0,5)}));
          return json({checks,sourceStatus:data.sourceStatus});
        }
        return json({error:'API route not found.'},404);
      }
      const asset=assets[path];if(!asset)return new Response('Not found',{status:404});
      return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"}});
    }catch(error){
      const bad=error instanceof SyntaxError||/Enter an NSE symbol/.test(error.message);
      return json({error:bad?error.message:'The source could not be read right now. Please retry or use a verified example.',detail:bad?undefined:error.message},bad?400:502);
    }
  }};
}
