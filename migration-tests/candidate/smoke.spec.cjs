const { test, expect } = require('@playwright/test');
test('candidata: marca, deep link pendente e zero chamadas de negócio', async ({page,context},testInfo)=>{
 const external=[]; const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.routeWebSocket('**/*',s=>{external.push('socket');s.close();});
 await context.route('**/*',r=>{const req=r.request();if(new URL(req.url()).origin==='http://127.0.0.1:18182' && !['xhr','fetch'].includes(req.resourceType()))return r.continue();external.push(req.url());return r.abort();});
 await page.goto('http://127.0.0.1:18182/#/votar');
 await expect(page.getByRole('heading',{name:'Votar',exact:true})).toBeVisible();
 await expect(page.getByText('Esta versão está em preparação.',{exact:false})).toBeVisible();
 await expect(page.getByRole('img',{name:'Gladius'})).toBeVisible();
 expect(await page.getByRole('img',{name:'Gladius'}).evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
 await expect(page.getByRole('button')).toHaveCount(0);
 await page.screenshot({path:testInfo.outputPath('candidate.png'),fullPage:true});
 expect(external).toEqual([]);expect(errors).toEqual([]);
});
test('candidata: configuração ausente mostra erro sem fallback ou rede',async({page,context})=>{
 const external=[];
 await context.route('**/*',r=>{const req=r.request();if(new URL(req.url()).origin==='http://127.0.0.1:18183' && !['xhr','fetch'].includes(req.resourceType()))return r.continue();external.push(req.url());return r.abort();});
 await page.goto('http://127.0.0.1:18183/');
 await expect(page.getByRole('heading',{name:'Portal indisponível'})).toBeVisible();
 await expect(page.getByRole('alert')).toContainText('configuração');
 expect(external).toEqual([]);
});
