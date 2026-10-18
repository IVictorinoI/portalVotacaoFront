import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AppConfig } from './config';
import { createApiClients, type ApiClients } from './http';
import { createSocket } from './socket';
interface Infrastructure {
  httpForSession: (token: () => string | null) => ApiClients;
  newSocket: () => ReturnType<typeof createSocket>;
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
      httpForSession: (token: () => string | null) =>
        createApiClients(config, token),
      newSocket: () => createSocket(config.socketUrl),
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
