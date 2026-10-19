import type { AxiosInstance } from 'axios';
import type { User } from '../auth/session-controller';
import { record } from '../auth/session-controller';
export type VoteChoice = 'S' | 'N' | 'A';
export interface Vote extends Record<string, unknown> {
  _id: string;
  codigo: number;
  nomeCredor: string;
  descricaoClasse: string;
  valor: number;
  tipo: string;
  cpfCnpj?: string;
  nomeProcurador?: string;
  codigoClasse?: number;
  codigoProcurador?: number;
  percentualClasse?: number;
  ordem?: number;
  data?: string;
}
export function votingPath(assembly: number, user: User, search: string) {
  return (
    '/votos?codigoAssembleia=' +
    assembly +
    '&sort=-_id' +
    (search ? '&nomeCredor__regex=/' + search + '/' : '') +
    (user.tipo !== 1 ? '&codigoProcurador=' + user.codigoCredor : '')
  );
}
export function votes(value: unknown): Vote[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (row: unknown) =>
        record(row) &&
        typeof row._id === 'string' &&
        typeof row.nomeCredor === 'string' &&
        typeof row.valor === 'number',
    )
  )
    throw new Error('Resposta de votos inválida.');
  return value as Vote[];
}
export async function listVoting(
  http: AxiosInstance,
  assembly: number,
  user: User,
  search: string,
  signal: AbortSignal,
) {
  return votes(
    (await http.get<unknown>(votingPath(assembly, user, search), { signal }))
      .data,
  );
}
export async function sendVote(
  http: AxiosInstance,
  vote: Vote,
  choice: VoteChoice,
) {
  await http.put('/votos/votar', { _id: vote._id, tipo: choice });
}
export const choiceLabels: Record<VoteChoice, string> = {
  S: 'Sim',
  N: 'Não',
  A: 'Abstenção',
};
export function pendingVotes(rows: Vote[]) {
  return rows.filter((row) => !row.tipo);
}
