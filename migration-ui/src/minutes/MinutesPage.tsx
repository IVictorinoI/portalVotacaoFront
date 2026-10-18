import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
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
import { readAssembly } from '../assembly/api';
import { Section } from '../common/Section';
import { SearchForm } from '../common/SearchForm';
import { historicalTime } from '../common/format';
import { errorMessages } from '../lib/http';
import { BatchRunner } from '../lib/batch';
import {
  approvalColor,
  classNames,
  minuteGroups,
  readAttendance,
  readMinutes,
  signedCount,
} from './api';
const colors = { green: '#00a65a', yellow: '#f39c12', gray: '#d2d6de' };
export default function MinutesPage() {
  const session = useReadySession();
  const cache = useQueryClient();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const runner = useRef(new BatchRunner());
  const mounted = useRef(false);
  const [descriptions, setDescriptions] = useState(classNames);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = () => mounted.current && session.current();
  const query = useQuery({
    queryKey: session.key('minutes', search),
    queryFn: ({ signal }) =>
      readMinutes(session.http, session.assembly, search, signal),
  });
  const attendance = useQuery({
    queryKey: session.key('minutesAttendance'),
    queryFn: ({ signal }) => readAttendance(session.http, signal),
  });
  const assembly = useQuery({
    queryKey: session.key('assembly'),
    queryFn: ({ signal }) =>
      readAssembly(session.http, session.assembly, signal),
    refetchInterval: 5000,
  });
  const groups = minuteGroups(query.data ?? []);
  useEffect(() => {
    if (query.data)
      setDescriptions((previous) =>
        minuteGroups(query.data ?? []).map(
          (rows, i) =>
            rows[0]?.descricaoClasse ?? previous[i] ?? classNames[i] ?? '',
        ),
      );
  }, [query.data]);
  useEffect(() => {
    const socket = session.controller.socket;
    if (!socket) return;
    const refresh = () => {
      if (session.current()) void query.refetch({ cancelRefetch: false });
    };
    const approved = socket.on('aprovouata', refresh);
    const rejected = socket.on('reprovouata', refresh);
    return () => {
      approved();
      rejected();
    };
  }, [session.controller, session.generation, query.refetch]);
  async function reconcile() {
    const result = await query.refetch();
    if (current() && !result.isError) setReview(false);
  }
  const allowed = () =>
    cache.getQueryState(session.key('assembly'))?.status === 'success' &&
    cache.getQueryData<typeof assembly.data>(session.key('assembly'))
      ?.podeAta === true;
  async function sign() {
    if (runner.current.busy || review || !allowed()) return;
    setBusy(true);
    setMessages([]);
    setSuccess('');
    const result = await runner.current.run(
      [true],
      current,
      allowed,
      async () => {
        await session.http.post('/aprovaAtas/aprovar');
      },
      () => {
        setSuccess('Você aprovou a ata');
        session.controller.socket?.emit('aprovarata');
        void cache.invalidateQueries(
          { queryKey: session.key('minutes') },
          { cancelRefetch: false },
        );
      },
    );
    if (!current()) return;
    setBusy(false);
    if (result.error) {
      setReview(true);
      setMessages([
        ...errorMessages(result.error),
        'Resultado da assinatura não confirmado. Confira a lista antes de tentar novamente.',
      ]);
      await reconcile();
    }
  }
  const roles = [
    { label: 'Secretário', row: query.data?.find((row) => row.secretario) },
    {
      label: 'Recuperanda',
      row: query.data?.find((row) => row.empresaRecuperanda),
    },
  ];
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Aprovação da ata
      </Typography>
      {messages.map((message, i) => (
        <Alert severity="error" key={i}>
          {message}
        </Alert>
      ))}
      {success && <Alert severity="success">{success}</Alert>}
      {(query.isPending || assembly.isPending || attendance.isPending) && (
        <Typography role="status">Carregando…</Typography>
      )}
      {(query.isError || assembly.isError || attendance.isError) && (
        <Alert severity="error">
          Não foi possível consultar a ata.{' '}
          <Button
            onClick={() => {
              void reconcile();
              void assembly.refetch();
              void attendance.refetch();
            }}
          >
            Consultar novamente
          </Button>
        </Alert>
      )}
      <Section title="Você assina a ata?">
        <Button
          variant="contained"
          color="success"
          disabled={
            busy || review || assembly.isError || !assembly.data?.podeAta
          }
          onClick={() => void sign()}
        >
          Assinar ata
        </Button>
        {busy && <Typography role="status">Assinando…</Typography>}
        {review && (
          <Button onClick={() => void reconcile()}>
            Conferir ata novamente
          </Button>
        )}
      </Section>
      <Section title="Resultado de assinadores da ata">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,minmax(0,1fr))',
              lg: 'repeat(4,minmax(0,1fr))',
            },
            gap: 2,
          }}
        >
          {groups.map((rows, i) => {
            const code = i + 1;
            const total =
              attendance.data?.find((row) => Number(row.codigoClasse) === code)
                ?.quant ?? 0;
            const count = signedCount(rows, code);
            return total ? (
              <Paper
                key={code}
                data-testid="minute-count"
                sx={{
                  p: 2,
                  backgroundColor: colors[approvalColor(count, total)],
                  color: '#111',
                }}
              >
                <Typography variant="h5">{count}</Typography>
                <Typography>de {total} dos credores presentes</Typography>
                <Typography>{descriptions[i]}</Typography>
              </Paper>
            ) : null;
          })}
        </Box>
      </Section>
      <Section title="Pesquisa">
        <SearchForm
          disabled={busy}
          onSearch={(text) => {
            setSearch(text);
            if (text === search) void reconcile();
          }}
        />
      </Section>
      <Section title="Secretário e empresa recuperanda">
        <TableContainer
          component={Paper}
          tabIndex={0}
          aria-label="Secretário e recuperanda"
          sx={{ overflowX: 'auto' }}
        >
          <Table aria-label="Secretário e recuperanda">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Assinou</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map(({ row, label }) =>
                row ? (
                  <TableRow
                    key={label}
                    sx={{
                      backgroundColor: row.aprovou ? '#dff0d8' : '#f2dede',
                    }}
                  >
                    <TableCell>
                      {label} - {row.nomeCredor}
                    </TableCell>
                    <TableCell>
                      {row.aprovou ? 'Assinou' : 'Reprovou'}
                    </TableCell>
                  </TableRow>
                ) : null,
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
      {groups.map((rows, i) =>
        rows.length ? (
          <Section key={i} title={descriptions[i] ?? ''}>
            <TableContainer
              component={Paper}
              tabIndex={0}
              aria-label={'Ata ' + descriptions[i]}
              sx={{ overflowX: 'auto' }}
            >
              <Table
                aria-label={'Ata ' + descriptions[i]}
                sx={{ minWidth: 650 }}
              >
                <TableHead>
                  <TableRow>
                    {['Nome', 'Procurador', 'Hora', 'Assinou'].map((title) => (
                      <TableCell key={title}>{title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        backgroundColor: row.aprovou ? '#dff0d8' : '#f2dede',
                      }}
                    >
                      <TableCell>{row.nomeCredor}</TableCell>
                      <TableCell>{row.nomeProcurador}</TableCell>
                      <TableCell>{historicalTime(row.data)}</TableCell>
                      <TableCell>
                        {row.aprovou ? 'Assinou' : 'Reprovou'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        ) : null,
      )}
      {query.isSuccess && !query.data.length && (
        <Typography role="status">
          Nenhuma assinatura nesta pesquisa.
        </Typography>
      )}
    </>
  );
}
