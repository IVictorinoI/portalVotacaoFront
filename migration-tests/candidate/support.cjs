const f=require('../support/fixtures.cjs');
const UI='http://127.0.0.1:18182';
async function domain(context,options={}) {
 const state={user:structuredClone(f.user),assembly:{...structuredClone(f.assembleia),codigo:6},credores:structuredClone(f.credores),votos:[],resultado:structuredClone(f.resultado),summary:{quorum2:[],votos2:[]},requests:[],unexpected:[],errors:[],failPresence:null,failVote:null,delay:0,loseAck:false,failReads:false,...options};
 await context.addInitScript(user=>{if(!sessionStorage.getItem('domain-fixture')){sessionStorage.setItem('domain-fixture','1');localStorage.setItem('_application_user',JSON.stringify(user));}},state.user);
 await context.route('**/*',async route=>{
  const request=route.request();const url=new URL(request.url());
  if(url.origin===UI&&!['xhr','fetch'].includes(request.resourceType()))return route.continue();
  if(url.origin==='http://127.0.0.1:19300'&&url.pathname==='/socket.io/')return route.continue();
  if(url.origin!=='http://127.0.0.1:19300'){state.unexpected.push(request.url());return route.abort();}
  const body=request.postDataJSON();const method=request.method();const path=url.pathname;
  state.requests.push({path,query:Object.fromEntries(url.searchParams),body,method,auth:request.headers().authorization});
  const json=data=>route.fulfill({json:data});
  if(path==='/oapi/validateToken')return json({valid:true});
  if(path==='/api//logsAcessos/register')return json({ok:true});
  if(path==='/api//assembleias/'||path==='/api/assembleias/')return json([state.assembly]);
  if(path==='/api//votos/dashboard'){if(state.failReads)return route.fulfill({status:500,json:{errors:['Dashboard indisponível']}});return json(state.summary);}
  if(path==='/api/resultados/'){if(state.failReads)return route.fulfill({status:500,json:{errors:['Resultado indisponível']}});return json(state.resultado);}
  if(path==='/api/credores/'){
   if(state.failReads)return route.fulfill({status:500,json:{errors:['Leitura indisponível']}});
   const name=url.searchParams.get('nome__regex')?.slice(1,-1).toLowerCase()||'';
   return json(state.credores.filter(r=>(!url.searchParams.has('confirmouPresenca__ne')||!r.confirmouPresenca)&&r.nome.toLowerCase().includes(name)));
  }
  if(path==='/api//votos/confirmar'){
   if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));
   if(body._id===state.failPresence)return route.fulfill({status:500,json:{errors:['Presença recusada no teste']}});
   const row=state.credores.find(r=>r._id===body._id);
   if(!row)return route.fulfill({status:500,json:{errors:['Não encontrado']}});
   row.confirmouPresenca=true;const vote=f.vote(row);state.votos.push(vote);
   if(state.loseAck)return route.abort('failed');return json(vote);
  }
  if(path==='/api/votos'||path==='/api/votos/'){
   const name=url.searchParams.get('nomeCredor__regex')?.slice(1,-1).toLowerCase()||'';
   let rows=state.votos.filter(r=>r.nomeCredor.toLowerCase().includes(name));
   if(url.searchParams.has('ordem__gt'))rows=rows.filter(r=>r.ordem>Number(url.searchParams.get('ordem__gt')));
   if(url.searchParams.get('sort')==='-ordem')rows=[...rows].sort((a,b)=>b.ordem-a.ordem);
   return json(rows);
  }
  if(path==='/api/votos/votar'){
   if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));
   if(body._id===state.failVote)return route.fulfill({status:500,json:{errors:['Voto recusado no teste']}});
   const row=state.votos.find(r=>r._id===body._id);if(!row)return route.fulfill({status:500,json:{errors:['Não encontrado']}});
   row.tipo=body.tipo;if(state.loseAck)return route.abort('failed');return json(row);
  }
  state.unexpected.push(request.url());return route.abort();
 });
 return state;
}
module.exports={domain,UI,f};
