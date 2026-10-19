import type { AxiosInstance } from 'axios';
import { record } from '../auth/session-controller';
export interface Assembly {
  codigo: number;
  descricao?: string;
  assunto?: string;
  pergunta?: string;
  podeConfirmar?: boolean;
  podeVotar?: boolean;
  podeAta?: boolean;
  inicioConfPres?: string;
  inicioVotacao?: string;
}
export async function readAssembly(
  http: AxiosInstance,
  code: number,
  signal: AbortSignal,
): Promise<Assembly | null> {
  const { data } = await http.get<unknown>('/assembleias/?codigo=' + code, {
    signal,
  });
  if (!Array.isArray(data)) throw new Error('Resposta de assembleia inválida.');
  const first: unknown = data[0];
  if (first === undefined) return null;
  if (!record(first) || typeof first.codigo !== 'number')
    throw new Error('Resposta de assembleia inválida.');
  return first as unknown as Assembly;
}
// Mesma interpretação local do original: recorte sem conversão de timezone.
export function openingTime(value: string | undefined) {
  return value
    ? new Date(value).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        timeStyle: 'medium',
      })
    : '';
}
