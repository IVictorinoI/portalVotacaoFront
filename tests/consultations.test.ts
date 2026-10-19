import { expect, it } from 'vitest';
import { creditorGroups } from '../src/consultations/api';
import { decimal, historicalTime } from '../src/common/format';
import type { Creditor } from '../src/presence/api';
import type { Vote } from '../src/voting/api';
it('separa classes 1–4, ordena 1–3 e mantém ordem remota de Me/Epp', () => {
  const rows = [
    { _id: 'b', codigo: 2, nome: 'bia', codigoClasse: 1 },
    { _id: 'a', codigo: 1, nome: 'Ana', codigoClasse: 1 },
    { _id: 'd', codigo: 4, nome: 'Z', codigoClasse: 4 },
    { _id: 'c', codigo: 3, nome: 'A', codigoClasse: 4 },
  ] as Creditor[];
  const groups = creditorGroups(rows, [], []);
  expect(groups[0]?.map((r) => r._id)).toEqual(['a', 'b']);
  expect(groups[3]?.map((r) => r._id)).toEqual(['d', 'c']);
  expect(rows[0]?._id).toBe('b');
});
it('joins por codigo estrito, voto vazio confirma e online não depende do procurador', () => {
  const row = {
    _id: 'a',
    codigo: 101,
    nome: 'Ana',
    nomeProcurador: 'Ana',
    codigoClasse: 1,
    valor: 10,
  } as Creditor;
  const result = creditorGroups([row], [{ codigo: 101, tipo: '' }] as Vote[], [
    { codigoCredor: 101 },
  ])[0]?.[0];
  expect(result).toMatchObject({
    confirmou: true,
    votou: false,
    online: true,
    nomeProcurador: '',
  });
  expect(row.nomeProcurador).toBe('Ana');
  expect(
    creditorGroups([row], [{ codigo: 101, tipo: 'S' }] as Vote[], [])[0]?.[0]
      ?.votou,
  ).toBe(true);
});
it('preserva 4–6 casas e sentinela/recorte histórico sem converter fuso', () => {
  expect(decimal(33.3333333)).toBe('33,333333');
  expect(decimal(2)).toBe('2,0000');
  expect(historicalTime('1899-12-30T00:00:00.000Z')).toBe('');
  expect(historicalTime('2026-10-18T10:12:34.000Z')).toBe('07:12:34');
});
