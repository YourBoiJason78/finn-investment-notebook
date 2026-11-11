import fs from 'node:fs/promises';
import {build} from 'esbuild';
const assets={};const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'};
for(const name of await fs.readdir('web')){const type=types[name.split('.').at(-1)];if(type)assets[name==='index.html'?'/':'/'+name]={body:await fs.readFile('web/'+name,'utf8'),type};}
const bootstrap=JSON.parse(await fs.readFile('data/bootstrap.json','utf8')),researchPacks={};
for(const file of await fs.readdir('data/research'))if(file.endsWith('.json')){const p=JSON.parse(await fs.readFile('data/research/'+file,'utf8'));researchPacks[p.symbol]=p;}
await fs.mkdir('dist/server',{recursive:true});
await fs.mkdir('dist/.openai',{recursive:true});
const entry=`import {createApp} from './server/app.mjs';\nexport default createApp(${JSON.stringify({assets,bootstrap,researchPacks})});`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'worker-entry.mjs'},bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/server/index.js',minify:true,external:['node:module','node:fs','node:fs/promises','node:process','node:buffer','node:path','node:url','node:util','node:stream','node:worker_threads']});
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built FINN Worker with embedded assets and verified source snapshots.');
