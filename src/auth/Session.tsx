import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Snackbar } from '@mui/material';
import { useInfrastructure } from '../lib/Infrastructure';
import { SessionController, USER_KEY } from './session-controller';
const Context = createContext<SessionController | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const infra = useInfrastructure();
  const cache = useQueryClient();
  const [notice, setNotice] = useState('');
  const controller = useMemo(() => {
    let session: SessionController;
    session = new SessionController({
      http: infra.httpForSession(
        () => session.token,
        () => session.logout(),
      ),
      cache,
      storage: {
        getItem: (key) => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value),
        removeItem: (key) => window.localStorage.removeItem(key),
      },
      newSocket: infra.newSocket,
      redirect: () => {
        window.location.href = 'http://www.gladiusconsultoria.com.br/';
      },
      alert: (message) => window.alert(message),
      notify: setNotice,
    });
    return session;
  }, [infra, cache]);
  useEffect(() => {
    void controller.restore();
    const changed = (event: StorageEvent) => {
      if (event.key === USER_KEY || event.key === null)
        void controller.restore();
    };
    window.addEventListener('storage', changed);
    return () => {
      window.removeEventListener('storage', changed);
      controller.dispose();
    };
  }, [controller]);
  return (
    <Context.Provider value={controller}>
      {children}
      <Snackbar
        open={!!notice}
        message={notice}
        autoHideDuration={5000}
        onClose={() => setNotice('')}
      />
    </Context.Provider>
  );
}
export function useSession() {
  const controller = useContext(Context);
  if (!controller) throw new Error('SessionProvider ausente.');
  const state = useSyncExternalStore(controller.subscribe, controller.snapshot);
  return { state, controller };
}
