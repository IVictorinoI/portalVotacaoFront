import { it, expect, vi } from 'vitest';
import {
  AxiosHeaders,
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createApiClients, errorMessages } from '../src/lib/http';
const config = {
  apiBaseUrl: 'http://127.0.0.1:19300/api/',
  oapiBaseUrl: 'http://127.0.0.1:19300/oapi',
  socketUrl: 'http://127.0.0.1:19300/api/',
};
it('preserva token direto, barras/query/payload e l? identidade no envio', async () => {
  let token: string | null = 'token-falso-A';
  const requests: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (request) => {
    requests.push(request);
    return {
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: request,
      data: { Ok: true },
    };
  };
  const clients = createApiClients(config, () => token, adapter);
  const response = await clients.api.post(
    '/votos/confirmar?nome__regex=/Ana/',
    { _id: null, omitido: undefined, tipo: '' },
  );
  expect(response.status).toBe(200);
  expect(response.data).toEqual({ Ok: true });
  expect(requests[0]?.url).toBe(
    'http://127.0.0.1:19300/api/votos/confirmar?nome__regex=/Ana/',
  );
  expect(requests[0]?.headers.get('authorization')).toBe(
    'Bearer token-falso-A',
  );
  expect(JSON.parse(String(requests[0]?.data))).toEqual({
    _id: null,
    tipo: '',
  });
  token = 'token-falso-B';
  await clients.api.put('/votos/votar', { _id: 'voto-falso', tipo: 'A' });
  expect(requests[1]?.headers.get('authorization')).toBe(
    'Bearer token-falso-B',
  );
  token = null;
  await clients.api.get('/credores');
  expect(requests[2]?.headers.has('authorization')).toBe(false);
  token = 'token-falso-C';
  await clients.oapi.post('/login', { login: 'fixture', senha: 'falsa' });
  expect(requests[3]?.headers.has('authorization')).toBe(false);
});
it('não repete falha de escrita nem converte status/resposta', async () => {
  let count = 0;
  const failure = {
    response: { status: 403, data: { errors: ['Não autorizado'] } },
  };
  const clients = createApiClients(
    config,
    () => null,
    async () => {
      count++;
      throw failure;
    },
  );
  await expect(clients.api.post('/aprovaAtas/aprovar')).rejects.toBe(failure);
  expect(count).toBe(1);
  expect(errorMessages(failure)).toEqual(['Não autorizado']);
});
it('mapeia errors[] sem exigir response em erro de rede', () => {
  expect(
    errorMessages({ response: { data: { errors: ['Primeiro', 'Segundo'] } } }),
  ).toEqual(['Primeiro', 'Segundo']);
  for (const value of [
    undefined,
    null,
    new Error('Network'),
    { response: {} },
    { response: { data: { errors: [1] } } },
  ])
    expect(errorMessages(value)).toEqual([
      'Não foi possível concluir a solicitação.',
    ]);
});

it('401 atual encerra sessao; 403 e 401 antigo nao encerram nova identidade nem repetem escrita', async () => {
  let token = 'atual';
  let status = 401;
  const ended = vi.fn();
  let finish: (() => void) | undefined;
  const clients = createApiClients(
    config,
    () => token,
    async (request) => {
      if (finish === undefined)
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      throw new AxiosError('negado', 'ERR_BAD_REQUEST', request, undefined, {
        status,
        statusText: 'Denied',
        headers: new AxiosHeaders(),
        config: request,
        data: { errors: ['Negado'] },
      });
    },
    ended,
  );
  const stale = clients.api.post('/teste').catch((e) => e);
  await vi.waitFor(() => expect(finish).toBeDefined());
  token = 'nova';
  finish!();
  await stale;
  expect(ended).not.toHaveBeenCalled();
  status = 403;
  await clients.api.post('/teste').catch(() => {});
  expect(ended).not.toHaveBeenCalled();
  status = 401;
  await clients.api.post('/teste').catch(() => {});
  expect(ended).toHaveBeenCalledOnce();
});

it('junção base/caminho usa uma barra sem alterar barras em query ou URL absoluta', async () => {
  const seen: string[] = [];
  for (const base of [
    'http://fixture.invalid/api',
    'http://fixture.invalid/api/',
  ]) {
    const api = createApiClients(
      { ...config, apiBaseUrl: base },
      () => null,
      async (request) => {
        seen.push(request.url!);
        return {
          status: 200,
          statusText: 'OK',
          headers: new AxiosHeaders(),
          config: request,
          data: [],
        };
      },
    ).api;
    for (const route of [
      '/assembleias/?ativo=true',
      '//assembleias/?ativo=true',
      'assembleias/?ativo=true',
    ])
      await api.get(route);
    await api.get('//links/?url=https://example.invalid/a//b');
  }
  expect(seen.filter((url) => url.endsWith('ativo=true'))).toEqual(
    Array(6).fill('http://fixture.invalid/api/assembleias/?ativo=true'),
  );
  expect(seen.filter((url) => url.includes('example.invalid'))).toEqual(
    Array(2).fill(
      'http://fixture.invalid/api/links/?url=https://example.invalid/a//b',
    ),
  );
});
