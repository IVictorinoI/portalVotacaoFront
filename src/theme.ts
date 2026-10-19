import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
export const theme = createTheme(
  {
    palette: {
      primary: { main: '#3c8dbc' },
      secondary: { main: '#00a65a' },
      background: { default: '#ecf0f5' },
    },
    typography: { fontFamily: 'Arial, sans-serif' },
    shape: { borderRadius: 8 },
  },
  ptBR,
);
