const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
const writes=s=>s.requests.filter(r=>r.path==='/api/aprovaAtas/aprovar');
test('assinar sem corpo, trava clique duplicado e emite somente após HTTP',async({page,context,request},info)=>{
 const s=await domain(context,{delay:100});await request.delete('http://127.0.0.1:19300/__events');await page.goto(UI+'/#/aprovaAta');const button=page.getByRole('button',{name:'Assinar ata',exact:true});await expect(button).toBeEnabled();await button.evaluate(el=>{el.click();el.click();});
 await expect(page.getByText('Você aprovou a ata',{exact:true})).toBeVisible();expect(writes(s)).toHaveLength(1);expect(writes(s)[0].body).toBeNull();expect(writes(s)[0].auth).toBe(f.user.token);
 await expect(page.getByRole('table',{name:'Ata Trabalhistas',exact:true}).locator('tbody tr')).toHaveCount(2);
 await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__events')).json()).toContainEqual({name:'aprovarata'});await page.screenshot({path:info.outputPath('minutes.png'),fullPage:true});expect(s.unexpected).toEqual([]);
});
test('papéis especiais, Me/Epp e totais de presença preservam projeção original',async({page,context})=>{
 const minutes=[{_id:'secretario',nomeCredor:'Secretário Sintético',secretario:true,aprovou:true},{_id:'recuperanda',nomeCredor:'Empresa Sintética',empresaRecuperanda:true,aprovou:false},{_id:'epp',nomeCredor:'Epp Sintética',codigoClasse:4,descricaoClasse:'Me/Epp',aprovou:false,data:'1899-12-30T00:00:00.000Z'}];
 const s=await domain(context,{minutes,summary:{quorum2:[],votos2:[],resConfPres:[{codigoClasse:4,quant:2}]}});await page.goto(UI+'/#/aprovaAta');await expect(page.getByText('Secretário - Secretário Sintético',{exact:true})).toBeVisible();await expect(page.getByText('Recuperanda - Empresa Sintética',{exact:true})).toBeVisible();await expect(page.getByTestId('minute-count')).toContainText('1');await expect(page.getByTestId('minute-count')).toContainText('de 2');
 await expect(page.getByRole('table',{name:'Ata Me/Epp',exact:true}).locator('tbody tr').getByRole('cell').nth(2)).toHaveText('');expect(s.unexpected).toEqual([]);
});
test('eventos aprovou/reprovou reconsultam filtro atual, sem listeners acumulados',async({page,context,request})=>{
 const s=await domain(context);await page.goto(UI+'/#/aprovaAta');await expect(page.getByRole('button',{name:'Assinar ata',exact:true})).toBeEnabled();
 await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__fixture')).json()).toHaveLength(1);
 await page.getByLabel('Pesquise o credor').fill('Ana');await page.getByLabel('Pesquise o credor').press('Enter');await expect.poll(()=>s.requests.filter(r=>r.path==='/api/aprovaAtas/').at(-1)?.query.nomeCredor__regex).toBe('/Ana/');
 let count=s.requests.filter(r=>r.path==='/api/aprovaAtas/').length;await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'aprovouata'}});await expect.poll(()=>s.requests.filter(r=>r.path==='/api/aprovaAtas/').length).toBe(count+1);
 await page.evaluate(()=>{location.hash='#/online';});await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();count=s.requests.filter(r=>r.path==='/api/aprovaAtas/').length;await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'reprovouata'}});expect(s.requests.filter(r=>r.path==='/api/aprovaAtas/')).toHaveLength(count);expect(s.unexpected).toEqual([]);
});
test('resposta perdida consulta assinatura, sem reenviar POST',async({page,context})=>{
 const s=await domain(context,{loseAck:true});await page.goto(UI+'/#/aprovaAta');await page.getByRole('button',{name:'Assinar ata',exact:true}).click();await expect(page.getByText('Resultado da assinatura não confirmado.',{exact:false})).toBeVisible();await expect(page.getByRole('table',{name:'Ata Trabalhistas',exact:true}).locator('tbody tr')).toHaveCount(2);expect(writes(s)).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
test('janela fecha assinatura e fluxo integrado preserva presença/voto/resultado/ata',async({page,context})=>{
 const s=await domain(context);await page.clock.install();await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);await page.locator('tbody tr').first().getByRole('button',{name:'Confirmar',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(2);await page.evaluate(()=>{location.hash='#/votar';});await page.locator('tbody tr').getByRole('button',{name:'Sim',exact:true}).click();await expect(page.locator('tbody tr button')).toHaveCount(0);
 await page.evaluate(()=>{location.hash='#/resultado';});await expect(page.locator('tbody tr')).toHaveCount(4);await page.evaluate(()=>{location.hash='#/aprovaAta';});await page.getByRole('button',{name:'Assinar ata',exact:true}).click();await expect(page.getByText('Você aprovou a ata',{exact:true})).toBeVisible();
 s.assembly.podeAta=false;await page.clock.runFor(5100);await expect(page.getByRole('button',{name:'Assinar ata',exact:true})).toBeDisabled();expect(writes(s)).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
