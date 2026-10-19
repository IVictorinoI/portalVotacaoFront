import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { openingTime, readAssembly } from '../assembly/api';
import { BatchRunner } from '../lib/batch';
import { errorMessages } from '../lib/http';
import { SearchForm } from '../common/SearchForm';
import { confirmPresence, listPresence, type Creditor } from './api';

export default function PresencePage() {
  const session = useReadySession();
  const cache = useQueryClient();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [review, setReview] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const mounted = useRef(false);
  const runner = useRef(new BatchRunner());
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = () => mounted.current && session.current();
  const key = session.key('presence', search);
  const list = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      listPresence(
        session.http,
        session.assembly,
        session.user,
        search,
        signal,
      ),
  });
  const windowQuery = useQuery({
    queryKey: session.key('assembly'),
    queryFn: ({ signal }) =>
      readAssembly(session.http, session.assembly, signal),
    refetchInterval: 5000,
  });
  const assembly = windowQuery.data;
  const allowed = () =>
    cache.getQueryData<typeof assembly>(session.key('assembly'))
      ?.podeConfirmar === true;
  async function reconcile() {
    const result = await list.refetch();
    if (current() && !result.isError) setReview(false);
  }
  async function confirm(rows: Creditor[]) {
    if (
      !current() ||
      review ||
      list.isFetching ||
      windowQuery.isError ||
      !allowed() ||
      runner.current.busy
    )
      return;
    setBusy(true);
    setMessages([]);
    setSuccess('');
    const result = await runner.current.run(
      [...rows],
      current,
      allowed,
      (row) => confirmPresence(session.http, row),
      (row) => {
        cache.setQueryData<Creditor[]>(key, (old) =>
          old?.filter((item) => item._id !== row._id),
        );
        void cache.invalidateQueries({
          queryKey: session.key('presence'),
          refetchType: 'none',
        });

        for (const resource of [
          'creditors',
          'votes',
          'dashboard',
          'results',
          'minutes',
        ])
          void cache.invalidateQueries({ queryKey: session.key(resource) });
      },
    );
    if (!current()) return;
    setBusy(false);
    if (result.completed)
      setSuccess(
        result.completed === 1
          ? 'Presença confirmada.'
          : `${result.completed} presenças confirmadas.`,
      );
    if (result.error) {
      setReview(true);
      setMessages([
        ...errorMessages(result.error),
        'Lote interrompido. Confira a lista antes de tentar novamente; uma falha não garante que a gravação não ocorreu.',
      ]);
      await reconcile();
    } else if (result.stopped)
      setMessages(['Confirmação interrompida: a janela ou a sessão mudou.']);
  }
  const blocked =
    busy ||
    review ||
    list.isFetching ||
    windowQuery.isError ||
    !assembly?.podeConfirmar;
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Confirmar presença
      </Typography>
      <SearchForm
        disabled={busy}
        onSearch={(text) => {
          setSearch(text);
          if (text === search) void reconcile();
        }}
      />
      {messages.map((message, i) => (
        <Alert severity="error" key={i} sx={{ mb: 1 }}>
          {message}
        </Alert>
      ))}
      {success && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {success}
        </Alert>
      )}
      {(list.isError || windowQuery.isError) && (
        <Alert severity="error">
          Não foi possível consultar os dados.{' '}
          <Button
            onClick={() => {
              void reconcile();
              void windowQuery.refetch();
            }}
          >
            Consultar novamente
          </Button>
        </Alert>
      )}
      {review && (
        <Button onClick={() => void reconcile()}>
          Conferir lista novamente
        </Button>
      )}
      {(list.isPending || windowQuery.isPending) && (
        <Typography role="status">Carregando…</Typography>
      )}
      {!assembly?.podeConfirmar &&
        !assembly?.podeVotar &&
        !windowQuery.isPending && (
          <Alert severity="warning">
            Previsão de inicio da confirmação de presença{' '}
            {openingTime(assembly?.inicioConfPres)}
          </Alert>
        )}
      {assembly?.podeConfirmar && list.data?.length === 0 && (
        <Alert severity="warning">
          Você já confirmou sua presença. Aguarde o início da AGC
        </Alert>
      )}
      {assembly?.podeVotar && (
        <Alert severity="error">
          A votação já iniciou! Vote na aba 'Votar' ou acompanhe os votos na aba
          'Votação em tempo real'
        </Alert>
      )}
      {!!list.data?.length && !assembly?.podeVotar && (
        <Alert severity="info">
          Você possui estes credores abaixo vinculados em seu nome. Caso
          discorde, favor contatar a Administração Judicial pelo email:
          atendiento@gladiusconsultoria.com.br ou pelos telefones: (48)
          3433-8525 / (48) 99102-5411
        </Alert>
      )}
      <Stack direction="row" sx={{ my: 2, justifyContent: 'space-between' }}>
        <Button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Recolher' : 'Expandir'} lista de credores
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={blocked || !list.data?.length}
          onClick={() => void confirm(list.data ?? [])}
        >
          Confirmar todos
        </Button>
      </Stack>
      {busy && <Typography role="status">Confirmando presenças…</Typography>}
      <Collapse in={expanded}>
        <TableContainer
          component={Paper}
          tabIndex={0}
          aria-label="Credores para confirmar presença"
          sx={{ overflowX: 'auto' }}
        >
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {[
                  'Nome',
                  'Classe',
                  'Cpf/Cnpj',
                  'Crédito',
                  'Procurador',
                  'Confirmar',
                ].map((title) => (
                  <TableCell key={title}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {list.data?.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{row.descricaoClasse}</TableCell>
                  <TableCell>{row.cpfCnpj}</TableCell>
                  <TableCell align="right">
                    {row.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>{row.nomeProcurador}</TableCell>
                  <TableCell>
                    <Button
                      color="success"
                      variant="contained"
                      disabled={blocked}
                      onClick={() => void confirm([row])}
                    >
                      Confirmar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
      {!list.isPending && !list.isError && list.data?.length === 0 && (
        <Box role="status" sx={{ mt: 2 }}>
          Nenhum credor pendente nesta pesquisa.
        </Box>
      )}
    </>
  );
}
