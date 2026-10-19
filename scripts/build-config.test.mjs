import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const script = fileURLToPath(
  new URL('./validate-build-config.mjs', import.meta.url),
);
function run(values) {
  const env = {
    ...process.env,
    VITE_API_BASE_URL: '',
    VITE_OAPI_BASE_URL: '',
    VITE_SOCKET_URL: '',
    ...values,
  };
  return spawnSync(process.execPath, [script], { env, encoding: 'utf8' });
}
test('hook Heroku rejeita configuração ausente sem fallback de produção', () => {
  const result = run({});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Configure VITE_API_BASE_URL/);
  assert.doesNotMatch(result.stdout, /herokuapp|portal\.gladius/);
});
test('hook aceita somente configuração pública sintética válida sem conexão remota', () => {
  const result = run({
    VITE_API_BASE_URL: 'http://127.0.0.1:19300/api',
    VITE_OAPI_BASE_URL: 'http://127.0.0.1:19300/oapi',
    VITE_SOCKET_URL: 'http://127.0.0.1:19300/api/',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Configuração pública do build validada/);
});
