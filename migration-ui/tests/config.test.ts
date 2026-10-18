import { describe, it, expect } from 'vitest';
import { readConfig, ConfigurationError } from '../src/lib/config';
const env = {
  VITE_API_BASE_URL: 'http://127.0.0.1:19300/api/',
  VITE_OAPI_BASE_URL: 'http://127.0.0.1:19300/oapi',
  VITE_SOCKET_URL: 'http://127.0.0.1:19300/api/',
};
describe('configuração pública sem fallback', () => {
  it('preserva URL e barras fornecidas', () => {
    expect(readConfig(env).apiBaseUrl).toBe(env.VITE_API_BASE_URL);
  });
  it.each(['VITE_API_BASE_URL', 'VITE_OAPI_BASE_URL', 'VITE_SOCKET_URL'])(
    'recusa ausência de %s',
    (key) => {
      expect(() => readConfig({ ...env, [key]: undefined })).toThrow(
        ConfigurationError,
      );
    },
  );
  it.each([
    'https://usuario:senha@example.invalid/api',
    '/api',
    'javascript:alert(1)',
    'https://example.invalid/outro',
    'https://example.invalid/api?token=x',
    'https://example.invalid/api#x',
  ])('recusa configuração inválida %s', (value) => {
    expect(() => readConfig({ ...env, VITE_API_BASE_URL: value })).toThrow(
      ConfigurationError,
    );
  });
});
