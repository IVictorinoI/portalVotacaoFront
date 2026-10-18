import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { SearchForm } from '../common/SearchForm';
import { Section } from '../common/Section';
import { historicalTime } from '../common/format';
import { BatchRunner } from '../lib/batch';
import { errorMessages } from '../lib/http';
import { readAdminNotifications, type Notification } from './api';
export default function NotificationsPage() {
  const session = useReadySession();
  const cache = useQueryClient();
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(true);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const mounted = useRef(false);
  const runner = useRef(new BatchRunner());
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = () => mounted.current && session.current();
  const key = session.key('adminNotifications', search, onlyUnread);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      readAdminNotifications(session.http, search, onlyUnread, signal),
  });
  async function reconcile() {
    const result = await query.refetch();
    if (current() && !result.isError) setReview(false);
  }
  async function change(rows: Notification[], read: boolean) {
    if (busy || runner.current.busy || review || query.isFetching || !current())
      return;
    setBusy(true);
    setErrors([]);
    const result = await runner.current.run(
      rows.filter((row) => !!row.lido !== read),
      current,
      () => true,
      async (row) => {
        await session.http.put('/notificacoes/' + row._id, { lido: read });
      },
      (row) => {
        cache.setQueryData<Notification[]>(key, (old) =>
          old?.map((item) =>
            item._id === row._id ? { ...item, lido: read } : item,
          ),
        );
        void cache.invalidateQueries({
          queryKey: session.key('adminNotifications'),
          refetchType: 'none',
        });
      },
    );
    if (!current()) return;
    setBusy(false);
    if (result.error) {
      setReview(true);
      setErrors([
        ...errorMessages(result.error),
        `${result.completed} notificações atualizadas antes da interrupção. Confira a lista antes de repetir.`,
      ]);
      await reconcile();
    }
  }
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Notificações
      </Typography>
      {errors.map((error, i) => (
        <Alert severity="error" key={i}>
          {error}
        </Alert>
      ))}
      {query.isPending && <Typography role="status">Carregando…</Typography>}
      {query.isError && (
        <Alert severity="error">
          Não foi possível consultar as notificações.{' '}
          <Button onClick={() => void reconcile()}>Consultar novamente</Button>
        </Alert>
      )}
      <Section title="Pesquisa de notificações">
        <SearchForm
          key={String(onlyUnread)}
          label="Pesquise a notificação"
          disabled={busy}
          onSearch={(text) => {
            setSearch(text);
            if (text === search) void reconcile();
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={onlyUnread}
              disabled={busy}
              onChange={(_, checked) => {
                setOnlyUnread(checked);
                setSearch('');
              }}
            />
          }
          label="Apenas não lidos"
        />
        <Button
          color="success"
          variant="contained"
          disabled={
            busy ||
            review ||
            query.isFetching ||
            !query.data?.some((row) => !row.lido)
          }
          onClick={() => void change(query.data ?? [], true)}
        >
          Ler todos
        </Button>
        {busy && (
          <Typography role="status">Atualizando notificações…</Typography>
        )}
        {review && (
          <Button onClick={() => void reconcile()}>
            Conferir notificações
          </Button>
        )}
        <TableContainer
          component={Paper}
          tabIndex={0}
          sx={{ overflowX: 'auto' }}
        >
          <Table aria-label="Notificações" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {['Mensagem', 'Tipo', 'Hora', 'Leitura'].map((title) => (
                  <TableCell key={title}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data?.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.mensagem}</TableCell>
                  <TableCell>{row.tipo}</TableCell>
                  <TableCell>{historicalTime(row.data)}</TableCell>
                  <TableCell>
                    <Button
                      color={row.lido ? 'warning' : 'success'}
                      disabled={busy || review || query.isFetching}
                      onClick={() => void change([row], !row.lido)}
                    >
                      {row.lido ? 'Lido' : 'Não lido'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
      {query.isSuccess && !query.data.length && (
        <Typography role="status">
          Nenhuma notificação nesta pesquisa.
        </Typography>
      )}
    </>
  );
}
