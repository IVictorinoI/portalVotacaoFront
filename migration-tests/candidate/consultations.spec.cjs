const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
test('consulta de credores preserva classes, totais, joins e indicador online',async({page,context,request},info)=>{
 const creditors=[...structuredClone(f.credores),{...f.credores[0],_id:'real',codigo:200,codigoClasse:2,descricaoClasse:'Garantia real',nome:'Real'},{...f.credores[0],_id:'quiro',codigo:201,codigoClasse:3,descricaoClasse:'Quirografários',nome:'Quiro'}];
 const votes=[{...f.vote(creditors[0]),tipo:'S'},f.vote(creditors[1])];const s=await domain(context,{credores:creditors,votos:votes});await page.goto(UI+'/#/credores');await expect(page.getByRole('table')).toHaveCount(4);
 const ana=page.getByRole('row').filter({hasText:'Ana Fixture'});await expect(ana).toContainText('Sim');await expect(ana.getByRole('cell').nth(6)).toHaveText('Sim');await expect(ana.getByRole('cell').nth(7)).toHaveText('Sim');
 const bia=page.getByRole('row').filter({hasText:'Bia Fixture'});await expect(bia.getByRole('cell').nth(6)).toHaveText('Não');await expect(bia.getByRole('cell').nth(7)).toHaveText('Sim');
 await request.post('http://127.0.0.1:19300/__fixture',{data:{event:'connectedUsers',data:[{codigoCredor:101}]}});await expect(ana.getByRole('img',{name:'Online',exact:true})).toBeVisible();
 expect(s.requests.find(r=>r.path==='/api/credores/').query).toEqual({codigoAssembleia:'6',sort:'-_id'});expect(s.requests.find(r=>r.path==='/api/votos/').query).toEqual({codigoAssembleia:'6',sort:'-_id'});
 await page.screenshot({path:info.outputPath('creditors.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(s.unexpected).toEqual([]);
});
test('pesquisa consulta credores e votos com regex equivalentes e vazio explícito',async({page,context})=>{
 const s=await domain(context);await page.goto(UI+'/#/credores');await expect(page.getByRole('table')).toHaveCount(2);
 await page.getByLabel('Pesquise o credor').fill('Ana');await page.getByLabel('Pesquise o credor').press('Enter');await expect(page.getByRole('table')).toHaveCount(1);expect(s.requests.findLast(r=>r.path==='/api/credores/').query.nome__regex).toBe('/Ana/');expect(s.requests.findLast(r=>r.path==='/api/votos/').query.nomeCredor__regex).toBe('/Ana/');
 await page.getByLabel('Pesquise o credor').fill('Ausente');await page.getByLabel('Pesquise o credor').press('Enter');await expect(page.getByText('Nenhum credor nesta pesquisa.',{exact:true})).toBeVisible();expect(s.unexpected).toEqual([]);
});
test('consulta votos mostra somente computados, 4–6 casas e horário histórico',async({page,context})=>{
 const rows=f.credores.map(f.vote);rows[0].tipo='S';rows[1].tipo='A';rows[1].data='1899-12-30T00:00:00.000Z';const s=await domain(context,{votos:rows});await page.goto(UI+'/#/votos');await expect(page.locator('tbody tr')).toHaveCount(2);await expect(page.locator('tbody tr').first()).toContainText('33,333333');await expect(page.locator('tbody tr').first()).toContainText('07:12:34');await expect(page.locator('tbody tr').nth(1).getByRole('cell').nth(5)).toHaveText('');
 expect(s.requests.find(r=>r.path==='/api/votos/').query).toEqual({codigoAssembleia:'6',sort:'-ordem'});expect(s.unexpected).toEqual([]);
});
test('presença e voto aparecem nos joins após entrar na consulta',async({page,context})=>{
 const s=await domain(context);await page.goto(UI+'/#/confirmarPresenca');await expect(page.locator('tbody tr')).toHaveCount(3);await page.locator('tbody tr').first().getByRole('button',{name:'Confirmar',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(2);
 await page.evaluate(()=>{location.hash='#/votar';});await page.locator('tbody tr').getByRole('button',{name:'Sim',exact:true}).click();await expect(page.locator('tbody tr button')).toHaveCount(0);
 await page.evaluate(()=>{location.hash='#/credores';});const row=page.getByRole('row').filter({hasText:'Ana Fixture'});await expect(row.getByRole('cell').nth(6)).toHaveText('Sim');await expect(row.getByRole('cell').nth(7)).toHaveText('Sim');expect(s.unexpected).toEqual([]);
});
