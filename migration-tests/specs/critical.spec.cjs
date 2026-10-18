const { test, expect, f } = require('../support/baseline.cjs');
const writes = (s, path) => s.requests.filter(x => x.path === path && x.method !== 'OPTIONS' && x.method !== 'GET');

test('sessao restaurada: token direto, namespace e deep link', async ({ page, baseline: s }) => {
  await s.open('confirmarPresenca');
  await expect(page.getByRole('button', { name: 'Confirmar todos', exact: true })).toBeVisible();
  await expect.poll(() => s.requests.filter(x => x.path === '/oapi/validateToken').length).toBe(1);
  expect(s.requests.find(x => x.path === '/oapi/validateToken').body).toEqual({ token: f.user.token });
  const get = s.requests.find(x => x.path === '/api/credores');
  expect(get.auth).toBe(f.user.token);
  expect(get.query).toEqual({ codigoAssembleia: '5', sort: '-_id', confirmouPresenca__ne: 'true', apenasProcurador__ne: 'true', codigoProcurador: '90' });
  expect(await page.evaluate(() => window.__socket.url)).toBe('https://gladius-portalvotacao-back.herokuapp.com/api/');
  await page.evaluate(() => window.__socket.receive('getUser', {}));
  expect(await page.evaluate(() => window.__events)).toContainEqual({ name: 'setUser', data: f.user });
  expect(s.errors).toEqual([]);
});

test('login invalido exibe errors[] e mantem formulario', async ({ page, baseline: s }) => {
  s.loginError = true; await s.open('', null);
  await page.getByPlaceholder('Login', { exact: true }).fill('fixture');
  await page.getByPlaceholder('Senha', { exact: true }).fill('senha-falsa');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Login sintetico invalido', { exact: true })).toBeVisible();
  expect(writes(s, '/oapi/login')[0].body).toEqual({ login: 'fixture', senha: 'senha-falsa' });
  expect(s.errors).toEqual([]);
});



test('presenca individual e pesquisa por Enter preservam contrato', async ({ page, baseline: s }) => {
  await s.open('confirmarPresenca');
  await page.getByPlaceholder('Pesquise o credor').fill('Ana');
  await page.getByPlaceholder('Pesquise o credor').press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.locator('tbody tr').getByRole('button').click();
  await expect.poll(() => writes(s, '/api/votos/confirmar').length).toBe(1);
  expect(writes(s, '/api/votos/confirmar')[0].body).toEqual({ _id: 'credor-0' });
  await expect(page.locator('tbody tr')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__events.map(x => x.name))).toContain('confirmouPresenca');
  expect(s.errors).toEqual([]);
});

test('todos: lote sequencial para no erro e nao envia restante', async ({ page, baseline: s }) => {
  s.failPresence = 'credor-1'; await s.open('confirmarPresenca');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'Confirmar todos', exact: true }).click();
  await expect(page.getByText('Presenca recusada no teste', { exact: true })).toBeVisible();
  expect(writes(s, '/api/votos/confirmar').map(x => x.body)).toEqual([{ _id: 'credor-0' }, { _id: 'credor-1' }]);
  await expect(page.locator('tbody tr')).toHaveCount(2);
  expect(s.errors).toEqual([]);
});

for (const [tipo, label] of [['S','Sim'], ['N','Não'], ['A','Abstenção']]) {
  test('voto individual ' + tipo + ': payload e evento apos sucesso', async ({ page, baseline: s }) => {
    s.votos = [f.vote(s.credores[0])]; await s.open('votar');
    await page.locator('tbody tr').getByRole('button', { name: label, exact: true }).click();
    await expect.poll(() => writes(s, '/api/votos/votar').length).toBe(1);
    expect(writes(s, '/api/votos/votar')[0].body).toEqual({ _id: 'voto-credor-0', tipo });
    await expect(page.locator('tbody tr button')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.__events.map(x => x.name))).toContain('votou');
    expect(s.errors).toEqual([]);
  });
}

test('votos: todos usa apenas pendentes e para no erro', async ({ page, baseline: s }) => {
  s.votos = s.credores.map(f.vote); s.votos[0].tipo = 'N'; s.failVote = s.votos[1]._id;
  await s.open('votar');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'Sim para todos', exact: true }).click();
  await expect(page.getByText('Voto recusado no teste', { exact: true })).toBeVisible();
  expect(writes(s, '/api/votos/votar').map(x => x.body)).toEqual([{ _id: 'voto-credor-1', tipo: 'S' }]);
  expect(s.errors).toEqual([]);
});

test('resultado: classes e precisao de seis casas do original', async ({ page, baseline: s }) => {
  await s.open('resultado');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await expect(page.locator('tbody tr').first()).toContainText('66,666666%');
  await expect(page.locator('tbody tr').first()).toContainText('Classe 1');
  expect(s.requests.find(x => x.path === '/api/resultados').query).toEqual({ codigoAssembleia: '5', sort: 'codigoClasse' });
  expect(s.errors).toEqual([]);
});

test('resultado V: subtotal e total geral sem tabela', async ({ page, baseline: s }) => {
  s.resultado.forEach(x => x.tipoResultado = 'V'); await s.open('resultado');
  await expect(page.getByText('Total geral', { exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(0);
  await expect(page.getByText('R$ 1.000,00', { exact: true })).toBeVisible();
  expect(s.errors).toEqual([]);
});

test('ata: assinatura sem corpo, janela e refresh via evento', async ({ page, baseline: s }) => {
  await s.open('aprovaAta');
  const button = page.getByRole('button', { name: 'Assinar ata', exact: true });
  await expect(button).toBeEnabled(); await button.click();
  await expect.poll(() => writes(s, '/api/aprovaAtas/aprovar').length).toBe(1);
  expect(writes(s, '/api/aprovaAtas/aprovar')[0].body).toBeNull();
  await expect.poll(() => page.evaluate(() => window.__events.map(x => x.name))).toContain('aprovarata');
  const before = s.requests.filter(x => x.path === '/api/aprovaAtas').length;
  await page.evaluate(() => window.__socket.receive('aprovouata'));
  await expect.poll(() => s.requests.filter(x => x.path === '/api/aprovaAtas').length).toBe(before + 1);
  expect(s.errors).toEqual([]);
});

test('fluxo integrado simulado: presenca -> voto -> resultado -> ata', async ({ page, baseline: s }) => {
  await s.open('confirmarPresenca');
  await page.locator('tbody tr').first().getByRole('button').click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.evaluate(() => location.hash = '#/votar');
  await page.locator('tbody tr').getByRole('button', { name: 'Sim', exact: true }).click();
  await expect(page.locator('tbody tr button')).toHaveCount(0);
  await page.evaluate(() => location.hash = '#/resultado');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.evaluate(() => location.hash = '#/aprovaAta');
  await page.getByRole('button', { name: 'Assinar ata', exact: true }).click();
  await expect.poll(() => writes(s, '/api/aprovaAtas/aprovar').length).toBe(1);
  expect(s.errors).toEqual([]);
});

test('admin: consulta de presenca nao acrescenta codigoProcurador', async ({ page, baseline: s }) => {
  s.user = structuredClone(f.admin); await s.open('confirmarPresenca');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  expect(s.requests.find(x => x.path === '/api/credores').query.codigoProcurador).toBeUndefined();
  expect(s.errors).toEqual([]);
});



test('todos confirma apenas subconjunto pesquisado', async ({ page, baseline: s }) => {
  await s.open('confirmarPresenca');
  await page.getByPlaceholder('Pesquise o credor').fill('Ana');
  await page.getByPlaceholder('Pesquise o credor').press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Confirmar todos', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(0);
  expect(writes(s, '/api/votos/confirmar').map(x => x.body._id)).toEqual(['credor-0']);
  expect(s.errors).toEqual([]);
});

test('janelas fechadas desabilitam presenca voto e assinatura', async ({ page, baseline: s }) => {
  Object.assign(s.assembleia, { podeConfirmar: false, podeVotar: false, podeAta: false });
  s.votos = [f.vote(s.credores[0])]; await s.open('confirmarPresenca');
  await expect(page.locator('tbody tr').first().getByRole('button')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Confirmar todos', exact: true })).toBeDisabled();
  await page.evaluate(() => location.hash = '#/votar');
  await expect(page.locator('tbody tr').getByRole('button', { name: 'Sim', exact: true })).toBeDisabled();
  await page.evaluate(() => location.hash = '#/aprovaAta');
  await expect(page.getByRole('button', { name: 'Assinar ata', exact: true })).toBeDisabled();
  expect(s.requests.filter(x => ['POST','PUT'].includes(x.method) && x.path.startsWith('/api/'))).toEqual([]);
  expect(s.errors).toEqual([]);
});





test('segunda assembleia: query usa escopo restaurado sem misturar fixture anterior', async ({ page, baseline: s }) => {
  s.user.codigoAssembleia = 6; s.assembleia = structuredClone(f.outraAssembleia);
  s.credores.push({ ...s.credores[0], _id: 'credor-outra', nome: 'Outro Fixture', codigoAssembleia: 6 });
  await s.open('confirmarPresenca');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Outro Fixture');
  expect(s.requests.find(x => x.path === '/api/credores').query.codigoAssembleia).toBe('6');
  expect(s.errors).toEqual([]);
});


test('token restaurado invalido remove sessao e volta ao login', async ({ page, baseline: s }) => {
  s.validToken = false; await s.open('votar');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('_application_user'))).toBeNull();
  expect(s.requests.filter(x => x.path === '/oapi/validateToken')).toHaveLength(1);
  expect(s.requests.filter(x => x.path.startsWith('/api/'))).toEqual([]);
  expect(s.errors).toEqual([]);
});
