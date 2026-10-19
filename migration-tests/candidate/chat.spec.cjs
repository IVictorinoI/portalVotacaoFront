const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
const writes=s=>s.requests.filter(r=>r.path==='/api/chats/'&&r.method==='POST');
const sample={_id:'externa',codigoAssembleia:6,idUsuario:'outro',nomeCredor:'Outro Sintético',msg:'Mensagem sintética',data:'2026-10-18T10:00:00.000Z'};
test('chat Enter preserva payload, eco único, foco e histórico',async({page,context,request},info)=>{
 const s=await domain(context,{chats:[sample]});await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/chat');await expect(page.getByText(sample.msg,{exact:true})).toBeVisible();
 expect(s.requests.find(r=>r.path==='/api/chats/').query).toEqual({codigoAssembleia:'6',sort:'data',limit:'300'});
 const input=page.getByLabel('Digite sua mensagem');await input.fill('Olá sintético');await input.press('Enter');await expect(page.getByText('Olá sintético',{exact:true})).toHaveCount(1);await expect(input).toHaveValue('');await expect(input).toBeFocused();
 expect(writes(s)).toHaveLength(1);expect(writes(s)[0].body).toEqual({msg:'Olá sintético'});
 await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__events')).json()).not.toContainEqual(expect.objectContaining({name:'sendMessage'}));
 await page.screenshot({path:info.outputPath('chat.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(s.unexpected).toEqual([]);
});
test('falha mantém rascunho; clique repetido não duplica POST; releitura é explícita',async({page,context})=>{
 const s=await domain(context,{failChat:true,delay:100});await page.goto(UI+'/#/chat');const input=page.getByLabel('Digite sua mensagem');await input.fill('Rascunho preservado');await page.getByRole('button',{name:'Enviar',exact:true}).evaluate(button=>{button.click();button.click();});
 await expect(page.getByText('Envio recusado no teste',{exact:true})).toBeVisible();await expect(input).toHaveValue('Rascunho preservado');expect(writes(s)).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
test('resposta perdida aparece na releitura, sem envio automático adicional',async({page,context})=>{
 const s=await domain(context,{loseAck:true});await page.goto(UI+'/#/chat');const input=page.getByLabel('Digite sua mensagem');await input.fill('Resposta perdida');await input.press('Enter');await expect(page.getByText('Envio não confirmado.',{exact:false})).toBeVisible();await expect(page.getByText('Resposta perdida',{exact:true})).toHaveCount(1);await expect(input).toHaveValue('Resposta perdida');expect(writes(s)).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
test('badge 5s ignora marcador global, limpa ao ler e cria marcador escopado',async({page,context},info)=>{
 const s=await domain(context,{chats:[sample]});await context.addInitScript(()=>localStorage.setItem('_chat_notify_last_read','2099-01-01T00:00:00.000Z'));await page.clock.install();await page.goto(UI+'/#/online');await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();await page.clock.runFor(5100);await page.clock.resume();
 await expect.poll(()=>s.requests.filter(row=>row.path==='/api//chats/').length).toBeGreaterThan(0);
 if(info.project.name==='mobile')await page.getByRole('button',{name:'Abrir navegação'}).click();await expect(page.getByRole('link',{name:'Chat 1',exact:true})).toBeVisible();await page.getByRole('link',{name:'Chat 1',exact:true}).click();await expect(page.getByText(sample.msg,{exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('_chat_notify_last_read:usuario-falso:6'))).toBe(sample.data);expect(s.requests.find(r=>r.path==='/api//chats/').query.data__gt).toBe('1899-12-30T21:05:19.000Z');expect(s.unexpected).toEqual([]);
});
test('mensagem duplicada/fora de escopo não duplica histórico nem vaza outra assembleia',async({page,context,request})=>{
 const s=await domain(context);await page.goto(UI+'/#/chat');await expect(page.getByLabel('Digite sua mensagem')).toBeVisible();await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__fixture')).json()).toHaveLength(1);
 await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'newMessage',data:sample}});await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'newMessage',data:sample}});await expect(page.getByText(sample.msg,{exact:true})).toHaveCount(1);
 await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'newMessage',data:{...sample,_id:'outra-assembleia',codigoAssembleia:7,msg:'Outro escopo'}}});await expect(page.getByText('Outro escopo',{exact:true})).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
test('leitura e cache não passam de outra identidade ou assembleia',async({page,context})=>{
 const s=await domain(context,{user:f.admin,chats:[sample]});await context.addInitScript(()=>localStorage.setItem('_chat_notify_last_read:usuario-falso:6','2099-01-01T00:00:00.000Z'));
 await page.goto(UI+'/#/chat');await expect(page.getByText(sample.msg,{exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('_chat_notify_last_read:admin-falso:6'))).toBe(sample.data);
 expect(await page.evaluate(()=>localStorage.getItem('_chat_notify_last_read:usuario-falso:6'))).toBe('2099-01-01T00:00:00.000Z');
 s.assembly.codigo=7;await page.evaluate(()=>{location.hash='#/';});await expect(page.getByTestId('assembly')).toHaveText('Assembleia 7');await page.evaluate(()=>{location.hash='#/chat';});await expect(page.getByText('Nenhuma mensagem.',{exact:true})).toBeVisible();await expect(page.getByText(sample.msg,{exact:true})).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
