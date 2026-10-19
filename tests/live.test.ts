import { expect, it } from 'vitest';
import { mergeFeed } from '../src/live/api';
import type { Vote } from '../src/voting/api';
const vote = (_id: string, ordem: number, tipo: string) =>
  ({ _id, ordem, tipo }) as Vote;
it('cursor usa maior ordem recebida desde primeiro lote, sem regredir em lote vazio ou atrasado', () => {
  const first = mergeFeed({ rows: [], cursor: 0 }, [
    vote('a', 5, 'S'),
    vote('b', 3, 'N'),
  ]);
  expect(first.cursor).toBe(5);
  expect(mergeFeed(first, []).cursor).toBe(5);
  expect(mergeFeed(first, [vote('c', 2, 'A')]).cursor).toBe(5);
});
it('atualiza ids conhecidos nas posições existentes e antepõe novos sem duplicar', () => {
  const previous = { rows: [vote('a', 5, 'S'), vote('b', 3, 'N')], cursor: 5 };
  const updated = vote('b', 7, 'S');
  const result = mergeFeed(previous, [
    vote('c', 8, 'A'),
    updated,
    vote('c', 8, 'A'),
  ]);
  expect(result.rows).toEqual([vote('c', 8, 'A'), previous.rows[0], updated]);
  expect(result.cursor).toBe(8);
  expect(previous.rows[1]?.tipo).toBe('N');
});
