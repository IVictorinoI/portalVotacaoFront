import type { AxiosInstance } from 'axios';
import { record } from '../auth/session-controller';
export interface LinkRecord extends Record<string, unknown> {
  _id: string;
  descricao?: string;
  url?: string;
}
export interface ReferenceRow extends Record<string, unknown> {
  _id: string;
  descricao?: string;
  assunto?: string;
  data?: string;
  ativo?: boolean;
  tipo?: string;
}
export function assemblyUrl(search: string) {
  return (
    '/assembleias?param=true&sort=-ativo' +
    (search ? '&descricao__regex=/' + search + '/' : '')
  );
}
export async function readRows<T extends { _id: string }>(
  http: AxiosInstance,
  url: string,
  signal: AbortSignal,
): Promise<T[]> {
  const { data } = await http.get<unknown>(url, { signal });
  if (
    !Array.isArray(data) ||
    !data.every((row: unknown) => record(row) && typeof row._id === 'string')
  )
    throw new Error('Resposta de consulta inválida.');
  return data as T[];
}
export function linkPayload(
  base: Record<string, unknown>,
  values: { descricao: string; url: string },
  changed: Set<string>,
) {
  const body: Record<string, unknown> = { ...base, _id: base._id || null };
  for (const field of ['descricao', 'url'] as const)
    if (changed.has(field)) body[field] = values[field];
  return body;
}
