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
import { Section } from '../common/Section';
import { historicalTime } from '../common/format';
import { readLogs } from './api';
export default function LogsPage() {
  const session = useReadySession();
  const query = useQuery({
    queryKey: session.key('logs'),
    queryFn: ({ signal }) => readLogs(session.http, session.assembly, signal),
  });
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Logs de acesso
      </Typography>
      <Button
        color="error"
        variant="contained"
        onClick={() => session.controller.socket?.emit('expulsarTodos')}
      >
        Expulsar todos
      </Button>
      {query.isPending && <Typography role="status">Carregando…</Typography>}
      {query.isError && (
        <Alert severity="error">
          Não foi possível consultar os logs.{' '}
          <Button onClick={() => void query.refetch()}>
            Consultar novamente
          </Button>
        </Alert>
      )}
      <Section title="Acessos">
        <TableContainer
          component={Paper}
          tabIndex={0}
          sx={{ overflowX: 'auto' }}
        >
          <Table aria-label="Logs de acesso" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {['Nome', 'Hora login', 'Ultimo acesso', 'Operação'].map(
                  (title) => (
                    <TableCell key={title}>{title}</TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data?.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{
                    backgroundColor:
                      row.tipo === 0
                        ? '#dff0d8'
                        : row.tipo === 1
                          ? '#f2dede'
                          : 'inherit',
                  }}
                >
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{historicalTime(row.data)}</TableCell>
                  <TableCell>{historicalTime(row.dataUltimoAcesso)}</TableCell>
                  <TableCell>{row.tipo == 0 ? 'Login' : 'Logout'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
      {query.isSuccess && !query.data.length && (
        <Typography role="status">Nenhum acesso registrado.</Typography>
      )}
    </>
  );
}
