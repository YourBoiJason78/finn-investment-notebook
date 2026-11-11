import http from 'node:http';
import fs from 'node:fs/promises';
import {createApp} from '../server/app.mjs';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const assets={};
for(const name of await fs.readdir('web')){const ext=name.slice(name.lastIndexOf('.'));if(mime[ext])assets[name==='index.html'?'/':'/'+name]={type:mime[ext],body:await fs.readFile('web/'+name,'utf8')};}
const researchPacks={};
for(const name of await fs.readdir('data/research').catch(()=>[]))if(name.endsWith('.json')){const p=JSON.parse(await fs.readFile('data/research/'+name,'utf8'));researchPacks[p.symbol]=p;}
const app=createApp({assets,bootstrap:JSON.parse(await fs.readFile('data/bootstrap.json','utf8')),researchPacks});
const server=http.createServer(async(req,res)=>{
  try{
    const chunks=[];let length=0;for await(const c of req){length+=c.length;if(length>12000){res.writeHead(413);res.end('Too large');return;}chunks.push(c);}
    const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
    const response=await app.fetch(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch(e){res.writeHead(500);res.end('Local server error');console.error(e.message);}
});
server.listen(Number(process.env.PORT||5173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
