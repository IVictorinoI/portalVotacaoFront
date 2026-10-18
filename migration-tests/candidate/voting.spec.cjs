const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
const writes=s=>s.requests.filter(r=>r.path==='/api/votos/votar'&&r.method==='PUT');
for(const [tipo,label] of [['S','Sim'],['N','Não'],['A','Abstenção']])test('voto '+tipo+' preserva payload e evento após confirmação',async({page,context,request})=>{
 const row=f.vote(f.credores[0]);const s=await domain(context,{votos:[row]});await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/votar');await expect(page.locator('tbody tr')).toHaveCount(1);
 await expect(page.getByRole('alert')).toContainText(s.assembly.pergunta);
 await page.locator('tbody tr').getByRole('button',{name:label,exact:true}).click();await expect(page.locator('tbody tr button')).toHaveCount(0);
 expect(writes(s).map(r=>r.body)).toEqual([{_id:row._id,tipo}]);expect(writes(s)[0].auth).toBe(f.user.token);
 await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__events')).json()).toContainEqual({name:'votou',data:{...f.vote(f.credores[0]),tipo}});expect(s.unexpected).toEqual([]);
});
test('lote ignora computados, para em erro e bloqueia clique duplicado',async({page,context})=>{
 const rows=f.credores.map(f.vote);rows[0].tipo='N';const s=await domain(context,{votos:rows,failVote:rows[2]._id,delay:60});await page.goto(UI+'/#/votar');await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.getByRole('button',{name:'Sim para todos',exact:true}).evaluate(button=>{button.click();button.click();});
 await expect(page.getByText('Voto recusado no teste',{exact:true})).toBeVisible();expect(writes(s).map(r=>r.body)).toEqual([{_id:rows[1]._id,tipo:'S'},{_id:rows[2]._id,tipo:'S'}]);expect(s.votos.map(r=>r.tipo)).toEqual(['N','S','']);expect(s.unexpected).toEqual([]);
});
test('Enter e todos usam só filtro atual; admin não inclui procurador',async({page,context})=>{
 const s=await domain(context,{user:f.admin,votos:f.credores.map(f.vote)});await page.goto(UI+'/#/votar');await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.getByLabel('Pesquise o credor').fill('Bia');await page.getByLabel('Pesquise o credor').press('Enter');await expect(page.locator('tbody tr')).toHaveCount(1);
 expect(s.requests.findLast(r=>r.path==='/api/votos').query).toEqual({codigoAssembleia:'6',sort:'-_id',nomeCredor__regex:'/Bia/'});
 await page.getByRole('button',{name:'Abstenção para todos',exact:true}).click();await expect(page.locator('tbody tr button')).toHaveCount(0);expect(writes(s).map(r=>r.body)).toEqual([{_id:'voto-credor-1',tipo:'A'}]);expect(s.unexpected).toEqual([]);
});
test('resposta perdida confirma por leitura sem repetir voto',async({page,context})=>{
 const s=await domain(context,{votos:f.credores.map(f.vote),loseAck:true});await page.goto(UI+'/#/votar');await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.locator('tbody tr').first().getByRole('button',{name:'Não',exact:true}).click();await expect(page.getByText('Lote interrompido.',{exact:false})).toBeVisible();await expect(page.locator('tbody tr').first().getByRole('button')).toHaveCount(0);expect(writes(s)).toHaveLength(1);expect(s.votos[0].tipo).toBe('N');expect(s.unexpected).toEqual([]);
});
test('presença → voto na mesma sessão usa nova consulta e preserva campos',async({page,context},info)=>{
 const s=await domain(context);await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);await page.locator('tbody tr').first().getByRole('button',{name:'Confirmar',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(2);
 await page.evaluate(()=>{location.hash='#/votar';});await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.locator('tbody tr')).toContainText('Ana Fixture');
 await page.screenshot({path:info.outputPath('voting.png'),fullPage:true});
 await page.locator('tbody tr').getByRole('button',{name:'Sim',exact:true}).click();await expect(page.locator('tbody tr button')).toHaveCount(0);expect(writes(s)).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
test('janela e cleanup do polling de voto são respeitados',async({page,context})=>{
 const s=await domain(context,{votos:f.credores.map(f.vote)});await page.clock.install();await page.goto(UI+'/#/votar');await expect(page.locator('tbody tr')).toHaveCount(3);
 s.assembly.podeVotar=false;await page.clock.runFor(5100);await expect(page.getByRole('button',{name:'Sim para todos',exact:true})).toBeDisabled();await expect(page.getByText('Aguarde o início da Assembleia',{exact:true})).toBeVisible();
 await page.evaluate(()=>{location.hash='#/online';});await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();const count=s.requests.filter(r=>r.path==='/api/assembleias/').length;await page.clock.runFor(11000);expect(s.requests.filter(r=>r.path==='/api/assembleias/')).toHaveLength(count);expect(s.unexpected).toEqual([]);
});
