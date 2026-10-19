import { it, expect } from 'vitest';
import { createQueryClient } from '../src/lib/query';
it('queries isoladas por instância e mutations sem retry', () => {
  const first = createQueryClient();
  const second = createQueryClient();
  first.setQueryData(['recurso', 'usuario-A', 5], ['fixture']);
  expect(second.getQueryData(['recurso', 'usuario-A', 5])).toBeUndefined();
  expect(first.getDefaultOptions().mutations?.retry).toBe(false);
  expect(first.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  first.clear();
  second.clear();
});
