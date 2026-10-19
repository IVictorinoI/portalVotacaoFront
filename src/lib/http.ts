import axios, { type AxiosAdapter, type AxiosInstance } from 'axios';
import type { AppConfig } from './config';
export interface ApiClients {
  api: AxiosInstance;
  oapi: AxiosInstance;
}
export function createApiClients(
  config: AppConfig,
  token: () => string | null,
  adapter?: AxiosAdapter,
  unauthorized?: () => void,
): ApiClients {
  function client(baseURL: string, authenticated: boolean): AxiosInstance {
    const instance = axios.create({ baseURL, ...(adapter ? { adapter } : {}) });
    instance.interceptors.request.use((request) => {
      // O chamador fornece as barras do caminho original; evitar join normalizador do Axios.
      if (request.url && !/^https?:/.test(request.url))
        request.url = baseURL + request.url;
      if (!authenticated) return request;
      const value = token();
      if (value) request.headers.set('authorization', 'Bearer ' + value);
      else request.headers.delete('authorization');
      return request;
    });
    instance.interceptors.response.use(undefined, (error: unknown) => {
      if (
        authenticated &&
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        error.config?.headers.get('authorization') === 'Bearer ' + token()
      )
        unauthorized?.();
      return Promise.reject(error);
    });
    return instance;
  }
  // Escritas sem retry automático; 401 afeta somente a identidade atual.
  return {
    api: client(config.apiBaseUrl, true),
    oapi: client(config.oapiBaseUrl, false),
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export function errorMessages(error: unknown): string[] {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    isRecord(error.response.data)
  ) {
    const errors = error.response.data.errors;
    if (
      Array.isArray(errors) &&
      errors.every((item: unknown) => typeof item === 'string')
    )
      return errors;
  }
  return ['Não foi possível concluir a solicitação.'];
}
