import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Typography } from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { readAssembly } from '../assembly/api';
import { Section } from '../common/Section';
import { VotesTable } from '../consultations/VotesTable';
import { readLive, type LiveFeed } from './api';
export default function LivePage() {
  const session = useReadySession();
  const cache = useQueryClient();
  const key = session.key('liveVotes');
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      readLive(
        session.http,
        session.assembly,
        cache.getQueryData<LiveFeed>(key) ?? { rows: [], cursor: 0 },
        signal,
      ),
    refetchInterval: (state) => (state.state.status === 'error' ? false : 3000),
  });
  const assembly = useQuery({
    queryKey: session.key('assembly'),
    queryFn: ({ signal }) =>
      readAssembly(session.http, session.assembly, signal),
  });
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Votação em tempo real
      </Typography>
      {assembly.data?.podeVotar && (
        <Alert severity="success">{assembly.data.pergunta}</Alert>
      )}
      {query.isPending && <Typography role="status">Carregando…</Typography>}
      {(query.isError || assembly.isError) && (
        <Alert severity="error">
          Não foi possível acompanhar os votos.{' '}
          <Button
            onClick={() => {
              void query.refetch();
              void assembly.refetch();
            }}
          >
            Consultar novamente
          </Button>
        </Alert>
      )}
      <Section title="Votos">
        <VotesTable rows={query.data?.rows ?? []} live />
      </Section>
      {query.isSuccess && !query.data.rows.length && (
        <Typography role="status">Nenhum voto recebido.</Typography>
      )}
    </>
  );
}
