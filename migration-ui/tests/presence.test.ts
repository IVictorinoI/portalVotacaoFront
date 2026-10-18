import { expect, it } from 'vitest';
import { BatchRunner } from '../src/lib/batch';
import {
  presencePath,
  sortCreditors,
  type Creditor,
} from '../src/presence/api';
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
it('presença preserva filtros/regex/ordem e representação inclusive credor próprio original', () => {
  expect(presencePath(6, user, 'Ana')).toBe(
    '/credores/?codigoAssembleia=6&sort=-_id&nome__regex=/Ana/&confirmouPresenca__ne=true&apenasProcurador__ne=true&codigoProcurador=90',
  );
  expect(presencePath(6, { ...user, tipo: 1 }, '')).toBe(
    '/credores/?codigoAssembleia=6&sort=-_id&confirmouPresenca__ne=true&apenasProcurador__ne=true',
  );
  expect(presencePath(6, { ...user, codigoCredor: 101 }, '')).toContain(
    'codigoProcurador=101',
  );
});
it('ordena nomes case insensitive sem alterar coleção de entrada', () => {
  const rows = [
    { _id: 'B', nome: 'bia' },
    { _id: 'A', nome: 'Ana' },
  ] as Creditor[];
  expect(sortCreditors(rows).map((r) => r._id)).toEqual(['A', 'B']);
  expect(rows[0]?._id).toBe('B');
});
it('coordenador assume trava antes do await, opera snapshot sequencial e para no primeiro erro', async () => {
  const runner = new BatchRunner();
  const sent: number[] = [];
  const confirmed: number[] = [];
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const items = [1, 2, 3];
  const run = runner.run(
    [...items],
    () => true,
    () => true,
    async (n) => {
      sent.push(n);
      if (n === 1) await pending;
      if (n === 2) throw new Error('perdido');
    },
    (n) => {
      confirmed.push(n);
    },
  );
  expect(runner.busy).toBe(true);
  expect(sent).toEqual([1]);
  expect(
    (
      await runner.run(
        [4],
        () => true,
        () => true,
        async () => {},
        () => {},
      )
    ).busy,
  ).toBe(true);
  release();
  const result = await run;
  expect(sent).toEqual([1, 2]);
  expect(confirmed).toEqual([1]);
  expect(result).toMatchObject({ completed: 1, stopped: true });
  expect(runner.busy).toBe(false);
});
it('janela ou sessão encerrada para próximo item; sucesso tardio não emite evento nem atualiza cache', async () => {
  const runner = new BatchRunner();
  let alive = true;
  let open = true;
  const confirmed: number[] = [];
  const sent: number[] = [];
  await runner.run(
    [1, 2],
    () => alive,
    () => open,
    async (n) => {
      sent.push(n);
      open = false;
    },
    (n) => confirmed.push(n),
  );
  expect(sent).toEqual([1]);
  expect(confirmed).toEqual([1]);
  open = true;
  sent.length = 0;
  confirmed.length = 0;
  await runner.run(
    [1, 2],
    () => alive,
    () => open,
    async (n) => {
      sent.push(n);
      alive = false;
    },
    (n) => confirmed.push(n),
  );
  expect(sent).toEqual([1]);
  expect(confirmed).toEqual([]);
});
