import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSession } from './Session';
import { errorMessages } from '../lib/http';
import { record } from './session-controller';
export default function AuthPage() {
  const { controller } = useSession();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ login: string; senha: string }>({
    defaultValues: { login: '', senha: '' },
  });
  const [messages, setMessages] = useState<string[]>([]);
  return (
    <Container component="main" maxWidth="xs" sx={{ py: 5 }}>
      <Box
        component="img"
        src={import.meta.env.BASE_URL + 'logo_login.png'}
        alt="Gladius"
        width={256}
        height={115}
        sx={{
          display: 'block',
          mx: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
        }}
      />
      <Typography component="h1" variant="h6" align="center" sx={{ my: 2 }}>
        Bem-Vindo ao Sistema de Assembleia Online da Gladius Consultoria
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ mb: 2 }}>
          Digite o login e senha enviados previamente por e-mail
        </Typography>
        {messages.map((message, index) => (
          <Alert severity="error" key={index} sx={{ mb: 1 }}>
            {message}
          </Alert>
        ))}
        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit(async (values) => {
            setMessages([]);
            try {
              await controller.login(values);
            } catch (error) {
              if (
                record(error) &&
                record(error.response) &&
                record(error.response.data) &&
                Array.isArray(error.response.data.errors)
              )
                setMessages(errorMessages(error));
              else window.location.reload(); // Política original; M2 continua pendente.
            }
          })}
        >
          <TextField
            label="Login"
            autoComplete="username"
            {...register('login')}
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="current-password"
            {...register('senha')}
          />
          <Button variant="contained" type="submit" aria-busy={isSubmitting}>
            Entrar
          </Button>
        </Stack>
      </Paper>
      <Typography sx={{ mt: 3 }}>
        Caso não consiga acessar o sistema, entre em contato com a Administração
        Judicial através das vias abaixo:
      </Typography>
      <Typography>
        Telefones: (48) 3433-8525
        <br />
        (48) 9102-5411 – WhatsApp
        <br />
        E-mail: atendimento@gladiusconsultoria.com.br
      </Typography>
    </Container>
  );
}
