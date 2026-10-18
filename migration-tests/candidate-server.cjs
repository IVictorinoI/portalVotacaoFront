const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const kind = process.argv[2];
if (!['valid','missing'].includes(kind)) throw new Error('Modo de smoke desconhecido');
const ui = path.resolve(__dirname, '../migration-ui');
const out = fs.mkdtempSync(path.join(__dirname, '.candidate-'));
const env = {...process.env};
for(const key of Object.keys(env)) if(key.startsWith('VITE_')) delete env[key];
if(kind === 'missing') Object.assign(env, { VITE_API_BASE_URL:'', VITE_OAPI_BASE_URL:'', VITE_SOCKET_URL:'' });
if(kind === 'valid') Object.assign(env, { VITE_API_BASE_URL:'http://127.0.0.1:19300/api', VITE_OAPI_BASE_URL:'http://127.0.0.1:19300/oapi', VITE_SOCKET_URL:'http://127.0.0.1:19300/api/' });
const result=spawnSync(process.execPath,[path.join(ui,'node_modules/vite/bin/vite.js'),'build','--outDir',out,'--mode','smoke'],{cwd:ui,env,stdio:'inherit'});
if(result.status !== 0) process.exit(result.status || 1);
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png'};
http.createServer((req,res)=>{
 const relative = new URL(req.url,'http://127.0.0.1').pathname.slice(1) || 'index.html';
 const file=path.resolve(out,relative);
 if(!file.startsWith(out+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(kind === 'valid' ? 18182 : 18183,'127.0.0.1');
