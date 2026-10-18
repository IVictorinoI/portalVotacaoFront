import type { AxiosInstance } from 'axios';
import { votes, type Vote } from '../voting/api';
export interface LiveFeed {
  rows: Vote[];
  cursor: number;
}
// Compatibilidade temporária: correção do cursor/reconciliação por _id exige decisão.
export function mergeOriginalFeed(
  previous: LiveFeed,
  incoming: Vote[],
): LiveFeed {
  const fresh = incoming.filter(
    (row) => !previous.rows.some((old) => old._id === row._id),
  );
  const cursor = incoming.length
    ? previous.rows.reduce(
        (max, row) => ((row.ordem ?? 0) > max ? (row.ordem ?? max) : max),
        previous.cursor,
      )
    : previous.cursor;
  return { rows: [...fresh, ...previous.rows], cursor };
}
export async function readLive(
  http: AxiosInstance,
  assembly: number,
  previous: LiveFeed,
  signal: AbortSignal,
) {
  const incoming = votes(
    (
      await http.get<unknown>(
        '/votos/?codigoAssembleia=' +
          assembly +
          '&ordem__gt=' +
          previous.cursor +
          '&sort=-ordem',
        { signal },
      )
    ).data,
  );
  return mergeOriginalFeed(previous, incoming);
}
