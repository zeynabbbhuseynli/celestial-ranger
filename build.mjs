import {build} from 'esbuild';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('public',{recursive:true});
for(const f of ['index.html','manifest.json','icon-180.png','sw.js'])await copyFile(f,'public/'+f);
await build({entryPoints:['src/account.js'],bundle:true,format:'iife',outfile:'public/account.js',minify:true});
const url=process.env.SUPABASE_URL||'',key=process.env.SUPABASE_PUBLISHABLE_KEY||'';
if(key.startsWith('sb_secret_'))throw Error('Secret key is forbidden in public configuration');
if(key.split('.').length===3){try{if(JSON.parse(Buffer.from(key.split('.')[1],'base64url')).role==='service_role')throw Error('Service role key forbidden');}catch(e){if(e.message.includes('forbidden'))throw e;}}
await writeFile('public/config.js','window.CELESTIAL_CONFIG='+JSON.stringify({url,key}).replaceAll('<','\\u003c')+';');
