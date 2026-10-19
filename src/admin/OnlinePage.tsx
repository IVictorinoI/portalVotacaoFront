import { useEffect, useState } from 'react';
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
import { connectedUsers, type ConnectedUser } from './api';
export default function OnlinePage() {
  const session = useReadySession();
  const [users, setUsers] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const socket = session.controller.socket;
    if (!socket) return;
    const off = socket.on('connectedUsers', (value) => {
      if (!session.current()) return;
      const rows = connectedUsers(value);
      if (rows) {
        setUsers(rows);
        setLoading(false);
        setError(false);
      } else setError(true);
    });
    const failure = socket.on('connect_error', () => setError(true));
    const timer = setTimeout(() => socket.emit('getConnectedUsers'), 500);
    return () => {
      off();
      failure();
      clearTimeout(timer);
    };
  }, [session.controller, session.generation]);
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Usuários online
      </Typography>
      {loading && <Typography role="status">Consultando usuários…</Typography>}
      {error && (
        <Alert severity="error">
          Não foi possível atualizar os usuários online.
        </Alert>
      )}
      <Button
        onClick={() => session.controller.socket?.emit('getConnectedUsers')}
      >
        Atualizar usuários
      </Button>
      <Section title="Usuários conectados">
        <TableContainer
          component={Paper}
          tabIndex={0}
          sx={{ overflowX: 'auto' }}
        >
          <Table aria-label="Usuários online">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nome}</TableCell>
                  <TableCell>
                    {session.user.tipo === 1 && (
                      <Button
                        color="error"
                        onClick={() =>
                          session.controller.socket?.emit('expulsarId', user.id)
                        }
                      >
                        Expulsar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
      {!loading && !users.length && (
        <Typography role="status">Nenhum usuário online.</Typography>
      )}
    </>
  );
}
