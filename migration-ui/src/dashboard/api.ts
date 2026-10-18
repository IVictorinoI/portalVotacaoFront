import type { AxiosInstance } from 'axios';
import { record } from '../auth/session-controller';
import type { Assembly } from '../assembly/api';
export interface SummaryRow {
  codigoClasse: number;
  descricaoClasse: string;
  valorEsperado: number;
  valorConfirmado: number;
}
export interface Summary extends Record<string, unknown> {
  quorum2: SummaryRow[];
  votos2: SummaryRow[];
}
function summaryRows(value: unknown): value is SummaryRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row: unknown) =>
        record(row) &&
        typeof row.descricaoClasse === 'string' &&
        typeof row.valorEsperado === 'number' &&
        typeof row.valorConfirmado === 'number',
    )
  );
}
export async function readSummary(
  http: AxiosInstance,
  signal: AbortSignal,
): Promise<Summary> {
  const { data } = await http.get<unknown>('//votos/dashboard', { signal });
  if (!record(data) || !summaryRows(data.quorum2) || !summaryRows(data.votos2))
    throw new Error('Resposta de dashboard inválida.');
  return data as Summary;
}
export async function readActive(
  http: AxiosInstance,
  signal: AbortSignal,
): Promise<Assembly | null> {
  const { data } = await http.get<unknown>('//assembleias/?ativo=true', {
    signal,
  });
  if (!Array.isArray(data)) throw new Error('Resposta de assembleia inválida.');
  const row: unknown = data[0];
  if (row === undefined) return null;
  if (!record(row) || typeof row.codigo !== 'number')
    throw new Error('Resposta de assembleia inválida.');
  return row as unknown as Assembly;
}
export function percentage(row: SummaryRow) {
  return (+((100 / row.valorEsperado) * row.valorConfirmado) || 0).toFixed(6);
}
export function cardColor(value: string, votes: boolean) {
  return +value === 0
    ? 'red'
    : +value < (votes ? 100 : 50)
      ? 'yellow'
      : 'green';
}
export function chartColor(value: string) {
  return +value === 0
    ? ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)']
    : +value < 50
      ? ['rgba(255, 206, 86, 0.2)', 'rgba(255, 206, 86, 1)']
      : ['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)'];
}
export function chartRows(rows: SummaryRow[]) {
  return rows.filter(
    (row) => row.descricaoClasse !== '.' && !!row.valorEsperado,
  );
}
