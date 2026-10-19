import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { record } from '../auth/session-controller';
import { SearchForm } from '../common/SearchForm';
import { money } from '../common/format';
import { Section } from '../common/Section';
import { creditorGroups, readCreditors, type OnlineUser } from './api';
export default function CreditorsPage() {
  const session = useReadySession();
  const [search, setSearch] = useState('');
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const query = useQuery({
    queryKey: session.key('creditors', search),
    queryFn: ({ signal }) =>
      readCreditors(session.http, session.assembly, search, signal),
  });
  useEffect(() => {
    const socket = session.controller.socket;
    if (!socket) return;
    const off = socket.on('connectedUsers', (data) => {
      if (session.current() && Array.isArray(data))
        setOnline(
          data.filter(
            (user: unknown): user is OnlineUser =>
              record(user) && typeof user.codigoCredor === 'number',
          ),
        );
    });
    const timer = setTimeout(() => socket.emit('getConnectedUsers'), 500);
    return () => {
      clearTimeout(timer);
      off();
    };
  }, [session.controller, session.generation]);
  const groups = creditorGroups(
    query.data?.list ?? [],
    query.data?.voting ?? [],
    online,
  );
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Credores
      </Typography>
      <Section title="Pesquisa">
        <SearchForm
          onSearch={(text) => {
            setSearch(text);
            if (text === search) void query.refetch();
          }}
        />
      </Section>
      {query.isPending && <Typography role="status">Carregando…</Typography>}
      {query.isError && (
        <Alert severity="error">
          Não foi possível consultar os credores.{' '}
          <Button onClick={() => void query.refetch()}>
            Consultar novamente
          </Button>
        </Alert>
      )}
      {groups.map((rows, index) =>
        rows.length ? (
          <Section key={index} title={rows[0]?.descricaoClasse ?? ''}>
            <TableContainer
              component={Paper}
              tabIndex={0}
              aria-label={'Credores ' + rows[0]?.descricaoClasse}
              sx={{ overflowX: 'auto' }}
            >
              <Table sx={{ minWidth: 950 }}>
                <TableHead>
                  <TableRow>
                    {[
                      'Online',
                      'Nome',
                      'Classe',
                      'Cpf/Cnpj',
                      'Crédito',
                      'Procurador',
                      'Votou',
                      'Confirmou',
                    ].map((title) => (
                      <TableCell key={title}>{title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        backgroundColor: row.votou
                          ? '#d9edf7'
                          : row.confirmou
                            ? '#dff0d8'
                            : '#f5f5f5',
                      }}
                    >
                      <TableCell>
                        {row.online && (
                          <Box
                            component="span"
                            role="img"
                            aria-label="Online"
                            sx={{
                              display: 'block',
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: 'green',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell>{row.descricaoClasse}</TableCell>
                      <TableCell>{row.cpfCnpj}</TableCell>
                      <TableCell align="right">{money(row.valor)}</TableCell>
                      <TableCell>{row.nomeProcurador}</TableCell>
                      <TableCell>{row.votou ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>{row.confirmou ? 'Sim' : 'Não'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <b>Total</b>
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right">
                      <b>
                        {money(rows.reduce((sum, row) => sum + row.valor, 0))}
                      </b>
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        ) : null,
      )}
      {query.isSuccess && groups.every((rows) => !rows.length) && (
        <Typography role="status">Nenhum credor nesta pesquisa.</Typography>
      )}
    </>
  );
}
