import type { AxiosInstance } from 'axios';
import { record } from '../auth/session-controller';
import { decimal, money } from '../common/format';
export interface Result extends Record<string, unknown> {
  _id: string;
  codigoClasse: number;
  descricaoClasse: string;
  tipoResultado?: string;
  valorCredito?: number;
  quantCredores?: number;
  valorSim?: number;
  valorNao?: number;
  valorAbs?: number;
  quantSim?: number;
  quantNao?: number;
  quantAbs?: number;
  percValorSim?: number;
  percValorNao?: number;
  percQuantSim?: number;
  percQuantNao?: number;
  valorSubTotalSim?: number;
  valorSubTotalNao?: number;
  percSubTotalSim?: number;
  percSubTotalNao?: number;
  valorTotalGeral?: number;
}
export async function readResults(
  http: AxiosInstance,
  assembly: number,
  signal: AbortSignal,
) {
  const { data } = await http.get<unknown>(
    '/resultados/?codigoAssembleia=' + assembly + '&sort=codigoClasse',
    { signal },
  );
  if (
    !Array.isArray(data) ||
    !data.every((row: unknown) => record(row) && typeof row._id === 'string')
  )
    throw new Error('Resposta de resultados inválida.');
  return data as Result[];
}
export function resultMode(row: Result) {
  return Number(row.codigoClasse) === 1 || Number(row.codigoClasse) === 4
    ? row.tipoResultado === 'V'
      ? 'value'
      : 'quantity'
    : 'both';
}
export function resultMoney(value: number | undefined) {
  return money(value || 0);
}
export function resultPercent(value: number | undefined) {
  return decimal(value || 0) + '%';
}
