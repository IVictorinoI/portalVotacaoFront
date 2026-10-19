import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { Section } from '../common/Section';
import { errorMessages } from '../lib/http';
import { linkPayload, readRows, type LinkRecord } from './api';
export default function LinksPage({
  editable = false,
}: {
  editable?: boolean;
}) {
  const session = useReadySession();
  const cache = useQueryClient();
  const key = session.key('links');
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      readRows<LinkRecord>(session.http, '/links?sort=-_id', signal),
  });
  const form = useForm({ defaultValues: { descricao: '', url: '' } });
  const base = useRef<Record<string, unknown>>({});
  const changed = useRef(new Set<string>());
  const lock = useRef(false);
  const mounted = useRef(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = () => mounted.current && session.current();
  function edit(row: LinkRecord) {
    if (lock.current) return;
    base.current = { ...row };
    changed.current.clear();
    form.reset({ descricao: row.descricao ?? '', url: row.url ?? '' });
  }
  async function reconcile() {
    const result = await query.refetch();
    if (current() && !result.isError) setReview(false);
  }
  async function write(action: () => Promise<unknown>, save: boolean) {
    if (lock.current || review || !current() || query.isFetching) return;
    lock.current = true;
    setBusy(true);
    setErrors([]);
    try {
      await action();
      if (!current()) return;
      if (save) {
        base.current = { descricao: '', url: '', _id: '' };
        changed.current.clear();
        form.reset({ descricao: '', url: '' });
      }
      await cache.invalidateQueries({ queryKey: session.key('links') });
    } catch (error) {
      if (!current()) return;
      setErrors(errorMessages(error));
      setReview(true);
      await reconcile();
    } finally {
      lock.current = false;
      if (current()) setBusy(false);
    }
  }
  const title = editable ? 'Links' : 'Links úteis';
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {title}
      </Typography>
      {errors.map((error, i) => (
        <Alert severity="error" key={i}>
          {error}
        </Alert>
      ))}
      <Section title="Links de acesso externo">
        {editable && (
          <Box
            component="form"
            onSubmit={form.handleSubmit((values) =>
              write(() => {
                const body = linkPayload(base.current, values, changed.current);
                return base.current._id
                  ? session.http.put('/links/' + String(base.current._id), body)
                  : session.http.post('/links/', body);
              }, true),
            )}
          >
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Descrição"
                disabled={busy}
                {...form.register('descricao', {
                  onChange: () => changed.current.add('descricao'),
                })}
              />
              <TextField
                label="URL"
                disabled={busy}
                {...form.register('url', {
                  onChange: () => changed.current.add('url'),
                })}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={busy || review || query.isFetching}
              >
                Salvar
              </Button>
            </Stack>
          </Box>
        )}
        {query.isPending && <Typography role="status">Carregando…</Typography>}
        {query.isError && (
          <Alert severity="error">
            Não foi possível consultar os links.{' '}
            <Button onClick={() => void reconcile()}>
              Consultar novamente
            </Button>
          </Alert>
        )}
        {review && (
          <Button onClick={() => void reconcile()}>Conferir links</Button>
        )}
        <TableContainer
          component={Paper}
          tabIndex={0}
          sx={{ overflowX: 'auto' }}
        >
          <Table aria-label={title} sx={{ minWidth: editable ? 650 : 420 }}>
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Link</TableCell>
                {editable && <TableCell>Ações</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data?.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.descricao}</TableCell>
                  <TableCell>
                    <a href={row.url} target="_blank" rel="noreferrer">
                      {row.url}
                    </a>
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <Button
                        disabled={busy || review}
                        onClick={() => edit(row)}
                      >
                        Editar
                      </Button>
                      <Button
                        color="error"
                        disabled={busy || review || query.isFetching}
                        onClick={() =>
                          void write(
                            () => session.http.delete('/links/' + row._id),
                            false,
                          )
                        }
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {query.isSuccess && !query.data.length && (
          <Typography role="status">Nenhum link cadastrado.</Typography>
        )}
      </Section>
    </>
  );
}
