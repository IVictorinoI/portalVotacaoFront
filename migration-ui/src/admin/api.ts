import type { AxiosInstance } from 'axios';
import { record } from '../auth/session-controller';
export interface Notification extends Record<string, unknown> {
  _id: string;
  mensagem: string;
  tipo?: string;
  data?: string;
  lido: boolean;
}
export interface AccessLog {
  _id: string;
  nome: string;
  data?: string;
  dataUltimoAcesso?: string;
  tipo?: number;
}
export interface ConnectedUser {
  id: string;
  nome: string;
  codigoCredor?: number;
}
export function notificationUrl(search: string, onlyUnread: boolean) {
  return (
    '/notificacoes?sort=-_id' +
    (search ? '&mensagem__regex=/' + search + '/' : '') +
    (onlyUnread ? '&lido=false' : '')
  );
}
export async function readAdminNotifications(
  http: AxiosInstance,
  search: string,
  onlyUnread: boolean,
  signal: AbortSignal,
) {
  const { data } = await http.get<unknown>(
    notificationUrl(search, onlyUnread),
    { signal },
  );
  if (
    !Array.isArray(data) ||
    !data.every(
      (row: unknown) =>
        record(row) &&
        typeof row._id === 'string' &&
        typeof row.mensagem === 'string',
    )
  )
    throw new Error('Resposta de notificações inválida.');
  return data as Notification[];
}
export async function readLogs(
  http: AxiosInstance,
  assembly: number,
  signal: AbortSignal,
) {
  const { data } = await http.get<unknown>(
    '/logsAcessos?codigoAssembleia=' + assembly + '&sort=-data&limit=300',
    { signal },
  );
  if (
    !Array.isArray(data) ||
    !data.every(
      (row: unknown) =>
        record(row) &&
        typeof row._id === 'string' &&
        typeof row.nome === 'string',
    )
  )
    throw new Error('Resposta de logs inválida.');
  return data as AccessLog[];
}
export function connectedUsers(value: unknown): ConnectedUser[] | null {
  return Array.isArray(value) &&
    value.every(
      (row: unknown) =>
        record(row) &&
        typeof row.id === 'string' &&
        typeof row.nome === 'string',
    )
    ? (value as ConnectedUser[])
    : null;
}
