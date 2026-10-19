import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { historicalTime } from '../common/format';
import { errorMessages } from '../lib/http';
import {
  mergeMessages,
  message,
  messageBody,
  readHistory,
  type Message,
} from './api';
import { useChat } from './ChatState';
export default function ChatPage() {
  const session = useReadySession();
  const chat = useChat();
  const cache = useQueryClient();
  const historyKey = session.key('chatHistory');
  const form = useForm<{ message: string }>({ defaultValues: { message: '' } });
  const [sending, setSending] = useState(false);
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const busy = useRef(false);
  const mounted = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const query = useQuery({
    queryKey: historyKey,
    queryFn: async ({ signal }) => {
      const rows = await readHistory(session.http, session.assembly, signal);
      return mergeMessages(
        rows,
        cache.getQueryData<Message[]>(historyKey) ?? [],
      );
    },
  });
  useEffect(() => {
    mounted.current = true;
    chat.reading(true);
    return () => {
      mounted.current = false;
      chat.reading(false);
    };
  }, []);
  useEffect(() => {
    if (query.data && session.current()) {
      chat.markRead(query.data);
      if (log.current) log.current.scrollTop = log.current.scrollHeight;
    }
  }, [query.data]);
  useEffect(() => {
    if (!sending) form.setFocus('message');
  }, [sending, form.setFocus]);
  const current = () => mounted.current && session.current();
  async function reread() {
    const result = await query.refetch();
    if (current() && !result.isError) setReview(false);
  }
  async function send(text: string) {
    if (!text || busy.current || review || !current()) return;
    busy.current = true;
    setSending(true);
    setErrors([]);
    try {
      const response = await session.http.post<unknown>(
        '/chats/',
        messageBody(session.user, session.assembly, text),
      );
      if (!current()) return;
      const row = message(response.data);
      if (!row) throw new Error('Resposta de envio inválida.');
      chat.accept(row);

      form.reset({ message: '' });
    } catch (error: unknown) {
      if (current()) {
        setReview(true);
        setErrors([
          ...errorMessages(error),
          'Envio não confirmado. Confira o histórico antes de tentar novamente; o rascunho foi mantido.',
        ]);
        await reread();
      }
    } finally {
      busy.current = false;
      if (current()) setSending(false);
    }
  }
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Chat
      </Typography>
      {errors.map((error, i) => (
        <Alert severity="error" key={i}>
          {error}
        </Alert>
      ))}
      {(query.isError || chat.error) && (
        <Alert severity="error">
          Não foi possível consultar as mensagens.{' '}
          <Button
            onClick={() => {
              void reread();
              chat.retry();
            }}
          >
            Consultar novamente
          </Button>
        </Alert>
      )}
      {query.isPending && <Typography role="status">Carregando…</Typography>}
      <Box
        ref={log}
        role="log"
        aria-label="Mensagens da assembleia"
        aria-live="polite"
        tabIndex={0}
        sx={{
          height: 'min(55vh,500px)',
          minHeight: 200,
          overflowY: 'auto',
          my: 2,
          p: 1,
          border: '1px solid #ddd',
        }}
      >
        {query.data?.map((row) => (
          <Paper
            key={row._id}
            sx={{
              p: 2,
              my: 1,
              width: { xs: '95%', sm: '60%' },
              ml: row.idUsuario === session.user.id ? 0 : 'auto',
              backgroundColor:
                row.idUsuario === session.user.id ? '#3c8dbc' : '#00a65a',
              color: '#111',
              overflowWrap: 'anywhere',
            }}
          >
            <Typography component="span" sx={{ fontWeight: 700 }}>
              {row.nomeCredor}
            </Typography>{' '}
            {historicalTime(row.data)}
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{row.msg}</Typography>
          </Paper>
        ))}
        {query.isSuccess && !query.data.length && (
          <Typography>Nenhuma mensagem.</Typography>
        )}
      </Box>
      <Stack
        component="form"
        direction="row"
        spacing={1}
        onSubmit={form.handleSubmit(({ message }) => send(message))}
      >
        <TextField
          label="Digite sua mensagem"
          placeholder="Digite sua mensagem"
          autoComplete="off"
          fullWidth
          disabled={sending}
          {...form.register('message')}
        />
        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={sending || review}
        >
          Enviar
        </Button>
      </Stack>
      {sending && <Typography role="status">Enviando…</Typography>}
      {review && (
        <Button onClick={() => void reread()}>Conferir histórico</Button>
      )}
    </>
  );
}
