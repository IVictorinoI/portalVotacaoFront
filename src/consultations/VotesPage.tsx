import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Typography } from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { SearchForm } from '../common/SearchForm';
import { Section } from '../common/Section';
import { readVotes } from './api';
import { VotesTable } from './VotesTable';
export default function VotesPage() {
  const session = useReadySession();
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: session.key('voteConsultation', search),
    queryFn: ({ signal }) =>
      readVotes(session.http, session.assembly, search, signal),
  });
  const rows = query.data?.filter((row) => row.tipo) ?? [];
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Votos
      </Typography>
      <Section title="Pesquisa de votos">
        <SearchForm
          onSearch={(text) => {
            setSearch(text);
            if (text === search) void query.refetch();
          }}
        />
        {query.isPending && <Typography role="status">Carregando…</Typography>}
        {query.isError && (
          <Alert severity="error">
            Não foi possível consultar os votos.{' '}
            <Button onClick={() => void query.refetch()}>
              Consultar novamente
            </Button>
          </Alert>
        )}
        {!!rows.length && <VotesTable rows={rows} />}
        {query.isSuccess && !rows.length && (
          <Typography role="status">
            Nenhum voto computado até o momento. Aqui você poderá acompanhar os
            votos de todos os credores
          </Typography>
        )}
      </Section>
    </>
  );
}
