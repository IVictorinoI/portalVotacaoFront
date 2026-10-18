const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
test('acompanhamento 3s agrega novos votos, sem duplicar os existentes',async({page,context})=>{
 const a={...f.vote(f.credores[0]),tipo:'S',ordem:1};const s=await domain(context,{votos:[a]});await page.clock.install();await page.goto(UI+'/#/votacaoTempoReal');await expect(page.locator('tbody tr')).toHaveCount(1);
 s.votos.push({...f.vote(f.credores[1]),tipo:'N',ordem:2});await page.clock.runFor(3100);await expect(page.locator('tbody tr')).toHaveCount(2);await expect(page.locator('tbody tr').first()).toContainText('Bia Fixture');
 expect(s.requests.find(r=>r.path==='/api/votos/').query).toEqual({codigoAssembleia:'6',ordem__gt:'0',sort:'-ordem'});
 s.votos[0]={...s.votos[0],tipo:'A',ordem:3};await page.clock.runFor(3100);await expect(page.locator('tbody tr')).toHaveCount(2);await expect(page.locator('tbody tr').last()).toContainText('Abstenção');
 await expect.poll(()=>s.requests.filter(r=>r.path==='/api/votos/').map(r=>r.query.ordem__gt)).toEqual(['0','1','2']);
 await page.clock.runFor(3100);await expect.poll(()=>s.requests.findLast(r=>r.path==='/api/votos/').query.ordem__gt).toBe('3');expect(s.requests.filter(r=>r.method!=='GET'&&r.path!=='/oapi/validateToken')).toEqual([]);
 await page.evaluate(()=>{location.hash='#/online';});await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();const count=s.requests.filter(r=>r.path==='/api/votos/').length;await page.clock.runFor(6100);expect(s.requests.filter(r=>r.path==='/api/votos/')).toHaveLength(count);expect(s.unexpected).toEqual([]);
});
test('troca de sessão descarta feed antigo sem consultar antes de validar',async({page,context})=>{
 const s=await domain(context,{votos:[{...f.vote(f.credores[0]),tipo:'S',ordem:1}]});await page.goto(UI+'/#/votacaoTempoReal');await expect(page.locator('tbody tr')).toHaveCount(1);await page.getByRole('button',{name:'Sair',exact:true}).click();await expect(page.getByLabel('Login',{exact:true})).toBeVisible();await expect(page.locator('tbody tr')).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
