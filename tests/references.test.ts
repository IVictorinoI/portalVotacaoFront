import { expect, it } from 'vitest';
import { assemblyUrl, linkPayload } from '../src/references/api';
import {
  LEGACY_KEY,
  LEGACY_OWNER,
  readLegacy,
  legacyLoginUrl,
} from '../src/references/legacy';
it('links distinguem omitido, vazio editado e metadata histórica', () => {
  expect(linkPayload({}, { descricao: '', url: '' }, new Set())).toEqual({
    _id: null,
  });
  expect(
    linkPayload({}, { descricao: '', url: 'x' }, new Set(['descricao'])),
  ).toEqual({ _id: null, descricao: '' });
  const base = { _id: 'a', descricao: 'Antigo', url: null, __v: 3 };
  expect(
    linkPayload(base, { descricao: 'Novo', url: '' }, new Set(['descricao'])),
  ).toEqual({ ...base, descricao: 'Novo' });
  expect(base.descricao).toBe('Antigo');
});
it('assembleias e login mantêm nomes/barras/regex e contrato GET antigo', () => {
  expect(assemblyUrl('Teste')).toBe(
    '/assembleias?param=true&sort=-ativo&descricao__regex=/Teste/',
  );
  expect(legacyLoginUrl('fixture', 'senha-falsa')).toBe(
    '/usuarios?sort=-_id&login=fixture&senha=senha-falsa',
  );
});
it('segunda sessão recupera inválidos e não herda documento de outra identidade', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null };
  values.set(LEGACY_KEY, '{');
  expect(readLegacy(storage, 'a')).toBeNull();
  values.set(
    LEGACY_KEY,
    JSON.stringify({ _id: 'a', nome: 'Sintético', extra: 3 }),
  );
  expect(readLegacy(storage, 'a')?.extra).toBe(3);
  expect(readLegacy(storage, 'b')).toBeNull();
  values.set(LEGACY_OWNER, 'b');
  expect(readLegacy(storage, 'b')?._id).toBe('a');
  expect(readLegacy(storage, 'a')).toBeNull();
});
