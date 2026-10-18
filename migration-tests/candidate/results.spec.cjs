const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
test('resultado por classe mantém quantidades, valores, precisão e destaque',async({page,context},info)=>{
 const s=await domain(context);await page.goto(UI+'/#/resultado');await expect(page.locator('tbody tr')).toHaveCount(4);
 await expect(page.locator('tbody tr').first().getByRole('cell').nth(3)).toHaveText('2');await expect(page.locator('tbody tr').nth(1).getByRole('cell').nth(3)).toContainText('R$ 600,00');await expect(page.locator('tbody tr').first()).toContainText('66,666666%');
 expect(s.requests.find(r=>r.path==='/api/resultados/').query).toEqual({codigoAssembleia:'6',sort:'codigoClasse'});await expect(page.getByText(s.assembly.pergunta,{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('results.png'),fullPage:true});expect(s.unexpected).toEqual([]);
});
test('modo V usa subtotais e total geral, sem recalcular ou mostrar tabela',async({page,context})=>{
 const s=await domain(context,{resultado:f.resultado.map(row=>({...row,tipoResultado:'V'}))});await page.goto(UI+'/#/resultado');await expect(page.getByText('Total geral',{exact:true})).toBeVisible();await expect(page.getByRole('table')).toHaveCount(0);await expect(page.getByText('R$ 1.000,00',{exact:true})).toBeVisible();await expect(page.getByText('66,666666%',{exact:true})).toBeVisible();expect(s.unexpected).toEqual([]);
});
test('resultado vazio/falha têm leitura manual sem fabricar registros',async({page,context})=>{
 const s=await domain(context,{failReads:true,resultado:[]});await page.goto(UI+'/#/resultado');await expect(page.getByText('Não foi possível consultar o resultado.',{exact:false})).toBeVisible();s.failReads=false;await page.getByRole('button',{name:'Consultar novamente',exact:true}).click();await expect(page.getByText('Nenhum resultado disponível.',{exact:true})).toBeVisible();await expect(page.locator('tbody tr')).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
