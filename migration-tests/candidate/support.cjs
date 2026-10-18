const f=require('../support/fixtures.cjs');
const UI='http://127.0.0.1:18182';
async function domain(context,options={}) {
 const state={user:structuredClone(f.user),assembly:{...structuredClone(f.assembleia),codigo:6},credores:structuredClone(f.credores),votos:[],minutes:[],chats:[],notifications:[],logs:[],links:[],classes:[],assemblies:[],legacyUsers:[],resultado:structuredClone(f.resultado),summary:{quorum2:[],votos2:[]},requests:[],unexpected:[],errors:[],failPresence:null,failVote:null,delay:0,loseAck:false,failReads:false,...options};
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
  if(path==='/api/logsAcessos'){if(state.failReads)return route.fulfill({status:500,json:{errors:['Logs indisponíveis']}});return json(state.logs.slice(0,300));}
  if(path==='/api/notificacoes'){
   if(state.failReads)return route.fulfill({status:500,json:{errors:['Notificações indisponíveis']}});
   const text=url.searchParams.get('mensagem__regex')?.slice(1,-1).toLowerCase()||'';
   return json(state.notifications.filter(row=>row.mensagem.toLowerCase().includes(text)&&(!url.searchParams.has('lido')||!row.lido)));
  }
  if(path.startsWith('/api/notificacoes/')&&method==='PUT'){
   if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));const id=path.split('/').at(-1);
   if(id===state.failNotification)return route.fulfill({status:500,json:{errors:['Leitura recusada no teste']}});
   const row=state.notifications.find(row=>row._id===id);if(!row)return route.fulfill({status:404,json:{errors:['Notificação ausente']}});row.lido=body.lido;
   if(state.loseAck)return route.abort('failed');return json(row);
  }
  if(path==='/api/usuarios')return json(state.legacyUsers);
  if(path==='/api/classes')return json(state.classes);
  if(path==='/api/assembleias')return json(state.assemblies.filter(row=>row.descricao.toLowerCase().includes(url.searchParams.get('descricao__regex')?.slice(1,-1).toLowerCase()||'')));
  if(path==='/api/links'&&method==='GET'){if(state.failReads)return route.fulfill({status:500,json:{errors:['Links indisponíveis']}});return json(state.links);}
  if(path.startsWith('/api/links/')&&['POST','PUT','DELETE'].includes(method)){
   if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));if(state.failLink)return route.fulfill({status:500,json:{errors:['Link recusado no teste']}});
   if(method==='POST')state.links.push({...body,_id:'novo-link'});else if(method==='PUT')state.links=state.links.map(row=>row._id===body._id?{...body}:row);else state.links=state.links.filter(row=>row._id!==path.split('/').at(-1));
   if(state.loseAck)return route.abort('failed');return json({ok:true});
  }
  if(path==='/api//assembleias/'||path==='/api/assembleias/')return json([state.assembly]);
  if(path==='/api//votos/dashboard'){if(state.failReads)return route.fulfill({status:500,json:{errors:['Dashboard indisponível']}});return json(state.summary);}
  if(path==='/api/resultados/'){if(state.failReads)return route.fulfill({status:500,json:{errors:['Resultado indisponível']}});return json(state.resultado);}
  if((path==='/api/chats/'||path==='/api//chats/')&&method==='GET'){
   if(state.failReads)return route.fulfill({status:500,json:{errors:['Chat indisponível']}});
   let rows=state.chats.filter(row=>row.codigoAssembleia===Number(url.searchParams.get('codigoAssembleia')));
   if(url.searchParams.has('data__gt'))rows=rows.filter(row=>Date.parse(row.data)>Date.parse(url.searchParams.get('data__gt')));
   return json([...rows].sort((a,b)=>Date.parse(a.data)-Date.parse(b.data)).slice(0,300));
  }
  if(path==='/api/chats/'&&method==='POST'){
   if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));
   if(state.failChat)return route.fulfill({status:500,json:{errors:['Envio recusado no teste']}});
   const row={...body,_id:'chat-'+(state.chats.length+1),data:'2026-10-18T12:00:'+String(state.chats.length).padStart(2,'0')+'.000Z'};state.chats.push(row);
   if(state.loseAck)return route.abort('failed');return json(row);
  }
  if(path==='/api/votos/dashboard/')return json(state.summary);
  if(path==='/api/aprovaAtas/'){
   if(state.failReads)return route.fulfill({status:500,json:{errors:['Ata indisponível']}});
   const name=url.searchParams.get('nomeCredor__regex')?.slice(1,-1).toLowerCase()||'';return json(state.minutes.filter(row=>row.nomeCredor.toLowerCase().includes(name)));
  }
  if(path==='/api/aprovaAtas/aprovar'){
   if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));
   if(state.failSign)return route.fulfill({status:500,json:{errors:['Assinatura recusada no teste']}});
   state.minutes=state.credores.map(row=>({_id:'ata-'+row._id,codigoClasse:row.codigoClasse,descricaoClasse:row.descricaoClasse,nomeCredor:row.nome,nomeProcurador:row.nomeProcurador,data:'2026-10-18T11:00:00.000Z',aprovou:true}));
   if(state.loseAck)return route.abort('failed');return json({Ok:true});
  }
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
