import { Box, Typography } from '@mui/material';
export default function ContactPage() {
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Contato
      </Typography>
      <Box
        component="img"
        src={import.meta.env.BASE_URL + 'logo_login.png'}
        alt="Votação gladius"
        width={256}
        height={115}
        sx={{ maxWidth: '100%', objectFit: 'contain' }}
      />
      <Typography>
        Entre em contato com a Administração Judicial através das vias abaixo:
      </Typography>
      <Typography>Telefones: (48) 3433-8525</Typography>
      <Typography>(48) 9102-5411 – WhatsApp</Typography>
      <Typography sx={{ overflowWrap: 'anywhere' }}>
        E-mail: atendimento@gladiusconsultoria.com.br
      </Typography>
    </>
  );
}
