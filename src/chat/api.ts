import type { AxiosInstance } from 'axios';
import { record, type User } from '../auth/session-controller';
export interface Message extends Record<string, unknown> {
  _id: string;
  codigoAssembleia?: number;
  idUsuario: string;
  nomeCredor: string;
  msg: string;
  data: string;
}
export const unreadSentinel = '1899-12-30T21:05:19.000Z';
export function readMarkerKey(user: string, assembly: number) {
  return '_chat_notify_last_read:' + encodeURIComponent(user) + ':' + assembly;
}
export function message(value: unknown): Message | null {
  return record(value) &&
    typeof value._id === 'string' &&
    typeof value.idUsuario === 'string' &&
    typeof value.nomeCredor === 'string' &&
    typeof value.msg === 'string' &&
    typeof value.data === 'string'
    ? (value as Message)
    : null;
}
export function messages(value: unknown): Message[] {
  if (!Array.isArray(value)) throw new Error('Resposta de chat inválida.');
  const rows = value.map((row: unknown) => message(row));
  if (rows.some((row) => !row)) throw new Error('Resposta de chat inválida.');
  return rows as Message[];
}
export function mergeMessages(previous: Message[], incoming: Message[]) {
  const merged = new Map(previous.map((row) => [row._id, row]));
  incoming.forEach((row) => merged.set(row._id, row));
  return [...merged.values()].sort(
    (a, b) => (Date.parse(a.data) || 0) - (Date.parse(b.data) || 0),
  );
}
export function latestDate(previous: string, rows: Message[]) {
  return rows.reduce(
    (latest, row) =>
      Date.parse(row.data) > Date.parse(latest) ? row.data : latest,
    previous,
  );
}
export function notificationPath(assembly: number, lastRead: string) {
  const valid =
    lastRead &&
    (lastRead.includes('-') ||
      lastRead.includes('T') ||
      lastRead.includes('2'));
  return (
    '//chats/?codigoAssembleia=' +
    assembly +
    (valid ? '&data__gt=' + lastRead : '') +
    '&sort=data&limit=300'
  );
}
export async function readHistory(
  http: AxiosInstance,
  assembly: number,
  signal: AbortSignal,
) {
  return messages(
    (
      await http.get<unknown>(
        '/chats/?codigoAssembleia=' + assembly + '&sort=data&limit=300',
        { signal },
      )
    ).data,
  );
}
export async function readNotifications(
  http: AxiosInstance,
  assembly: number,
  lastRead: string,
  signal: AbortSignal,
) {
  return messages(
    (await http.get<unknown>(notificationPath(assembly, lastRead), { signal }))
      .data,
  );
}
export function messageBody(user: User, assembly: number, text: string) {
  return {
    codigoAssembleia: assembly,
    codigoCredor: user.codigoCredor,
    msg: text,
    nomeCredor: user.nome,
    idUsuario: user.id,
    privateMessageTo: {},
    codigoCredorDest: undefined,
  };
}
