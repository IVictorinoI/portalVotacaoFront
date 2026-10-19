import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createDistServer, runtimeAddress } from './serve-dist.mjs';
const server = await createDistServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
try {
  await test('Heroku usa PORT e bind público; ensaio sem PORT fica em loopback', () => {
    assert.deepEqual(runtimeAddress({}), { port: 18184, host: '127.0.0.1' });
    assert.deepEqual(runtimeAddress({ PORT: '19001' }), {
      port: 19001,
      host: '0.0.0.0',
    });
    assert.deepEqual(runtimeAddress({ PORT: '19001', HOST: '127.0.0.1' }), {
      port: 19001,
      host: '127.0.0.1',
    });
    for (const PORT of ['0', '65536', 'NaN', '-1', ''])
      assert.throws(() => runtimeAddress({ PORT }), /PORT inválida/);
  });
  await test('dist real: index/hash deep link, JS com MIME e cache próprio', async () => {
    const response = await fetch(base + '/#/votar');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(response.headers.get('cache-control'), 'no-cache');
    const html = await response.text();
    const source = html.match(/src="([^"]+\.js)"/)[1];
    const asset = await fetch(new URL(source, base + '/'));
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('content-type'), /javascript/);
    assert.match(asset.headers.get('cache-control'), /immutable/);
    assert.ok((await asset.text()).length > 0);
  });
  await test('não serve fonte, manifesto, configuração, diretórios ou fallback de API', async () => {
    for (const resource of [
      '/package.json',
      '/src/App.tsx',
      '/.env',
      '/scripts/serve-dist.mjs',
      '/assets/',
      '/api/votos',
      '/%2eenv',
      '/..%5cpackage.json',
    ])
      assert.equal((await fetch(base + resource)).status, 404, resource);
  });
  await test('HEAD preserva metadados sem corpo; escrita recebe 405', async () => {
    const head = await fetch(base + '/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.ok(Number(head.headers.get('content-length')) > 0);
    assert.equal(await head.text(), '');
    const post = await fetch(base + '/', { method: 'POST' });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get('allow'), 'GET, HEAD');
  });
  await test('falha sem build, sem servir raiz como fallback', async () => {
    await assert.rejects(() =>
      createDistServer(new URL('../src/', import.meta.url)),
    );
    const html = await readFile(
      new URL('../dist/index.html', import.meta.url),
      'utf8',
    );
    assert.ok(html.includes('<html'));
  });
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
