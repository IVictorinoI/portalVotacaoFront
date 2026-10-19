const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
const writes=s=>s.requests.filter(r=>r.method==='POST'&&r.path==='/api//votos/confirmar');
test('presença: colunas, moeda, filtros Enter e sucesso antes do evento',async({page,context,request},info)=>{
 const s=await domain(context);await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/confirmarPresenca');
 await expect(page.locator('tbody tr')).toHaveCount(3);await expect(page.locator('tbody tr').first()).toContainText('R$ 1.000,00');
 await page.screenshot({path:info.outputPath('presence.png'),fullPage:true});
 await page.getByLabel('Pesquise o credor').fill('Ana');await page.getByLabel('Pesquise o credor').press('Enter');await expect(page.locator('tbody tr')).toHaveCount(1);
 expect(s.requests.findLast(r=>r.path==='/api/credores/').query).toEqual({codigoAssembleia:'6',sort:'-_id',nome__regex:'/Ana/',confirmouPresenca__ne:'true',apenasProcurador__ne:'true',codigoProcurador:'90'});
 await page.getByRole('button',{name:'Confirmar',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(0);
 expect(writes(s).map(r=>r.body)).toEqual([{_id:'credor-0'}]);expect(writes(s)[0].auth).toBe('Bearer '+f.user.token);
 await expect.poll(async()=> (await (await request.get('http://127.0.0.1:19300/__events')).json())).not.toContainEqual(expect.objectContaining({name:'confirmouPresenca'}));
 expect(s.unexpected).toEqual([]);
});
test('poll da janela fecha ações e encerra ao sair da rota',async({page,context})=>{
 const s=await domain(context);await page.clock.install();await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);
 s.assembly.podeConfirmar=false;await page.clock.runFor(5100);await expect(page.getByRole('button',{name:'Confirmar todos',exact:true})).toBeDisabled();
 await page.evaluate(()=>{location.hash='#/online';});await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();
 const count=s.requests.filter(r=>r.path==='/api/assembleias/').length;await page.clock.runFor(11000);expect(s.requests.filter(r=>r.path==='/api/assembleias/')).toHaveLength(count);expect(s.unexpected).toEqual([]);
});
test('lote protegido para no segundo erro, mantém primeiro confirmado e não duplica clique',async({page,context})=>{
 const s=await domain(context,{failPresence:'credor-1',delay:80});await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.getByRole('button',{name:'Confirmar todos',exact:true}).evaluate(button=>{button.click();button.click();});
 await expect(page.getByText('Presença recusada no teste',{exact:true})).toBeVisible();
 expect(writes(s).map(r=>r.body._id)).toEqual(['credor-0','credor-1']);await expect(page.locator('tbody tr')).toHaveCount(2);expect(s.unexpected).toEqual([]);
});
test('todos inclui apenas pesquisa atual e admin não recebe filtro de procurador',async({page,context})=>{
 const s=await domain(context,{user:f.admin});await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);
 expect(s.requests.find(r=>r.path==='/api/credores/').query.codigoProcurador).toBeUndefined();
 await page.getByLabel('Pesquise o credor').fill('Bia');await page.getByLabel('Pesquise o credor').press('Enter');await expect(page.locator('tbody tr')).toHaveCount(1);
 await page.getByRole('button',{name:'Confirmar todos',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(0);expect(writes(s).map(r=>r.body._id)).toEqual(['credor-1']);expect(s.unexpected).toEqual([]);
});
test('resposta perdida reconsulta, sem reenviar escrita aceita',async({page,context})=>{
 const s=await domain(context,{loseAck:true});await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.locator('tbody tr').first().getByRole('button',{name:'Confirmar',exact:true}).click();
 await expect(page.getByText('Lote interrompido.',{exact:false})).toBeVisible();await expect(page.locator('tbody tr')).toHaveCount(2);expect(writes(s)).toHaveLength(1);expect(s.votos).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
test('janela fechada desabilita escrita; falha de leitura permite tentativa manual',async({page,context})=>{
 const s=await domain(context,{assembly:{...f.assembleia,codigo:6,podeConfirmar:false,podeVotar:false},failReads:true});await page.goto(UI+'/#/confirmarPresenca');
 await expect(page.getByText('Não foi possível consultar os dados.',{exact:false})).toBeVisible();s.failReads=false;await page.getByRole('button',{name:'Consultar novamente',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(3);
 await expect(page.getByRole('button',{name:'Confirmar todos',exact:true})).toBeDisabled();expect(writes(s)).toHaveLength(0);expect(s.unexpected).toEqual([]);
});
test('logout durante lote impede próximo item e evento da sessão antiga',async({page,context,request})=>{
 const s=await domain(context,{delay:180});await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.getByRole('button',{name:'Confirmar todos',exact:true}).click();await expect.poll(()=>writes(s).length).toBe(1);await page.getByRole('button',{name:'Sair',exact:true}).click();await expect(page.getByLabel('Login',{exact:true})).toBeVisible();
 await expect.poll(()=>s.credores.filter(r=>r.confirmouPresenca).length).toBe(1);expect(writes(s)).toHaveLength(1);expect((await (await request.get('http://127.0.0.1:19300/__events')).json()).filter(e=>e.name!=='setUser')).toEqual([]);expect(s.unexpected).toEqual([]);
});
