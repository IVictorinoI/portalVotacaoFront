import {
  lazy,
  Suspense,
  Component,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { useSession } from './auth/Session';
import { ChatProvider, ChatMenuItem } from './chat/ChatState';
import {
  commonMenu,
  consultationMenu,
  hashRoute,
  routes,
} from './navigation/routes';
const AuthPage = lazy(() => import('./auth/AuthPage'));
const PendingPage = lazy(() => import('./navigation/PendingPage'));
const PresencePage = lazy(() => import('./presence/PresencePage'));
const VotingPage = lazy(() => import('./voting/VotingPage'));
const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));
const CreditorsPage = lazy(() => import('./consultations/CreditorsPage'));
const VotesPage = lazy(() => import('./consultations/VotesPage'));
const ResultsPage = lazy(() => import('./results/ResultsPage'));
const LivePage = lazy(() => import('./live/LivePage'));
const MinutesPage = lazy(() => import('./minutes/MinutesPage'));
const ChatPage = lazy(() => import('./chat/ChatPage'));
class PageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Alert severity="error">
        Não foi possível abrir a página.{' '}
        <Button onClick={() => window.location.reload()}>
          Recarregar página
        </Button>
      </Alert>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const { state, controller } = useSession();
  const [route, setRoute] = useState(() => hashRoute(window.location.hash));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const changed = () => {
      const route = hashRoute(window.location.hash);
      setRoute(route);
      if (
        route === '/' &&
        window.location.hash &&
        !['#/', '#'].includes(window.location.hash)
      )
        window.location.replace('#/');
    };
    changed();
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  const waiting = (
    <Box role="status" sx={{ p: 3 }}>
      <CircularProgress size={24} /> Carregando sessão…
    </Box>
  );
  if (state.status === 'checking') return waiting;
  if (state.status === 'anonymous')
    return (
      <PageBoundary>
        <Suspense fallback={waiting}>
          <AuthPage />
        </Suspense>
      </PageBoundary>
    );
  if (state.status === 'scope-error')
    return (
      <Container component="main" sx={{ py: 4 }}>
        <Alert severity="warning">
          Não foi possível identificar uma assembleia ativa. Nenhum escopo salvo
          será utilizado.
        </Alert>
        <Button onClick={() => void controller.retryScope()}>
          Consultar assembleia novamente
        </Button>
        <Button onClick={controller.logout}>Sair</Button>
      </Container>
    );
  function item(path: string) {
    if (path === '/chat')
      return (
        <ChatMenuItem
          key={path}
          selected={route === path}
          onClick={() => setOpen(false)}
        />
      );
    return (
      <ListItemButton
        key={path}
        component="a"
        href={'#' + path}
        selected={route === path}
        onClick={() => setOpen(false)}
      >
        <ListItemText primary={routes[path]} />
      </ListItemButton>
    );
  }
  const navigation = (
    <Box sx={{ width: 240 }}>
      <Typography sx={{ p: 2 }}>Navegação</Typography>
      <List>
        {commonMenu.slice(0, 1).map(item)}
        <Typography sx={{ px: 2 }}>Consultas</Typography>
        {consultationMenu(state.user.tipo).map(item)}
        {commonMenu.slice(1).map(item)}
      </List>
    </Box>
  );
  return (
    <ChatProvider key={state.generation}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Button
            color="inherit"
            onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Abrir navegação"
          >
            Menu
          </Button>
          <Box
            component="img"
            src={import.meta.env.BASE_URL + 'logo.png'}
            alt="Gladius"
            width={35}
            height={35}
          />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Votação Gladius
          </Typography>
          <Box
            component="img"
            src={import.meta.env.BASE_URL + 'profile.png'}
            alt=""
            width={25}
            height={25}
            sx={{ borderRadius: '50%' }}
          />
          <Typography>
            {state.user.nome}
            {state.user.email ? ` · ${state.user.email}` : ''}
          </Typography>
          <Button color="inherit" onClick={controller.logout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 240,
            '& .MuiDrawer-paper': { position: 'relative' },
          }}
        >
          {navigation}
        </Drawer>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          sx={{ display: { md: 'none' } }}
        >
          {navigation}
        </Drawer>
        <Container component="main" maxWidth="lg" sx={{ minWidth: 0, py: 3 }}>
          <Typography sx={{ mb: 2 }} data-testid="assembly">
            Assembleia {state.assembly}
          </Typography>
          <PageBoundary key={route}>
            <Suspense fallback={waiting}>
              {route === '/confirmarPresenca' ? (
                <PresencePage />
              ) : route === '/votar' ? (
                <VotingPage />
              ) : route === '/' ? (
                <DashboardPage />
              ) : route === '/credores' ? (
                <CreditorsPage />
              ) : route === '/votos' ? (
                <VotesPage />
              ) : route === '/resultado' ? (
                <ResultsPage />
              ) : route === '/votacaoTempoReal' ? (
                <LivePage />
              ) : route === '/aprovaAta' ? (
                <MinutesPage />
              ) : route === '/chat' ? (
                <ChatPage />
              ) : (
                <PendingPage title={routes[route] ?? 'Início'} />
              )}
            </Suspense>
          </PageBoundary>
          <Box component="footer" sx={{ mt: 4 }}>
            Copyright © 2020{' '}
            <a
              href="http://www.gladiusconsultoria.com.br/"
              target="_blank"
              rel="noreferrer"
            >
              Gladius
            </a>
            .
          </Box>
        </Container>
      </Box>
    </ChatProvider>
  );
}
