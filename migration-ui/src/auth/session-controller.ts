import type { QueryClient } from '@tanstack/react-query';
import type { ApiClients } from '../lib/http';
import type { createSocket, SocketUser } from '../lib/socket';

export const USER_KEY = '_application_user';
export const ASSEMBLY_KEY = 'codigoAssembleiaAtiva';
export interface User extends SocketUser {
  token: string;
  login: string;
  codigo: number;
  email?: string;
}
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export function readUser(value: unknown): User | null {
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    typeof value.nome !== 'string' ||
    typeof value.login !== 'string' ||
    typeof value.token !== 'string' ||
    !value.token ||
    !['tipo', 'codigo', 'codigoCredor', 'codigoAssembleia'].every(
      (key) => typeof value[key] === 'number' && Number.isFinite(value[key]),
    )
  )
    return null;
  return value as unknown as User;
}
export type SessionState =
  | { status: 'anonymous'; messages: string[] }
  | { status: 'checking' }
  | { status: 'scope-error'; user: User }
  | { status: 'ready'; user: User; assembly: number; generation: number };
interface Dependencies {
  http: ApiClients;
  cache: QueryClient;
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  newSocket: () => ReturnType<typeof createSocket>;
  redirect: () => void;
  alert: (message: string) => void;
  notify: (message: string) => void;
}
// Ownership of reads, cache, socket and scheduler follows one generation.
export class SessionController {
  socket: ReturnType<typeof createSocket> | null = null;
  get http() {
    return this.deps.http.api;
  }
  state: SessionState = { status: 'checking' };
  token: string | null = null;
  private generation = 0;
  private abort = new AbortController();
  private listeners = new Set<() => void>();
  private cleanups: (() => void)[] = [];
  constructor(private readonly deps: Dependencies) {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.state;
  private publish(state: SessionState) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }
  private store(action: () => void) {
    try {
      action();
    } catch {
      /* Memory session remains usable. */
    }
  }
  private reset() {
    this.generation++;
    this.abort.abort();
    this.abort = new AbortController();
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
    this.socket = null;
    void this.deps.cache.cancelQueries();
    this.deps.cache.clear();
    this.token = null;
    return this.generation;
  }
  dispose() {
    this.reset();
  }
  logout = () => {
    this.reset();
    this.store(() => this.deps.storage.removeItem(USER_KEY));
    this.store(() => this.deps.storage.removeItem(ASSEMBLY_KEY));
    this.store(() => this.deps.storage.removeItem('usuarioLogado'));
    this.store(() =>
      this.deps.storage.removeItem('usuarioLogado:primaryOwner'),
    );
    this.publish({ status: 'anonymous', messages: [] });
  };
  async restore() {
    const generation = this.reset();
    this.publish({ status: 'checking' });
    let user: User | null = null;
    try {
      user = readUser(
        JSON.parse(this.deps.storage.getItem(USER_KEY) ?? 'null'),
      );
    } catch {
      /* Invalid/unavailable storage. */
    }
    if (!user) {
      this.logout();
      return;
    }
    try {
      const response = await this.deps.http.oapi.post<unknown>(
        '/validateToken',
        { token: user.token },
        { signal: this.abort.signal },
      );
      if (generation !== this.generation) return;
      if (!record(response.data) || response.data.valid !== true) {
        this.logout();
        return;
      }
      await this.loadScope(user, generation);
    } catch {
      if (generation === this.generation) this.logout();
    }
  }
  async login(values: { login: string; senha: string }) {
    const generation = this.reset();
    // Keep form mounted while request is pending; no new credential rules.
    const response = await this.deps.http.oapi
      .post<unknown>('/login', values)
      .catch((error) => {
        if (generation === this.generation) throw error;
        return null;
      });
    if (generation !== this.generation) return;
    if (!response) return;
    const user = readUser(response.data);
    if (!user) throw new Error('Resposta de sessão inválida.');
    this.store(() => this.deps.storage.setItem(USER_KEY, JSON.stringify(user)));
    this.publish({ status: 'checking' });
    await this.loadScope(user, generation);
  }
  retryScope = async () => {
    if (this.state.status !== 'scope-error' && this.state.status !== 'ready')
      return;
    const user = this.state.user;
    const generation = this.reset();
    this.publish({ status: 'checking' });
    await this.loadScope(user, generation);
  };
  private async loadScope(user: User, generation: number) {
    this.token = user.token;
    try {
      const response = await this.deps.http.api.get<unknown>(
        '//assembleias/?ativo=true',
        { signal: this.abort.signal },
      );
      if (generation !== this.generation) return;
      const first: unknown = Array.isArray(response.data)
        ? response.data[0]
        : undefined;
      if (
        !record(first) ||
        typeof first.codigo !== 'number' ||
        !Number.isFinite(first.codigo)
      )
        throw new Error('Sem assembleia ativa');
      const assembly = first.codigo;
      this.store(() =>
        this.deps.storage.setItem(ASSEMBLY_KEY, String(assembly)),
      );
      this.publish({ status: 'ready', user, assembly, generation });
      this.startEffects(user, generation);
    } catch {
      if (generation === this.generation) {
        this.token = null;
        this.store(() => this.deps.storage.removeItem(ASSEMBLY_KEY));
        this.publish({ status: 'scope-error', user });
      }
    }
  }
  private startEffects(user: User, generation: number) {
    const socket = this.deps.newSocket();
    this.socket = socket;
    const current = () => generation === this.generation;
    const on: typeof socket.on = (event, listener) => {
      const off = socket.on(event, (...args) => {
        if (current()) listener(...args);
      });
      this.cleanups.push(off);
      return off;
    };
    on('getUser', () => socket.emit('setUser', user));
    on('derrubar', (data) => {
      if (record(data) && data.id === user.id) {
        this.deps.alert(
          typeof data.message === 'string' ? data.message : 'Sessão encerrada.',
        );
        this.logout();
      }
    });
    on('expulsar', () => {
      this.logout();
      this.deps.redirect();
    });
    on('expulsarId', (id) => {
      if (id === user.id) {
        this.logout();
        this.deps.redirect();
      }
    });
    on('usuarioOnline', (data) => {
      if (record(data) && data.id !== user.id && typeof data.nome === 'string')
        this.deps.notify(`${data.nome} acabou de entrar.`);
    });
    on('confirmacaoPresenca', (data) => {
      if (user.tipo === 1 && record(data) && typeof data.nome === 'string')
        this.deps.notify(`${data.nome} acabou confirmar presença.`);
    });
    on('voto', (data) => {
      if (
        user.tipo === 1 &&
        record(data) &&
        typeof data.nomeCredor === 'string'
      )
        this.deps.notify(`${data.nomeCredor} acabou de votar.`);
    });
    this.cleanups.push(() => socket.disconnect());
    socket.connect();
    // Original POST has no body; no retry. Completion does not prove persistence.
    const heartbeat = setInterval(() => {
      if (current())
        void this.deps.http.api.post('//logsAcessos/register').catch(() => {});
    }, 30_000);
    this.cleanups.push(() => clearInterval(heartbeat));
  }
}
