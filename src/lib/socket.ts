import { io } from 'socket.io-client';
export interface SocketUser {
  id: string;
  nome: string;
  tipo: number;
  codigoCredor?: number;
  codigoAssembleia?: number;
  token?: string;
}
interface ClientEvents {
  setUser: [];
  getConnectedUsers: [];
  expulsarTodos: [];
  expulsarId: [id: string];
}
interface ServerEvents {
  connect: [];
  disconnect: [reason: string];
  connect_error: [error: unknown];
  getUser: [data: unknown];
  connectedUsers: [users: unknown];
  newMessage: [message: unknown];
  aprovouata: [];
  reprovouata: [];
  expulsar: [];
  expulsarId: [id: string];
  derrubar: [data: unknown];
  usuarioOnline: [data: unknown];
  confirmacaoPresenca: [data: unknown];
  voto: [data: unknown];
}
export function createSocket(url: string, token: string) {
  const raw = io(url, {
    autoConnect: false,
    forceNew: true,
    auth: { token },
    reconnectionAttempts: 3,
  });
  return {
    connect() {
      raw.connect();
    },
    disconnect() {
      raw.disconnect();
    },
    emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]) {
      raw.emit(event, ...args);
    },
    on<K extends keyof ServerEvents>(
      event: K,
      listener: (...args: ServerEvents[K]) => void,
    ) {
      // Fronteira de transporte: payloads de negócio desconhecidos permanecem unknown.
      const handler = (...args: unknown[]) =>
        listener(...(args as ServerEvents[K]));
      raw.on(event as string, handler);
      return () => {
        raw.removeListener(event as string, handler);
      };
    },
  };
}
