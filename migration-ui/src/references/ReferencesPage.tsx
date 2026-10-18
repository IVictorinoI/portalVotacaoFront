import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
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
import { SearchForm } from '../common/SearchForm';
import { assemblyUrl, readRows, type ReferenceRow } from './api';
export default function ReferencesPage({
  kind,
}: {
  kind: 'assembleias' | 'classes';
}) {
  const session = useReadySession();
  const [search, setSearch] = useState('');
  const assembly = kind === 'assembleias';
  const query = useQuery({
    queryKey: session.key(kind, search),
    queryFn: ({ signal }) =>
      readRows<ReferenceRow>(
        session.http,
        assembly ? assemblyUrl(search) : '/classes?sort=-_id',
        signal,
      ),
  });
  const title = assembly ? 'Assembleias' : 'Classes';
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {title}
      </Typography>
      {assembly && (
        <SearchForm
          label="Pesquise a assembléia"
          onSearch={(text) => {
            setSearch(text);
            if (text === search) void query.refetch();
          }}
        />
      )}
      {query.isPending && <Typography role="status">Carregando…</Typography>}
      {query.isError && (
        <Alert severity="error">
          Não foi possível consultar.{' '}
          <Button onClick={() => void query.refetch()}>
            Consultar novamente
          </Button>
        </Alert>
      )}
      <TableContainer component={Paper} tabIndex={0} sx={{ overflowX: 'auto' }}>
        <Table aria-label={title} sx={{ minWidth: assembly ? 650 : 320 }}>
          <TableHead>
            <TableRow>
              {(assembly
                ? ['Descrição', 'Assunto', 'Data', 'Ativa']
                : ['Descrição', 'Cálculo']
              ).map((label) => (
                <TableCell key={label}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {query.data?.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.descricao}</TableCell>
                {assembly ? (
                  <>
                    <TableCell>{row.assunto}</TableCell>
                    <TableCell>{row.data}</TableCell>
                    <TableCell>{row.ativo ? 'Sim' : 'Não'}</TableCell>
                  </>
                ) : (
                  <TableCell>
                    {row.tipo === 'P' ? 'Percentual' : 'Unitário'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {query.isSuccess && !query.data.length && (
        <Typography role="status">Nenhum registro nesta pesquisa.</Typography>
      )}
    </>
  );
}
