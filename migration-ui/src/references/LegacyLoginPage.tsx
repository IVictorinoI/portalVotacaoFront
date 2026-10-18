import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { errorMessages } from '../lib/http';
import {
  LEGACY_KEY,
  LEGACY_OWNER,
  legacyLoginUrl,
  legacyUser,
  readLegacy,
} from './legacy';
export default function LegacyLoginPage() {
  const session = useReadySession();
  const [user, setUser] = useState(() =>
    readLegacy(localStorage, session.user.id),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(false);
  const abort = useRef(new AbortController());
  const form = useForm({ defaultValues: { login: '', senha: '' } });
  useEffect(() => {
    mounted.current = true;
    abort.current = new AbortController();
    const changed = (event: StorageEvent) => {
      if (
        event.key === LEGACY_KEY ||
        event.key === LEGACY_OWNER ||
        event.key === null
      )
        setUser(readLegacy(localStorage, session.user.id));
    };
    window.addEventListener('storage', changed);
    return () => {
      mounted.current = false;
      abort.current.abort();
      window.removeEventListener('storage', changed);
    };
  }, [session.user.id]);
  const current = () => mounted.current && session.current();
  async function login(values: { login: string; senha: string }) {
    if (lock.current || !current()) return;
    lock.current = true;
    setBusy(true);
    setErrors([]);
    try {
      const { data } = await session.http.get<unknown>(
        legacyLoginUrl(values.login, values.senha),
        { signal: abort.current.signal },
      );
      if (!current()) return;
      const found = Array.isArray(data) ? legacyUser(data[0]) : null;
      if (!found) {
        setErrors(['Usuário/senha inválidos']);
        return;
      }
      localStorage.setItem(LEGACY_KEY, JSON.stringify(found));
      localStorage.setItem(LEGACY_OWNER, session.user.id);
      setUser(found);
      session.controller.socket?.emit('setUser', found);
    } catch (error) {
      if (current()) setErrors(errorMessages(error));
    } finally {
      lock.current = false;
      if (current()) setBusy(false);
    }
  }
  function logout() {
    localStorage.setItem(LEGACY_KEY, 'null');
    localStorage.removeItem(LEGACY_OWNER);
    setUser(null);
    form.reset({ login: '', senha: '' });
  }
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Login legado
      </Typography>
      {errors.map((error, i) => (
        <Alert severity="error" key={i}>
          {error}
        </Alert>
      ))}
      {user ? (
        <>
          <Typography component="h2" variant="h5">
            Olá {user.nome}
          </Typography>
          <Button onClick={logout}>Sair do login legado</Button>
        </>
      ) : (
        <Box component="form" onSubmit={form.handleSubmit(login)}>
          <Stack spacing={2}>
            <TextField
              label="Usuário"
              autoComplete="username"
              disabled={busy}
              {...form.register('login')}
            />
            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              disabled={busy}
              {...form.register('senha')}
            />
            <Button type="submit" variant="contained" disabled={busy}>
              Entrar
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
}
