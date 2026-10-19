import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
test(
  'entrada produtiva serve somente dist com NODE_ENV=production',
  { timeout: 15000 },
  async () => {
    const reserve = createServer();
    await new Promise((resolve) => reserve.listen(0, '127.0.0.1', resolve));
    const port = reserve.address().port;
    await new Promise((resolve) => reserve.close(resolve));
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL('./serve-dist.mjs', import.meta.url))],
      {
        env: {
          ...process.env,
          NODE_ENV: 'production',
          HOST: '127.0.0.1',
          PORT: String(port),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let output = '';
    const ready = new Promise((resolve, reject) => {
      child.stdout.on('data', (data) => {
        output += data;
        if (output.includes('Frontend dist pronto')) resolve();
      });
      child.stderr.on('data', (data) => {
        output += data;
      });
      child.on('error', reject);
      child.on('exit', (code) =>
        reject(
          new Error(
            'Servidor encerrou antes do smoke (' + code + '): ' + output,
          ),
        ),
      );
    });
    try {
      await ready;
      const base = 'http://127.0.0.1:' + port;
      const response = await fetch(base + '/#/votar');
      assert.equal(response.status, 200);
      assert.match(await response.text(), /<html/);
      for (const resource of [
        '/src/main.tsx',
        '/package.json',
        '/.env',
        '/migration-tests/candidate-server.cjs',
      ])
        assert.equal((await fetch(base + resource)).status, 404, resource);
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        child.kill('SIGTERM');
        await exited;
      }
    }
  },
);
