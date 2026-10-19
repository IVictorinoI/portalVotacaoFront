const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
test('401 protegido remove sessão e volta ao login sem repetir escrita',async({page,context})=>{
 await domain(context);let reads=0;
 await context.route('**/api/votos?*',route=>{reads++;return route.fulfill({status:401,json:{errors:['Sessão revogada']}});});
 await page.goto(UI+'/#/votar');await expect(page.getByLabel('Login',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('_application_user'))).toBeNull();expect(reads).toBe(1);
});
test('403 protegido mostra falha sem limpar sessão nem renovar token',async({page,context})=>{
 const s=await domain(context);
 await context.route('**/api/votos?*',route=>route.fulfill({status:403,json:{errors:['Sem permissão']}}));
 await page.goto(UI+'/#/votar');await expect(page.getByText('Não foi possível consultar os dados.',{exact:false})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('_application_user')).id)).toBe(f.user.id);
 expect(s.requests.filter(r=>r.path==='/oapi/login')).toHaveLength(0);
});
test('admin sem vínculos restaura sessão e usa assembleia da API',async({page,context})=>{
 const {codigoCredor,codigoAssembleia,...admin}=f.admin;
 await domain(context,{user:admin});await page.goto(UI+'/#/votar');
 await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();await expect(page.getByTestId('assembly')).toHaveText('Assembleia 6');
});
test('comum em deep link de links não recebe controles administrativos',async({page,context})=>{
 await domain(context,{links:[{_id:'link-fixture',descricao:'Link sintético',url:'https://example.invalid'}]});
 await page.goto(UI+'/#/links');await expect(page.getByText('Link sintético',{exact:true})).toBeVisible();
 for(const name of ['Salvar','Editar','Excluir'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(0);
});
