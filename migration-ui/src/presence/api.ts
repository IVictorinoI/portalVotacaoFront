import type { AxiosInstance } from 'axios';
import type { User } from '../auth/session-controller';
import { record } from '../auth/session-controller';
export interface Creditor extends Record<string, unknown> {
  _id: string;
  codigo: number;
  nome: string;
  descricaoClasse: string;
  valor: number;
  cpfCnpj?: string;
  nomeProcurador?: string;
  codigoClasse?: number;
  codigoProcurador?: number;
}
export function presencePath(assembly: number, user: User, search: string) {
  return (
    '/credores/?codigoAssembleia=' +
    assembly +
    '&sort=-_id' +
    (search ? '&nome__regex=/' + search + '/' : '') +
    '&confirmouPresenca__ne=true&apenasProcurador__ne=true' +
    (user.tipo !== 1 ? '&codigoProcurador=' + user.codigoCredor : '')
  );
}
export function creditors(value: unknown): Creditor[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (row: unknown) =>
        record(row) &&
        typeof row._id === 'string' &&
        typeof row.nome === 'string' &&
        typeof row.valor === 'number',
    )
  )
    throw new Error('Resposta de credores inválida.');
  return value as Creditor[];
}
export function sortCreditors(rows: Creditor[]) {
  return [...rows].sort((a, b) =>
    a.nome.toLowerCase() > b.nome.toLowerCase()
      ? 1
      : a.nome.toLowerCase() < b.nome.toLowerCase()
        ? -1
        : 0,
  );
}
export async function listPresence(
  http: AxiosInstance,
  assembly: number,
  user: User,
  search: string,
  signal: AbortSignal,
) {
  return sortCreditors(
    creditors(
      (
        await http.get<unknown>(presencePath(assembly, user, search), {
          signal,
        })
      ).data,
    ),
  );
}
export async function confirmPresence(http: AxiosInstance, creditor: Creditor) {
  await http.post('//votos/confirmar', { _id: creditor._id });
}
