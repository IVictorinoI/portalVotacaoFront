import type { AxiosInstance } from 'axios';
import { record } from '../auth/session-controller';
export interface Minute {
  _id: string;
  codigoClasse?: number;
  descricaoClasse?: string;
  nomeCredor: string;
  nomeProcurador?: string;
  aprovou?: boolean;
  secretario?: boolean;
  empresaRecuperanda?: boolean;
  data?: string;
}
export interface Attendance {
  codigoClasse: number;
  quant: number;
}
export const classNames = [
  'Trabalhistas',
  'Garantia real',
  'Quirografários',
  'Me/Epp Microempresa e empresa de pequeno porte',
];
export async function readMinutes(
  http: AxiosInstance,
  assembly: number,
  search: string,
  signal: AbortSignal,
) {
  const { data } = await http.get<unknown>(
    '/aprovaAtas/?codigoAssembleia=' +
      assembly +
      '&sort=-_id' +
      (search ? '&nomeCredor__regex=/' + search + '/' : ''),
    { signal },
  );
  if (
    !Array.isArray(data) ||
    !data.every(
      (row: unknown) =>
        record(row) &&
        typeof row._id === 'string' &&
        typeof row.nomeCredor === 'string',
    )
  )
    throw new Error('Resposta de ata inválida.');
  return data as Minute[];
}
export async function readAttendance(http: AxiosInstance, signal: AbortSignal) {
  const { data } = await http.get<unknown>('/votos/dashboard/', { signal });
  if (!record(data)) throw new Error('Resposta de presença inválida.');
  if (data.resConfPres === undefined) return [];
  if (!Array.isArray(data.resConfPres))
    throw new Error('Resposta de presença inválida.');
  return data.resConfPres as Attendance[];
}
export function minuteGroups(rows: Minute[]) {
  return [1, 2, 3, 4].map((code) =>
    rows.filter((row) => Number(row.codigoClasse) === code),
  );
}
export function signedCount(rows: Minute[], code: number) {
  return code === 4 ? rows.length : rows.filter((row) => row.aprovou).length;
}
export function approvalColor(count: number, total: number) {
  return count >= 2 || count === total
    ? 'green'
    : count >= 1
      ? 'yellow'
      : 'gray';
}
