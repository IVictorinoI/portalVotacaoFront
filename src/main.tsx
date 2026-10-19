import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Container, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { readConfig, type AppConfig } from './lib/config';
import { InfrastructureProvider } from './lib/Infrastructure';
import { createQueryClient } from './lib/query';
import { theme } from './theme';
import App from './App';
import { SessionProvider } from './auth/Session';
const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz ausente.');
let config: AppConfig | null = null;
try {
  config = readConfig(import.meta.env);
} catch {
  // Erro de configuração será exibido sem iniciar serviços.
}
const queryClient = createQueryClient();
createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!config ? (
        <Container component="main" sx={{ py: 4 }}>
          <Typography component="h1" variant="h4">
            Portal indisponível
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            A configuração desta versão precisa ser revisada.
          </Alert>
          <Typography sx={{ mt: 2 }} role="status">
            Entre em contato com a administração do portal.
          </Typography>
        </Container>
      ) : (
        <QueryClientProvider client={queryClient}>
          <InfrastructureProvider config={config}>
            <SessionProvider>
              <App />
            </SessionProvider>
          </InfrastructureProvider>
        </QueryClientProvider>
      )}
    </ThemeProvider>
  </StrictMode>,
);
