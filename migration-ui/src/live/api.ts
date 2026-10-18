import type { AxiosInstance } from 'axios';
import { votes, type Vote } from '../voting/api';
export interface LiveFeed {
  rows: Vote[];
  cursor: number;
}
// Correção de cursor/reconciliação aprovada explicitamente pelo usuário.
export function mergeFeed(previous: LiveFeed, incoming: Vote[]): LiveFeed {
  const updates = new Map(incoming.map((row) => [row._id, row]));
  const existing = new Set(previous.rows.map((row) => row._id));
  const fresh = [...updates.values()].filter((row) => !existing.has(row._id));
  const rows = [
    ...fresh,
    ...previous.rows.map((row) => updates.get(row._id) ?? row),
  ];
  const cursor = incoming.reduce(
    (max, row) => Math.max(max, row.ordem ?? 0),
    previous.cursor,
  );
  return { rows, cursor };
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
  return mergeFeed(previous, incoming);
}
