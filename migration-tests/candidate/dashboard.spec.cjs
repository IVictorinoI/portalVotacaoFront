const {test,expect}=require('@playwright/test');
const {domain,UI}=require('./support.cjs');
const rows=[1,2,3,4].map(codigoClasse=>({codigoClasse,descricaoClasse:'Classe '+codigoClasse,valorEsperado:1000,valorConfirmado:500}));
test('dashboard conserva quatro classes, totais, cores distintas e gráficos',async({page,context},info)=>{
 const s=await domain(context,{summary:{quorum2:structuredClone(rows),votos2:structuredClone(rows)}});await page.goto(UI+'/#/');
 await expect(page.getByTestId('quorum-card')).toHaveCount(4);await expect(page.getByTestId('vote-card')).toHaveCount(4);
 await expect(page.getByTestId('quorum-card').first()).toContainText('R$ 1.000,00');await expect(page.getByTestId('quorum-card').first()).toContainText('50.000000%');
 await expect(page.getByTestId('quorum-card').first()).toHaveAttribute('data-color','green');await expect(page.getByTestId('vote-card').first()).toHaveAttribute('data-color','yellow');
 await expect(page.getByRole('img',{name:'Gráfico de quórum',exact:true})).toBeVisible();await expect(page.getByRole('img',{name:'Gráfico de votos',exact:true})).toBeVisible();await expect(page.getByTestId('chart-bar')).toHaveCount(8);
 await expect(page.getByText('AGC Sintetica',{exact:true})).toBeVisible();await expect(page.getByText('06:00:00',{exact:true})).toBeVisible();
 const summary=s.requests.find(r=>r.path==='/api/votos/dashboard');expect(summary.query).toEqual({});expect(summary.method).toBe('GET');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('dashboard.png'),fullPage:true});expect(s.unexpected).toEqual([]);
});
test('zeros/ponto mantêm regra de cards e exclusão só nos gráficos',async({page,context})=>{
 const values=[{...rows[0],valorEsperado:0,valorConfirmado:0},{...rows[1],descricaoClasse:'.'}];const s=await domain(context,{summary:{quorum2:values,votos2:values}});await page.goto(UI+'/#/');
 await expect(page.getByTestId('quorum-card')).toHaveCount(1);await expect(page.getByTestId('quorum-card')).toContainText('0.000000%');await expect(page.getByTestId('chart-bar')).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
test('poll 10s atualiza sem duplicar gráficos e encerra na troca de rota',async({page,context})=>{
 const s=await domain(context,{summary:{quorum2:structuredClone(rows),votos2:structuredClone(rows)}});await page.clock.install();await page.goto(UI+'/#/');await expect(page.getByTestId('quorum-card')).toHaveCount(4);
 s.summary.quorum2[0].valorConfirmado=750;await page.clock.runFor(10100);await expect(page.getByTestId('quorum-card').first()).toContainText('75.000000%');await expect(page.getByTestId('chart-bar')).toHaveCount(8);
 await page.evaluate(()=>{location.hash='#/online';});await expect(page.getByRole('heading',{name:'Usuários online',exact:true})).toBeVisible();const count=s.requests.filter(r=>r.path==='/api/votos/dashboard').length;await page.clock.runFor(11000);expect(s.requests.filter(r=>r.path==='/api/votos/dashboard')).toHaveLength(count);expect(s.unexpected).toEqual([]);
});
test('falha permite leitura manual; vazio não fabrica totais',async({page,context})=>{
 const s=await domain(context,{failReads:true});await page.goto(UI+'/#/');await expect(page.getByText('Não foi possível consultar o dashboard.',{exact:false})).toBeVisible();s.failReads=false;await page.getByRole('button',{name:'Consultar novamente',exact:true}).click();await expect(page.getByText('Nenhum dado disponível para esta assembleia.',{exact:true})).toBeVisible();expect(s.unexpected).toEqual([]);
});
