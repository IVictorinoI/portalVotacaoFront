import { Paper, Typography } from '@mui/material';
export default function PendingPage({ title }: { title: string }) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography component="h1" variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography>
        Esta versão está em preparação. Os recursos de votação ainda não estão
        disponíveis aqui.
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Continue utilizando a versão atual do portal.
      </Typography>
    </Paper>
  );
}
