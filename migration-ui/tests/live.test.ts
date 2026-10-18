import { expect, it } from 'vitest';
import { mergeOriginalFeed } from '../src/live/api';
import type { Vote } from '../src/voting/api';
it('compatibilidade documentada: lote novo precede anteriores e não duplica _id conhecido', () => {
  const a = { _id: 'a', ordem: 1, tipo: 'S' } as Vote;
  const b = { _id: 'b', ordem: 2, tipo: 'N' } as Vote;
  expect(mergeOriginalFeed({ rows: [a], cursor: 0 }, [b, a]).rows).toEqual([
    b,
    a,
  ]);
});
it('caracteriza cursor da lista anterior; correção aguarda resposta explícita, não requisito definitivo', () => {
  const a = { _id: 'a', ordem: 5, tipo: 'S' } as Vote;
  const first = mergeOriginalFeed({ rows: [], cursor: 0 }, [a]);
  expect(first.cursor).toBe(0);
  expect(mergeOriginalFeed(first, [a]).cursor).toBe(5);
});
