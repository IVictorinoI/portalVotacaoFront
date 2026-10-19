const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
const notifications=[3,2,1].map(n=>({_id:'n'+n,mensagem:'Notificação '+n,tipo:'Teste',data:'2026-10-18T10:00:00.000Z',lido:false}));
const writes=s=>s.requests.filter(r=>r.path.startsWith('/api/notificacoes/')&&r.method==='PUT');
test('online mantém getConnectedUsers/expulsarId e cleanup na saída',async({page,context,request})=>{
 const s=await domain(context,{user:f.admin});await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/online');await expect(page.getByRole('table',{name:'Usuários online',exact:true}).getByRole('row').filter({hasText:f.admin.nome})).toBeVisible();
 await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'connectedUsers',data:[{id:'alvo-sintetico',nome:'Alvo Sintético'}]}});await page.getByRole('row').filter({hasText:'Alvo Sintético'}).getByRole('button',{name:'Expulsar',exact:true}).click();
 await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__events')).json()).toContainEqual({name:'expulsarId',data:'alvo-sintetico'});
 await page.evaluate(()=>{location.hash='#/votar';});await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'connectedUsers',data:[{id:'depois',nome:'Não deve aparecer'}]}});await expect(page.getByText('Não deve aparecer',{exact:true})).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
test('logs mantêm limite/ordem/horários e expulsarTodos sem payload',async({page,context,request})=>{
 const s=await domain(context,{user:f.admin,logs:[{_id:'l1',nome:'Usuário Sintético',tipo:0,data:'2026-10-18T09:00:00.000Z',dataUltimoAcesso:'2026-10-18T10:01:02.000Z'}]});await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/logacesso');await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.locator('tbody tr')).toContainText('06:00:00');await expect(page.locator('tbody tr')).toContainText('07:01:02');expect(s.requests.find(r=>r.path==='/api/logsAcessos').query).toEqual({codigoAssembleia:'6',sort:'-data',limit:'300'});
 await page.getByRole('button',{name:'Expulsar todos',exact:true}).click();await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__events')).json()).toContainEqual({name:'expulsarTodos'});expect(s.unexpected).toEqual([]);
});
test('notificação alterna leitura e apenas não lidos, preservando PUT parcial',async({page,context},info)=>{
 const s=await domain(context,{user:f.admin,notifications:structuredClone(notifications)});await page.goto(UI+'/#/notificacoes');await expect(page.locator('tbody tr')).toHaveCount(3);expect(s.requests.find(r=>r.path==='/api/notificacoes').query).toEqual({sort:'-_id',lido:'false'});
 const row=page.getByRole('row').filter({hasText:'Notificação 3'});await row.getByRole('button',{name:'Não lido',exact:true}).click();await expect(row.getByRole('button',{name:'Lido',exact:true})).toBeVisible();expect(writes(s)[0].body).toEqual({lido:true});
 await row.getByRole('button',{name:'Lido',exact:true}).click();await expect(row.getByRole('button',{name:'Não lido',exact:true})).toBeVisible();expect(writes(s)[1].body).toEqual({lido:false});
 await page.getByLabel('Apenas não lidos',{exact:true}).uncheck();await expect.poll(()=>s.requests.findLast(r=>r.path==='/api/notificacoes').query).toEqual({sort:'-_id'});await page.screenshot({path:info.outputPath('notifications.png'),fullPage:true});expect(s.unexpected).toEqual([]);
});
test('Ler todos é filtrado/sequencial, para na primeira falha e não duplica clique',async({page,context})=>{
 const s=await domain(context,{notifications:structuredClone(notifications),failNotification:'n2',delay:70});await page.goto(UI+'/#/notificacoes');await expect(page.locator('tbody tr')).toHaveCount(3);await page.getByRole('button',{name:'Ler todos',exact:true}).evaluate(button=>{button.click();button.click();});await expect(page.getByText('Leitura recusada no teste',{exact:true})).toBeVisible();expect(writes(s).map(r=>r.path)).toEqual(['/api/notificacoes/n3','/api/notificacoes/n2']);expect(s.notifications.map(row=>row.lido)).toEqual([true,false,false]);expect(s.unexpected).toEqual([]);
});
test('heartbeat único permanece ao navegar e para no logout',async({page,context})=>{
 const s=await domain(context);await page.clock.install();await page.goto(UI+'/#/logacesso');await expect(page.getByRole('heading',{name:'Logs de acesso',exact:true})).toBeVisible();await page.clock.runFor(30100);await expect.poll(()=>s.requests.filter(r=>r.path==='/api//logsAcessos/register').length).toBe(1);
 await page.evaluate(()=>{location.hash='#/votar';});await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();await page.clock.runFor(30100);await expect.poll(()=>s.requests.filter(r=>r.path==='/api//logsAcessos/register').length).toBe(2);
 await page.getByRole('button',{name:'Sair',exact:true}).click();await expect(page.getByLabel('Login',{exact:true})).toBeVisible();await page.clock.runFor(30100);expect(s.requests.filter(r=>r.path==='/api//logsAcessos/register')).toHaveLength(2);expect(s.unexpected).toEqual([]);
});

test('Enter filtra notificações e Ler todos modifica somente o resultado visível',async({page,context})=>{
 const s=await domain(context,{notifications:structuredClone(notifications)});await page.goto(UI+'/#/notificacoes');await expect(page.locator('tbody tr')).toHaveCount(3);await page.getByLabel('Pesquise a notificação',{exact:true}).fill('3');await page.getByLabel('Pesquise a notificação',{exact:true}).press('Enter');await expect(page.locator('tbody tr')).toHaveCount(1);expect(s.requests.findLast(r=>r.path==='/api/notificacoes').query).toEqual({sort:'-_id',mensagem__regex:'/3/',lido:'false'});await page.getByRole('button',{name:'Ler todos',exact:true}).click();await expect(page.getByRole('button',{name:'Lido',exact:true})).toBeVisible();expect(writes(s).map(r=>r.path)).toEqual(['/api/notificacoes/n3']);expect(s.notifications.map(r=>r.lido)).toEqual([true,false,false]);expect(s.unexpected).toEqual([]);
});
