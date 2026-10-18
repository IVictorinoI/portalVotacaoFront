import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
const routes: Record<string, string> = {
  '/': 'Início',
  '/assembleias': 'Assembleias',
  '/classes': 'Classes',
  '/credores': 'Credores',
  '/votos': 'Votos',
  '/confirmarPresenca': 'Confirmar presença',
  '/votar': 'Votar',
  '/login': 'Login legado',
  '/votacaoTempoReal': 'Votação em tempo real',
  '/chat': 'Chat',
  '/online': 'Usuários online',
  '/logacesso': 'Logs de acesso',
  '/notificacoes': 'Notificações',
  '/resultado': 'Resultado',
  '/aprovaAta': 'Aprovação da ata',
  '/Contato': 'Contato',
  '/contato': 'Contato',
  '/links': 'Links',
  '/links-uteis': 'Links úteis',
};
export default function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || '/',
  );
  useEffect(() => {
    const changed = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  const title = routes[route];
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              component="img"
              src={import.meta.env.BASE_URL + 'logo.png'}
              alt="Gladius"
              width={35}
              height={35}
            />
            <Typography variant="h6" component="span">
              Votação Gladius
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ py: 5 }}>
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography component="h1" variant="h4" gutterBottom>
            {title ?? 'Página não encontrada'}
          </Typography>
          <Typography>
            Esta versão está em preparação. Os recursos de votação ainda não
            estão disponíveis aqui.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Continue utilizando a versão atual do portal.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
