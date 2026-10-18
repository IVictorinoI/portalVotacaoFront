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
// Fixture de protocolo somente loopback. Não importa nem executa backend do produto.
if(kind === 'valid') {
 const events=[];const online=new Map();
 const fixture = http.createServer((req,res) => {
  if(req.url === '/__events') {if(req.method==='DELETE')events.length=0;res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(events));return;}
  if(req.url !== '/__fixture') {res.writeHead(404).end();return;}
  if(req.method === 'POST') {
   let body='';req.on('data',part=>{body+=part;});req.on('end',()=>{
    const {event,data}=JSON.parse(body);
   if(!['derrubar','expulsar','expulsarId','getUser','connectedUsers','aprovouata','reprovouata'].includes(event)){res.writeHead(400).end();return;}
    namespace.emit(event,data);res.writeHead(204).end();
   });return;
  }
  res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify([...users.values()]));
 });
 const io = require(path.join(ui,'node_modules/socket.io'))(fixture,{serveClient:false});
 const namespace = io.of('/api/');
 const users = new Map();
 namespace.on('connection',socket=>{
  socket.emit('getUser',{});
  socket.on('setUser',user=>{users.set(socket.id,{id:user.id,tipo:user.tipo});online.set(socket.id,{id:user.id,nome:user.nome,codigoCredor:user.codigoCredor});});
  socket.on('getConnectedUsers',()=>socket.emit('connectedUsers',[...online.values()]));
  for(const name of ['confirmouPresenca','votou','aprovarata','sendMessage'])socket.on(name,data=>events.push({name,data}));
  socket.on('disconnect',()=>{users.delete(socket.id);online.delete(socket.id);});
 });
 fixture.listen(19300,'127.0.0.1');
}
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png'};
http.createServer((req,res)=>{
 const relative = new URL(req.url,'http://127.0.0.1').pathname.slice(1) || 'index.html';
 const file=path.resolve(out,relative);
 if(!file.startsWith(out+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(kind === 'valid' ? 18182 : 18183,'127.0.0.1');
