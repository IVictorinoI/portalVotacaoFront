import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AppConfig } from './config';
import { createApiClients, type ApiClients } from './http';
import { createSocket } from './socket';
interface Infrastructure {
  httpForSession: (
    token: () => string | null,
    unauthorized: () => void,
  ) => ApiClients;
  newSocket: (token: string) => ReturnType<typeof createSocket>;
}
const InfrastructureContext = createContext<Infrastructure | null>(null);
export function InfrastructureProvider({
  config,
  children,
}: {
  config: AppConfig;
  children: ReactNode;
}) {
  // Fábricas disponíveis para sessão futura, sem ler storage ou conectar no bootstrap.
  const value = useMemo(
    () => ({
      httpForSession: (token: () => string | null, unauthorized: () => void) =>
        createApiClients(config, token, undefined, unauthorized),
      newSocket: (token: string) => createSocket(config.socketUrl, token),
    }),
    [config],
  );
  return (
    <InfrastructureContext.Provider value={value}>
      {children}
    </InfrastructureContext.Provider>
  );
}
export function useInfrastructure(): Infrastructure {
  const value = useContext(InfrastructureContext);
  if (!value) throw new Error('InfrastructureProvider ausente.');
  return value;
}
