import { expect, it } from 'vitest';
import { refreshAfterEvent } from '../src/minutes/refresh';
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
it('evento durante leitura pendente obtém o estado remoto novo depois do snapshot em voo', async () => {
  const pending = deferred();
  let reads = 0;
  let remote = 1;
  let displayed = 0;
  const oldSnapshot = remote;
  const refresh = refreshAfterEvent(
    {
      isFetching: () => true,
      refetch: async () => {
        reads++;
        if (reads === 1) {
          await pending.promise;
          displayed = oldSnapshot;
        } else displayed = remote;
      },
    },
    () => true,
  );
  remote = 2;
  expect(reads).toBe(1);
  pending.resolve();
  await refresh;
  expect(reads).toBe(2);
  expect(displayed).toBe(2);
});
it('evento sem leitura pendente faz só uma consulta, sem duplicar leitura', async () => {
  let reads = 0;
  await refreshAfterEvent(
    {
      isFetching: () => false,
      refetch: async () => {
        reads++;
      },
    },
    () => true,
  );
  expect(reads).toBe(1);
});
it('desmontar ou trocar contexto impede reconsulta tardia após snapshot pendente', async () => {
  const pending = deferred();
  let active = true;
  let reads = 0;
  const query = {
    isFetching: () => true,
    refetch: async () => {
      reads++;
      await pending.promise;
    },
  };
  const refresh = refreshAfterEvent(query, () => active);
  active = false;
  pending.resolve();
  await refresh;
  expect(reads).toBe(1);
  await refreshAfterEvent(query, () => false);
  expect(reads).toBe(1);
});
