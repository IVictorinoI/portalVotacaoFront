const { test, expect, f } = require('../support/baseline.cjs');
const writes = (s, path) => s.requests.filter(x => x.path === path && x.method !== 'OPTIONS' && x.method !== 'GET');
// Evidencias de falhas/ambiguidades originais, nao criterios da candidata.

test('diagnostico original: primeiro login nao cria socket antes de setUser', async ({ page, baseline: s }) => {
  await s.open('', null);
  await page.getByPlaceholder('Login', { exact: true }).fill('fixture');
  await page.getByPlaceholder('Senha', { exact: true }).fill('senha-falsa');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  // O reducer persiste antes de falhar. O catch da action recarrega e restaura a sessão.
  await expect.poll(() => writes(s, '/oapi/login').length).toBe(1);
  await expect.poll(() => s.requests.filter(x => x.path === '/oapi/validateToken').length).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('_application_user'))?.id)).toBe(f.user.id);
});

test('diagnostico D2: credor proprio ainda e consultado como procurador', async ({ page, baseline: s }) => {
  s.user = structuredClone(f.proprio); await s.open('confirmarPresenca');
  await expect.poll(() => s.requests.filter(x => x.path === '/api/credores').length).toBe(1);
  expect(s.requests.find(x => x.path === '/api/credores').query.codigoProcurador).toBe('101');
  await expect(page.locator('tbody tr')).toHaveCount(0);
  expect(s.errors).toEqual([]);
});

test('diagnostico D3: Me/Epp conta registro nao aprovado enquanto outras classes nao', async ({ page, baseline: s }) => {
  s.atas = [1,4].map(codigoClasse => ({ _id: 'ata-' + codigoClasse, codigoClasse,
    descricaoClasse: codigoClasse === 4 ? 'Me/Epp' : 'Trabalhistas', nomeCredor: 'Signatario ' + codigoClasse,
    nomeProcurador: 'Procurador Fixture', aprovou: false, data: '2026-10-18T10:12:34.000Z' }));
  await s.open('aprovaAta');
  const cards = page.locator('.box-botoes-aprovacao .small-box');
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0).locator('h3')).toHaveText('0');
  await expect(cards.nth(3).locator('h3')).toHaveText('1');
  expect(s.errors).toEqual([]);
});

test('diagnostico M1: dois cliques antes da resposta geram duas escritas', async ({ page, baseline: s }) => {
  s.delayPresence = 250; await s.open('confirmarPresenca');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.locator('tbody tr button').first().evaluate(button => { button.click(); button.click(); });
  await expect.poll(() => writes(s, '/api/votos/confirmar').length).toBe(2);
  expect(writes(s, '/api/votos/confirmar').map(x => x.body._id)).toEqual(['credor-0', 'credor-0']);
  // Evidência diagnóstica: não requisito de entrega da candidata, sem corrigir original.
});
