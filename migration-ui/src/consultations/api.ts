import type { AxiosInstance } from 'axios';
import { creditors, sortCreditors, type Creditor } from '../presence/api';
import { votes, type Vote } from '../voting/api';
export async function readCreditors(
  http: AxiosInstance,
  assembly: number,
  search: string,
  signal: AbortSignal,
) {
  const list = creditors(
    (
      await http.get<unknown>(
        '/credores/?codigoAssembleia=' +
          assembly +
          '&sort=-_id' +
          (search ? '&nome__regex=/' + search + '/' : ''),
        { signal },
      )
    ).data,
  );
  const voting = votes(
    (
      await http.get<unknown>(
        '/votos/?codigoAssembleia=' +
          assembly +
          '&sort=-_id' +
          (search ? '&nomeCredor__regex=/' + search + '/' : ''),
        { signal },
      )
    ).data,
  );
  return { list, voting };
}
export async function readVotes(
  http: AxiosInstance,
  assembly: number,
  search: string,
  signal: AbortSignal,
) {
  return votes(
    (
      await http.get<unknown>(
        '/votos/?codigoAssembleia=' +
          assembly +
          '&sort=-ordem' +
          (search ? '&nomeCredor__regex=/' + search + '/' : ''),
        { signal },
      )
    ).data,
  );
}
export interface OnlineUser {
  codigoCredor?: number;
}
export function creditorGroups(
  list: Creditor[],
  voting: Vote[],
  online: OnlineUser[],
) {
  return [1, 2, 3, 4].map((code) => {
    const group = list.filter((row) => Number(row.codigoClasse) === code);
    const rows = code === 4 ? group : sortCreditors(group);
    return rows.map((row) => ({
      ...row,
      nomeProcurador: row.nome === row.nomeProcurador ? '' : row.nomeProcurador,
      confirmou: voting.some((vote) => vote.codigo === row.codigo),
      votou: voting.some(
        (vote) => vote.codigo === row.codigo && vote.tipo !== '',
      ),
      online: online.some((user) => user.codigoCredor === row.codigo),
    }));
  });
}
