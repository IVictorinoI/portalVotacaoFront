import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
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
import { readAssembly } from '../assembly/api';
import { SearchForm } from '../common/SearchForm';
import { BatchRunner } from '../lib/batch';
import { errorMessages } from '../lib/http';
import {
  choiceLabels,
  listVoting,
  pendingVotes,
  sendVote,
  type Vote,
  type VoteChoice,
} from './api';
const choices: VoteChoice[] = ['S', 'N', 'A'];
export default function VotingPage() {
  const session = useReadySession();
  const cache = useQueryClient();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
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
  const key = session.key('votes', search);
  const list = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      listVoting(session.http, session.assembly, session.user, search, signal),
  });
  const windowQuery = useQuery({
    queryKey: session.key('assembly'),
    queryFn: ({ signal }) =>
      readAssembly(session.http, session.assembly, signal),
    refetchInterval: 5000,
  });
  const assembly = windowQuery.data;
  const allowed = () =>
    cache.getQueryState(session.key('assembly'))?.status === 'success' &&
    cache.getQueryData<typeof assembly>(session.key('assembly'))?.podeVotar ===
      true;
  async function reconcile() {
    const result = await list.refetch();
    if (current() && !result.isError) setReview(false);
  }
  async function cast(rows: Vote[], choice: VoteChoice) {
    if (
      !current() ||
      review ||
      list.isFetching ||
      !allowed() ||
      runner.current.busy
    )
      return;
    setBusy(true);
    setMessages([]);
    setSuccess('');
    const result = await runner.current.run(
      pendingVotes(rows),
      current,
      allowed,
      (row) => sendVote(session.http, row, choice),
      (row) => {
        cache.setQueryData<Vote[]>(key, (old) =>
          old?.map((item) =>
            item._id === row._id ? { ...item, tipo: choice } : item,
          ),
        );
        void cache.invalidateQueries({
          queryKey: session.key('votes'),
          refetchType: 'none',
        });
        session.controller.socket?.emit('votou', { ...row, tipo: choice });
        for (const resource of [
          'creditors',
          'dashboard',
          'results',
          'liveVotes',
          'minutes',
        ])
          void cache.invalidateQueries({ queryKey: session.key(resource) });
      },
    );
    if (!current()) return;
    setBusy(false);
    if (result.completed)
      setSuccess('Seu voto foi computado, aguarde o resultado');
    if (result.error) {
      setReview(true);
      setMessages([
        ...errorMessages(result.error),
        'Lote interrompido. Confira os votos antes de tentar novamente; uma falha não garante que a gravação não ocorreu.',
      ]);
      await reconcile();
    } else if (result.stopped)
      setMessages(['Votação interrompida: a janela ou a sessão mudou.']);
  }
  const blocked =
    busy ||
    review ||
    list.isFetching ||
    windowQuery.isError ||
    !assembly?.podeVotar;
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Votar
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
          Conferir votos novamente
        </Button>
      )}
      {(list.isPending || windowQuery.isPending) && (
        <Typography role="status">Carregando…</Typography>
      )}
      {!windowQuery.isPending && !assembly?.podeVotar && (
        <Alert severity="warning">Aguarde o início da Assembleia</Alert>
      )}
      {assembly?.podeVotar && (
        <Alert
          severity="info"
          sx={{ backgroundColor: 'primary.main', color: 'white' }}
        >
          {assembly.pergunta}
        </Alert>
      )}
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{ my: 2, flexWrap: 'wrap' }}
      >
        {choices.map((choice) => (
          <Button
            variant="contained"
            key={choice}
            color={
              choice === 'S' ? 'success' : choice === 'N' ? 'error' : 'warning'
            }
            disabled={blocked || !pendingVotes(list.data ?? []).length}
            onClick={() => void cast(list.data ?? [], choice)}
          >
            {choiceLabels[choice]} para todos
          </Button>
        ))}
      </Stack>
      {busy && <Typography role="status">Enviando votos…</Typography>}
      <Button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Recolher' : 'Expandir'} lista de votos
      </Button>
      <Collapse in={expanded}>
        <TableContainer
          component={Paper}
          tabIndex={0}
          aria-label="Credores e opções de voto"
          sx={{ overflowX: 'auto' }}
        >
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow>
                {[
                  'Nome',
                  'Classe',
                  'Cpf/Cnpj',
                  'Crédito',
                  'Procurador',
                  'Voto',
                ].map((title) => (
                  <TableCell key={title}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {list.data?.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.nomeCredor}</TableCell>
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
                    {row.tipo ? (
                      (choiceLabels[row.tipo as VoteChoice] ?? row.tipo)
                    ) : (
                      <Stack direction="row" spacing={1}>
                        {choices.map((choice) => (
                          <Button
                            key={choice}
                            variant="contained"
                            color={
                              choice === 'S'
                                ? 'success'
                                : choice === 'N'
                                  ? 'error'
                                  : 'warning'
                            }
                            disabled={blocked}
                            onClick={() => void cast([row], choice)}
                          >
                            {choiceLabels[choice]}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
      {!list.isPending && !list.isError && list.data?.length === 0 && (
        <Typography role="status" sx={{ mt: 2 }}>
          Nenhum voto nesta pesquisa.
        </Typography>
      )}
    </>
  );
}
