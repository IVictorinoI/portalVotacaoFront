import { useState, type ReactNode } from 'react';
import { Box, Button, Collapse, Typography } from '@mui/material';
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Box component="section" sx={{ my: 2, minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography component="h2" variant="h6">
          {title}
        </Typography>
        <Button
          aria-label={(open ? 'Recolher ' : 'Expandir ') + title}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '−' : '+'}
        </Button>
      </Box>
      <Collapse in={open}>{children}</Collapse>
    </Box>
  );
}
