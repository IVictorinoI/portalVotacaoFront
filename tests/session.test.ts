import { afterEach, expect, it, vi } from 'vitest';
import {
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createQueryClient } from '../src/lib/query';
import { createApiClients } from '../src/lib/http';
import {
  SessionController,
  readUser,
  USER_KEY,
  ASSEMBLY_KEY,
  type User,
} from '../src/auth/session-controller';
import { consultationMenu, hashRoute, routes } from '../src/navigation/routes';
import type { createSocket } from '../src/lib/socket';
const user: User = {
  id: 'fixture-A',
  nome: 'Sintético',
  login: 'fixture',
  tipo: 0,
  codigo: 9,
  codigoCredor: 9,
  codigoAssembleia: 5,
  token: 'token-sintetico',
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function harness(
  handler: (
    request: InternalAxiosRequestConfig,
  ) => unknown | Promise<unknown> = (req) =>
    req.url?.endsWith('/validateToken')
      ? { valid: true }
      : req.url?.endsWith('/login')
        ? user
        : [{ codigo: 6 }],
) {
  const data = new Map([
    [USER_KEY, JSON.stringify(user)],
    [ASSEMBLY_KEY, '88'],
  ]);
  const requests: InternalAxiosRequestConfig[] = [];
  const sockets: {
    listeners: Map<string, (...args: unknown[]) => void>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  }[] = [];
  const adapter: AxiosAdapter = async (config) => {
    requests.push(config);
    return {
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config,
      data: await handler(config),
    };
  };
  const cache = createQueryClient();
  const redirect = vi.fn();
  const alert = vi.fn();
  const notify = vi.fn();
  let session: SessionController;
  session = new SessionController({
    http: createApiClients(
      {
        apiBaseUrl: 'http://fixture.invalid/api',
        oapiBaseUrl: 'http://fixture.invalid/oapi',
        socketUrl: 'http://fixture.invalid/api/',
      },
      () => session.token,
      adapter,
    ),
    cache,
    storage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => {
        data.set(key, value);
      },
      removeItem: (key) => {
        data.delete(key);
      },
    },
    newSocket: () => {
      const socket = {
        listeners: new Map<string, (...args: unknown[]) => void>(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        emit: vi.fn(),
      };
      sockets.push(socket);
      return {
        ...socket,
        on: (event: string, listener: (...args: unknown[]) => void) => {
          socket.listeners.set(event, listener);
          return () => {
            socket.listeners.delete(event);
          };
        },
      } as ReturnType<typeof createSocket>;
    },
    redirect,
    alert,
    notify,
  });
  return { session, data, requests, sockets, cache, redirect, alert, notify };
}
afterEach(() => {
  vi.useRealTimers();
});
it('falha tardia de login antigo não dispara erro/reload na identidade nova', async () => {
  const pending = deferred<unknown>();
  const h = harness(() =>
    pending.promise.then(() => {
      throw new Error('falha antiga');
    }),
  );
  const login = h.session.login({ login: 'fixture', senha: 'falsa' });
  await vi.waitFor(() => expect(h.requests).toHaveLength(1));
  h.session.logout();
  pending.resolve(null);
  await expect(login).resolves.toBeUndefined();
  expect(h.session.state.status).toBe('anonymous');
});
it('não consulta protegido nem conecta antes de validar; API prevalece sobre usuário/storage', async () => {
  const validation = deferred<unknown>();
  const h = harness((req) =>
    req.url?.endsWith('/validateToken') ? validation.promise : [{ codigo: 6 }],
  );
  const pending = h.session.restore();
  await vi.waitFor(() => expect(h.requests).toHaveLength(1));
  expect(h.requests[0]?.headers.has('authorization')).toBe(false);
  expect(JSON.parse(String(h.requests[0]?.data))).toEqual({
    token: user.token,
  });
  expect(h.sockets).toHaveLength(0);
  validation.resolve({ valid: true });
  await pending;
  expect(h.session.state).toMatchObject({ status: 'ready', assembly: 6 });
  expect(h.requests[1]?.url).toBe(
    'http://fixture.invalid/api//assembleias/?ativo=true',
  );
  expect(h.requests[1]?.headers.get('authorization')).toBe(
    'Bearer ' + user.token,
  );
  expect(h.data.get(ASSEMBLY_KEY)).toBe('6');
  h.session.dispose();
});
it('storage inválido, token inválido e erro de validação terminam sem socket ou consultas protegidas', async () => {
  for (const mode of ['storage', 'invalid', 'network']) {
    const h = harness(() => {
      if (mode === 'network') throw new Error('network');
      return { valid: false };
    });
    if (mode === 'storage') h.data.set(USER_KEY, '{broken');
    await h.session.restore();
    expect(h.session.state.status).toBe('anonymous');
    expect(h.requests).toHaveLength(mode === 'storage' ? 0 : 1);
    expect(h.sockets).toHaveLength(0);
    expect(h.data.has(USER_KEY)).toBe(false);
    h.session.dispose();
  }
});
it('sem ativo não usa escopo antigo e recuperação explícita resolve pela API', async () => {
  let active: unknown[] = [];
  const h = harness((req) =>
    req.url?.endsWith('/validateToken') ? { valid: true } : active,
  );
  await h.session.restore();
  expect(h.session.state.status).toBe('scope-error');
  expect(h.data.has(ASSEMBLY_KEY)).toBe(false);
  expect(h.session.token).toBeNull();
  expect(h.sockets).toHaveLength(0);
  active = [{ codigo: 7 }];
  await h.session.retryScope();
  expect(h.session.state).toMatchObject({ status: 'ready', assembly: 7 });
  h.session.dispose();
});
it('logout invalida resposta tardia, cache, token, listeners e único heartbeat', async () => {
  vi.useFakeTimers();
  const h = harness();
  await h.session.restore();
  h.cache.setQueryData(['segredo', user.id, 6], { private: true });
  const socket = h.sockets[0]!;
  socket.listeners.get('getUser')?.();
  expect(socket.emit).toHaveBeenCalledWith('setUser');
  await vi.advanceTimersByTimeAsync(60_000);
  expect(
    h.requests.filter((req) => req.url?.endsWith('/logsAcessos/register')),
  ).toHaveLength(2);
  expect(h.requests.at(-1)?.data).toBeUndefined();
  h.session.logout();
  expect(h.cache.getQueryCache().getAll()).toHaveLength(0);
  expect(socket.disconnect).toHaveBeenCalledOnce();
  expect(socket.listeners.size).toBe(0);
  expect(h.session.token).toBeNull();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(
    h.requests.filter((req) => req.url?.endsWith('/logsAcessos/register')),
  ).toHaveLength(2);
  const scope = deferred<unknown>();
  const other = harness((req) =>
    req.url?.endsWith('/login') ? user : scope.promise,
  );
  const login = other.session.login({ login: 'fixture', senha: 'sintética' });
  await vi.advanceTimersByTimeAsync(0);
  other.session.logout();
  scope.resolve([{ codigo: 77 }]);
  await login;
  expect(other.session.state.status).toBe('anonymous');
  expect(other.sockets).toHaveLength(0);
});
it('troca de escopo/identidade limpa cache e substitui conexão sem multiplicar efeitos', async () => {
  const h = harness();
  await h.session.restore();
  h.cache.setQueryData(['dados', user.id, 6], ['A']);
  await h.session.retryScope();
  expect(h.sockets).toHaveLength(2);
  expect(h.sockets[0]?.disconnect).toHaveBeenCalledOnce();
  expect(h.cache.getQueryCache().getAll()).toHaveLength(0);
  h.session.logout();
  h.data.set(USER_KEY, JSON.stringify({ ...user, id: 'fixture-B' }));
  await h.session.restore();
  expect(h.session.state).toMatchObject({
    status: 'ready',
    user: { id: 'fixture-B' },
  });
  h.session.dispose();
});
it('expulsões são filtradas por identidade e removem sessão; notificações respeitam tipo', async () => {
  const h = harness();
  await h.session.restore();
  const socket = h.sockets[0]!;
  socket.listeners.get('confirmacaoPresenca')?.({ nome: 'Ana' });
  expect(h.notify).not.toHaveBeenCalled();
  socket.listeners.get('usuarioOnline')?.({ id: 'outra', nome: 'Ana' });
  expect(h.notify).toHaveBeenCalledWith('Ana acabou de entrar.');
  socket.listeners.get('expulsarId')?.('outra');
  expect(h.redirect).not.toHaveBeenCalled();
  socket.listeners.get('expulsarId')?.(user.id);
  expect(h.redirect).toHaveBeenCalledOnce();
  expect(h.data.has(USER_KEY)).toBe(false);
  const all = harness();
  await all.session.restore();
  all.sockets[0]?.listeners.get('expulsar')?.();
  expect(all.redirect).toHaveBeenCalledOnce();
  const drop = harness();
  await drop.session.restore();
  drop.sockets[0]?.listeners.get('derrubar')?.({ id: user.id, message: 'Fim' });
  expect(drop.alert).toHaveBeenCalledWith('Fim');
  expect(drop.session.state.status).toBe('anonymous');
});
it('preserva rotas ocultas/deep links e diferencia menus sem criar guards', () => {
  expect(consultationMenu(0)).toEqual(['/credores', '/votos']);
  expect(consultationMenu(1)).toContain('/online');
  for (const path of Object.keys(routes))
    expect(hashRoute('#' + path)).toBe(path);
  expect(hashRoute('#/inexistente')).toBe('/');
  expect(hashRoute('#/votar?x=1')).toBe('/votar');
});

const administrator = {
  id: 'admin-fixture',
  tipo: 1,
  nome: 'Admin',
  login: 'admin-fixture',
  codigo: 1,
  token: 'token-sintetico-admin',
};
it('login e restore aceitam administrador sem vinculos opcionais e preservam payload', async () => {
  const h = harness((req) =>
    req.url?.endsWith('/login')
      ? administrator
      : req.url?.endsWith('/validateToken')
        ? { valid: true }
        : [{ codigo: 6 }],
  );
  await h.session.login({ login: administrator.login, senha: 'sintetica' });
  expect(h.session.state).toMatchObject({
    status: 'ready',
    user: administrator,
    assembly: 6,
  });
  expect(JSON.parse(h.data.get(USER_KEY)!)).toEqual(administrator);
  expect(h.requests[1]?.headers.get('authorization')).toBe(
    'Bearer ' + administrator.token,
  );
  h.sockets[0]?.listeners.get('getUser')?.();
  expect(h.sockets[0]?.emit).toHaveBeenCalledWith('setUser');
  await h.session.restore();
  expect(h.session.state).toMatchObject({
    status: 'ready',
    user: administrator,
    assembly: 6,
  });
  h.session.dispose();
});
it('rejeita vinculos malformados e ausencia de vinculo em credor', () => {
  expect(readUser(administrator)).toEqual(administrator);
  for (const key of ['codigoCredor', 'codigoAssembleia'])
    for (const value of [null, '1', NaN, Infinity])
      expect(readUser({ ...administrator, [key]: value })).toBeNull();
  expect(readUser({ ...administrator, tipo: 0 })).toBeNull();
});

it('mais de uma assembleia ativa impede selecao arbitraria e nao conecta socket', async () => {
  const h = harness((req) =>
    req.url?.endsWith('/validateToken')
      ? { valid: true }
      : [{ codigo: 6 }, { codigo: 7 }],
  );
  await h.session.restore();
  expect(h.session.state.status).toBe('scope-error');
  expect(h.sockets).toHaveLength(0);
  expect(h.data.has(ASSEMBLY_KEY)).toBe(false);
  h.session.dispose();
});
it('revogacao via socket limpa sessao, cache, listeners e conexao; falha transitoria nao encerra', async () => {
  for (const mode of ['disconnect', 'unauthorized']) {
    const h = harness();
    await h.session.restore();
    h.cache.setQueryData(['privado'], true);
    h.sockets[0]?.listeners.get('connect_error')?.({ data: { status: 503 } });
    expect(h.session.state.status).toBe('ready');
    if (mode === 'disconnect')
      h.sockets[0]?.listeners.get('disconnect')?.('io server disconnect');
    else
      h.sockets[0]?.listeners.get('connect_error')?.({ data: { status: 401 } });
    expect(h.session.state.status).toBe('anonymous');
    expect(h.cache.getQueryCache().getAll()).toHaveLength(0);
    expect(h.data.has(USER_KEY)).toBe(false);
    expect(h.sockets[0]?.disconnect).toHaveBeenCalledOnce();
    h.session.dispose();
  }
});

it('evento de voto invalida apenas cache da identidade e assembleia atuais', async () => {
  const h = harness();
  await h.session.restore();
  if (h.session.state.status !== 'ready') throw new Error('sessao');
  const key = ['scope', user.id, 6, h.session.state.generation, 'votes'];
  const other = ['scope', 'outra', 6, 1, 'votes'];
  h.cache.setQueryData(key, []);
  h.cache.setQueryData(other, []);
  h.sockets[0]?.listeners.get('voto')?.({ _id: 'voto-sintetico' });
  expect(h.cache.getQueryState(key)?.isInvalidated).toBe(true);
  expect(h.cache.getQueryState(other)?.isInvalidated).toBe(false);
  h.session.dispose();
});
