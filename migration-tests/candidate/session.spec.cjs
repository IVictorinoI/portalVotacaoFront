const {test,expect}=require('@playwright/test');
const {user,admin}=require('../support/fixtures.cjs');
const UI='http://127.0.0.1:18182';
const FIXTURE='http://127.0.0.1:19300/__fixture';
async function setup(context,{stored=null,valid=true,active=[{codigo:6}],loginError=false}={}) {
 const requests=[];const unexpected=[];
 await context.addInitScript(({stored})=>{
  if(!sessionStorage.getItem('session-fixture')) {
   sessionStorage.setItem('session-fixture','1');
   if(stored!==null)localStorage.setItem('_application_user',typeof stored==='string'?stored:JSON.stringify(stored));
   localStorage.setItem('codigoAssembleiaAtiva','88');
  }
 },{stored});
 await context.route('**/*',async route=>{
  const req=route.request();const url=new URL(req.url());
  if(url.origin===UI&&!['xhr','fetch'].includes(req.resourceType()))return route.continue();
  if(url.origin==='http://127.0.0.1:19300' && url.pathname==='/socket.io/')return route.continue();
  if(url.origin==='http://127.0.0.1:19300') {
   requests.push({path:url.pathname+url.search,method:req.method(),headers:req.headers(),body:req.postDataJSON()});
   if(url.pathname==='/oapi/validateToken')return route.fulfill({json:{valid}});
   if(url.pathname==='/oapi/login')return route.fulfill({status:loginError?400:200,json:loginError?{errors:['Credenciais inválidas']}:user});
   if(url.pathname==='/api//assembleias/')return route.fulfill({json:active});
   if(url.pathname==='/api/assembleias/')return route.fulfill({json:active});
   if(url.pathname==='/api/votos')return route.fulfill({json:[]});
   if(url.pathname==='/api//logsAcessos/register')return route.fulfill({json:{Ok:true}});
  }
  unexpected.push(req.url());return route.abort();
 });
 return {requests,unexpected};
}
test('login por Enter preserva payload/hash, escopo da API, socket único e logout',async({page,context,request},info)=>{
 const h=await setup(context);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(UI+'/#/votar');
 await page.getByLabel('Login',{exact:true}).fill('fixture');await page.getByLabel('Senha',{exact:true}).fill('senha-falsa');await page.getByLabel('Senha',{exact:true}).press('Enter');
 await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();
 await expect(page.getByTestId('assembly')).toHaveText('Assembleia 6');
 expect(h.requests.slice(0,2).map(r=>r.path)).toEqual(['/oapi/login','/api//assembleias/?ativo=true']);
 expect(h.requests.slice(2).map(r=>r.path).sort()).toEqual(['/api/assembleias/?codigo=6','/api/votos?codigoAssembleia=6&sort=-_id&codigoProcurador=90']);
 expect(h.requests[0].body).toEqual({login:'fixture',senha:'senha-falsa'});
 expect(h.requests[0].headers.authorization).toBeUndefined();expect(h.requests[1].headers.authorization).toBe(user.token);
 await expect.poll(async()=> (await (await request.get(FIXTURE)).json())).toEqual([{id:user.id,tipo:0}]);
 await page.screenshot({path:info.outputPath('session-shell.png'),fullPage:true});
 await page.reload();await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();
 expect(h.requests.some(r=>r.path==='/oapi/validateToken'&&r.body.token===user.token)).toBe(true);
 await page.getByRole('button',{name:'Sair',exact:true}).click();await expect(page.getByLabel('Login',{exact:true})).toBeVisible();
 await expect.poll(async()=> (await (await request.get(FIXTURE)).json())).toEqual([]);
 expect(await page.evaluate(()=>localStorage.getItem('_application_user'))).toBeNull();expect(h.unexpected).toEqual([]);expect(errors).toEqual([]);
});
test('restaura admin, navega pelo menu e histórico, preserva rotas ocultas/fallback',async({page,context},info)=>{
 const h=await setup(context,{stored:admin});await page.goto(UI+'/#/online');
 await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();
 if(info.project.name==='mobile')await page.getByRole('button',{name:'Abrir navegação'}).click();
 await page.getByRole('link',{name:'Credores',exact:true}).click();await expect(page.getByRole('heading',{name:'Credores',exact:true})).toBeVisible();
 await page.goBack();await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();
 await page.goForward();await expect(page.getByRole('heading',{name:'Credores',exact:true})).toBeVisible();
 for(const [path,title] of [['Contato','Contato'],['contato','Contato'],['assembleias','Assembleias'],['classes','Classes'],['login','Login legado'],['inexistente','Início']]) {
  await page.evaluate(path=>{location.hash='#/'+path;},path);await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
 }
 expect(h.requests.filter(r=>r.path.includes('assembleias'))).toHaveLength(1);expect(h.unexpected).toEqual([]);
});
test('comum não recebe menu admin, mas deep link continua sem novo guard',async({page,context},info)=>{
 const h=await setup(context,{stored:user});await page.goto(UI+'/#/online');
 await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();
 if(info.project.name==='mobile')await page.getByRole('button',{name:'Abrir navegação'}).click();
 await expect(page.getByRole('link',{name:'Usuários online',exact:true})).toHaveCount(0);expect(h.unexpected).toEqual([]);
});
for(const mode of ['invalid-storage','invalid-token','no-active','login-error'])test(mode,async({page,context})=>{
 const h=await setup(context,{stored:mode==='invalid-storage'?'{broken':mode==='login-error'?null:user,valid:mode!=='invalid-token',active:mode==='no-active'?[]:[{codigo:6}],loginError:mode==='login-error'});
 await page.goto(UI+'/#/votar');
 if(mode==='no-active') {await expect(page.getByRole('alert')).toContainText('assembleia ativa');expect(await page.evaluate(()=>localStorage.getItem('codigoAssembleiaAtiva'))).toBeNull();}
 else {await expect(page.getByLabel('Login',{exact:true})).toBeVisible();expect(h.requests.some(r=>r.path.startsWith('/api/'))).toBe(false);}
 if(mode==='login-error') {await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page.getByRole('alert')).toHaveText('Credenciais inválidas');}
 expect(h.unexpected).toEqual([]);
});
test('evento derrubar encerra só identidade alvo e remove conexão',async({page,context,request})=>{
 const h=await setup(context,{stored:user});await page.goto(UI+'/#/votar');await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();
 await expect.poll(async()=> (await (await request.get(FIXTURE)).json())).toHaveLength(1);
 page.on('dialog',dialog=>dialog.accept());
 await request.post(FIXTURE,{data:{event:'derrubar',data:{id:user.id,message:'Sessão sintética encerrada'}}});
 await expect(page.getByLabel('Login',{exact:true})).toBeVisible();await expect.poll(async()=> (await (await request.get(FIXTURE)).json())).toEqual([]);expect(h.unexpected).toEqual([]);
});
test('falha de rede no login mantém reload original, sem repetição automática do POST',async({page,context})=>{
 const h=await setup(context);
 let posts=0;
 await context.route('**/oapi/login',route=>{posts++;return route.abort('failed');});
 await page.goto(UI+'/#/votar');
 await page.getByLabel('Login',{exact:true}).fill('fixture');
 await page.getByLabel('Senha',{exact:true}).fill('falsa');
 const navigation=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());
 await page.getByRole('button',{name:'Entrar',exact:true}).click();await navigation;
 await expect(page.getByLabel('Login',{exact:true})).toHaveValue('');expect(posts).toBe(1);expect(h.unexpected).toEqual([]);
});
test('troca de identidade em outra aba revalida sessão e escopo',async({page,context,request})=>{
 const h=await setup(context,{stored:user});await page.goto(UI+'/#/votar');
 await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();
 const other=await context.newPage();await other.goto(UI+'/');await expect(other.getByRole('heading',{name:'Início',exact:true})).toBeVisible();
 await other.evaluate(admin=>localStorage.setItem('_application_user',JSON.stringify(admin)),admin);
 await expect(page.getByText(admin.nome,{exact:true})).toBeVisible();
 await other.close();
 await expect.poll(async()=> (await (await request.get(FIXTURE)).json())).toEqual([{id:admin.id,tipo:1}]);
 expect(h.requests.filter(r=>r.path==='/oapi/validateToken').length).toBeGreaterThanOrEqual(3);expect(h.unexpected).toEqual([]);
});
