export interface AppConfig {
  apiBaseUrl: string;
  oapiBaseUrl: string;
  socketUrl: string;
}
export class ConfigurationError extends Error {}
function endpoint(value: unknown, key: string, suffix: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new ConfigurationError('Configure ' + key + '.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigurationError(key + ' deve ser uma URL absoluta.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname.replace(/\/$/, '') !== suffix
  )
    throw new ConfigurationError(
      key +
        ' deve apontar para ' +
        suffix +
        ', sem credenciais, query ou fragmento.',
    );
  return value; // Não normalizar barras/URL do contrato fornecido.
}
export function readConfig(env: Record<string, unknown>): AppConfig {
  return {
    apiBaseUrl: endpoint(env.VITE_API_BASE_URL, 'VITE_API_BASE_URL', '/api'),
    oapiBaseUrl: endpoint(
      env.VITE_OAPI_BASE_URL,
      'VITE_OAPI_BASE_URL',
      '/oapi',
    ),
    socketUrl: endpoint(env.VITE_SOCKET_URL, 'VITE_SOCKET_URL', '/api'),
  };
}
