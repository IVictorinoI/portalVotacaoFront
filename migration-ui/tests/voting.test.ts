import { expect, it } from 'vitest';
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { createApiClients } from '../src/lib/http';
import {
  votingPath,
  pendingVotes,
  sendVote,
  type Vote,
} from '../src/voting/api';
import type { User } from '../src/auth/session-controller';
const user: User = {
  id: 'fixture',
  nome: 'Teste',
  login: 'fixture',
  token: 'sintético',
  tipo: 0,
  codigo: 90,
  codigoCredor: 90,
  codigoAssembleia: 5,
};
it('mantém URL sem barra final, regex e filtro por procurador; admin sem filtro', () => {
  expect(votingPath(6, user, 'Bia')).toBe(
    '/votos?codigoAssembleia=6&sort=-_id&nomeCredor__regex=/Bia/&codigoProcurador=90',
  );
  expect(votingPath(6, { ...user, tipo: 1 }, '')).toBe(
    '/votos?codigoAssembleia=6&sort=-_id',
  );
});
it('todos seleciona somente pendentes sem mudar ordem ou lista original', () => {
  const rows = [
    { _id: 'a', tipo: 'N' },
    { _id: 'b', tipo: '' },
    { _id: 'c', tipo: 'S' },
    { _id: 'd', tipo: '' },
  ] as Vote[];
  expect(pendingVotes(rows).map((r) => r._id)).toEqual(['b', 'd']);
  expect(rows).toHaveLength(4);
});
it('S/N/A enviam somente _id e tipo por PUT no caminho original', async () => {
  const requests: InternalAxiosRequestConfig[] = [];
  const { api } = createApiClients(
    {
      apiBaseUrl: 'http://fixture.invalid/api',
      oapiBaseUrl: 'http://fixture.invalid/oapi',
      socketUrl: 'http://fixture.invalid/api/',
    },
    () => user.token,
    async (config) => {
      requests.push(config);
      return {
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config,
        data: {},
      };
    },
  );
  for (const choice of ['S', 'N', 'A'] as const)
    await sendVote(
      api,
      { _id: 'fixture', tipo: '', extra: 'não enviar' } as unknown as Vote,
      choice,
    );
  expect(
    requests.map((r) => [
      r.method,
      r.url,
      JSON.parse(String(r.data)),
      r.headers.get('authorization'),
    ]),
  ).toEqual(
    ['S', 'N', 'A'].map((tipo) => [
      'put',
      'http://fixture.invalid/api/votos/votar',
      { _id: 'fixture', tipo },
      user.token,
    ]),
  );
});
