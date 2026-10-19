const {test,expect}=require('@playwright/test');
const {domain,UI,f}=require('./support.cjs');
const writes=s=>s.requests.filter(r=>r.path.startsWith('/api/links')&&r.method!=='GET');
const sample={_id:'l1',descricao:'Edital',url:'https://example.test/edital',__v:2,extra:'histórico'};
test('CRUD de links preserva POST _id null, PUT do documento e DELETE sem novo guard',async({page,context},info)=>{
 const s=await domain(context,{links:[structuredClone(sample)]});await page.goto(UI+'/#/links');await expect(page.getByRole('table',{name:'Links',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'https://example.test/edital',exact:true})).toHaveAttribute('target','_blank');
 await page.getByLabel('Descrição',{exact:true}).fill('Portal');await page.getByLabel('URL',{exact:true}).fill('https://example.test/portal');await page.getByRole('button',{name:'Salvar',exact:true}).click();await expect(page.getByRole('link',{name:'https://example.test/portal',exact:true})).toBeVisible();
 expect(writes(s)[0]).toMatchObject({method:'POST',path:'/api/links/',body:{_id:null,descricao:'Portal',url:'https://example.test/portal'}});
 await page.getByRole('row').filter({hasText:'Edital'}).getByRole('button',{name:'Editar',exact:true}).click();await page.getByLabel('Descrição',{exact:true}).fill('Edital 2');await page.getByRole('button',{name:'Salvar',exact:true}).click();await expect(page.getByRole('cell',{name:'Edital 2',exact:true})).toBeVisible();
 expect(writes(s)[1]).toMatchObject({method:'PUT',path:'/api/links/l1',body:{_id:'l1',descricao:'Edital 2',url:'https://example.test/edital',__v:2,extra:'histórico'}});
 await page.getByRole('row').filter({hasText:'Portal'}).getByRole('button',{name:'Excluir',exact:true}).click();await expect(page.getByRole('link',{name:'https://example.test/portal',exact:true})).toHaveCount(0);
 expect(writes(s)[2]).toMatchObject({method:'DELETE',path:'/api/links/novo-link'});expect(s.requests.find(r=>r.path==='/api/links').query).toEqual({sort:'-_id'});await page.screenshot({path:info.outputPath('links.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(s.unexpected).toEqual([]);
});
test('falha de link mantém rascunho, trava clique duplo e reconsulta sem repetir escrita',async({page,context})=>{
 const s=await domain(context,{failLink:true,delay:70});await page.goto(UI+'/#/links');await expect(page.getByRole('heading',{name:'Links',exact:true})).toBeVisible();
 await page.getByLabel('Descrição',{exact:true}).fill('Rascunho');await page.getByLabel('URL',{exact:true}).fill('https://example.test/rascunho');await page.getByRole('button',{name:'Salvar',exact:true}).evaluate(button=>{button.click();button.click();});
 await expect(page.getByText('Link recusado no teste',{exact:true})).toBeVisible();await expect(page.getByLabel('Descrição',{exact:true})).toHaveValue('Rascunho');expect(writes(s)).toHaveLength(1);await expect.poll(()=>s.requests.filter(r=>r.path==='/api/links'&&r.method==='GET').length).toBe(2);expect(writes(s)).toHaveLength(1);expect(s.unexpected).toEqual([]);
});
test('links úteis são somente leitura e compartilham o GET original',async({page,context})=>{
 const s=await domain(context,{links:[structuredClone(sample)]});await page.goto(UI+'/#/links-uteis');await expect(page.getByRole('table',{name:'Links úteis',exact:true}).getByRole('row').filter({hasText:'Edital'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Salvar',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Editar',exact:true})).toHaveCount(0);expect(s.requests.find(r=>r.path==='/api/links').query).toEqual({sort:'-_id'});expect(s.unexpected).toEqual([]);
});
test('assembleias, classes e contato preservam rotas ocultas, regex e texto',async({page,context},info)=>{
 const s=await domain(context,{assemblies:[{_id:'a1',descricao:'AGC Sintética',assunto:'Plano',data:'2026-10-18',ativo:true},{_id:'a2',descricao:'Outra',assunto:'Extra',data:'2026-10-19',ativo:false}],classes:[{_id:'c1',descricao:'Trabalhista',tipo:'P'},{_id:'c2',descricao:'Quirografário',tipo:'U'}]});
 await page.goto(UI+'/#/assembleias');await expect(page.getByRole('table',{name:'Assembleias',exact:true}).locator('tbody tr')).toHaveCount(2);expect(s.requests.find(r=>r.path==='/api/assembleias').query).toEqual({param:'true',sort:'-ativo'});
 await page.getByLabel('Pesquise a assembléia',{exact:true}).fill('AGC');await page.getByLabel('Pesquise a assembléia',{exact:true}).press('Enter');await expect(page.locator('tbody tr')).toHaveCount(1);expect(s.requests.findLast(r=>r.path==='/api/assembleias').query).toEqual({param:'true',sort:'-ativo',descricao__regex:'/AGC/'});
 await page.evaluate(()=>{location.hash='#/classes';});await expect(page.getByRole('cell',{name:'Percentual',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'Unitário',exact:true})).toBeVisible();expect(s.requests.find(r=>r.path==='/api/classes').query).toEqual({sort:'-_id'});
 await page.evaluate(()=>{location.hash='#/Contato';});await expect(page.getByRole('heading',{name:'Contato',exact:true})).toBeVisible();await expect(page.getByRole('img',{name:'Votação gladius',exact:true})).toBeVisible();await expect(page.getByText('E-mail: atendimento@gladiusconsultoria.com.br',{exact:true})).toBeVisible();
 await page.evaluate(()=>{location.hash='#/contato';});await expect(page.getByRole('heading',{name:'Contato',exact:true})).toBeVisible();await page.screenshot({path:info.outputPath('contact.png'),fullPage:true});expect(s.unexpected).toEqual([]);
});
test('login legado usa GET com senha, setUser do documento e não herda outra identidade',async({page,context,request})=>{
 const secondary={_id:'sec-falso',nome:'Secretário Sintético',login:'legado',extra:9};const s=await domain(context,{legacyUsers:[secondary]});await request.delete('http://127.0.0.1:19300/__events');
 await page.goto(UI+'/#/login');await page.evaluate(()=>localStorage.setItem('usuarioLogado','{'));await page.reload();await expect(page.getByRole('heading',{name:'Login legado',exact:true})).toBeVisible();
 await page.getByLabel('Usuário',{exact:true}).fill('legado');await page.getByLabel('Senha',{exact:true}).fill('senha-falsa');await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page.getByRole('heading',{name:'Olá Secretário Sintético',exact:true})).toBeVisible();
 expect(s.requests.find(r=>r.path==='/api/usuarios').query).toEqual({sort:'-_id',login:'legado',senha:'senha-falsa'});await expect.poll(async()=>await(await request.get('http://127.0.0.1:19300/__events')).json()).toContainEqual({name:'setUser',data:secondary});
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('usuarioLogado')).extra)).toBe(9);expect(await page.evaluate(()=>localStorage.getItem('usuarioLogado:primaryOwner'))).toBe(f.user.id);
 await page.getByRole('button',{name:'Sair do login legado',exact:true}).click();await expect(page.getByLabel('Usuário',{exact:true})).toBeVisible();await expect(page.getByText(f.user.nome)).toBeVisible();
 await page.evaluate(doc=>{localStorage.setItem('usuarioLogado',JSON.stringify(doc));localStorage.setItem('usuarioLogado:primaryOwner','outra-pessoa');},secondary);await page.reload();await expect(page.getByLabel('Usuário',{exact:true})).toBeVisible();
 await page.getByLabel('Usuário',{exact:true}).fill('legado');await page.getByLabel('Senha',{exact:true}).fill('errada');s.legacyUsers=[];await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page.getByText('Usuário/senha inválidos',{exact:true})).toBeVisible();expect(s.unexpected).toEqual([]);
});
