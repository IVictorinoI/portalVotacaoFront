import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
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
import { readActive } from '../dashboard/api';
import {
  readResults,
  resultMode,
  resultMoney,
  resultPercent,
  type Result,
} from './api';
function amounts(row: Result, choice: 'Sim' | 'Nao' | 'Abs') {
  const value = resultMoney(
    row[('valor' + choice) as 'valorSim' | 'valorNao' | 'valorAbs'],
  );
  const quantity =
    row[('quant' + choice) as 'quantSim' | 'quantNao' | 'quantAbs'];
  const mode = resultMode(row);
  return mode === 'value' ? (
    value
  ) : mode === 'quantity' ? (
    quantity
  ) : (
    <>
      <div>{value}</div>
      <div>{quantity}</div>
    </>
  );
}
function percentages(row: Result, choice: 'Sim' | 'Nao') {
  const value = resultPercent(
    row[('percValor' + choice) as 'percValorSim' | 'percValorNao'],
  );
  const quantity = resultPercent(
    row[('percQuant' + choice) as 'percQuantSim' | 'percQuantNao'],
  );
  const mode = resultMode(row);
  return mode === 'value' ? (
    value
  ) : mode === 'quantity' ? (
    quantity
  ) : (
    <>
      <div>{value}</div>
      <div>{quantity}</div>
    </>
  );
}
function Subtotal({ first }: { first: Result }) {
  const cards = [
    {
      label: 'Sim',
      value: resultMoney(first.valorSubTotalSim),
      highlight: (first.valorSubTotalSim ?? 0) > (first.valorSubTotalNao ?? 0),
    },
    {
      label: 'Não',
      value: resultMoney(first.valorSubTotalNao),
      highlight: (first.valorSubTotalNao ?? 0) > (first.valorSubTotalSim ?? 0),
    },
    {
      label: 'Sim',
      value: resultPercent(first.percSubTotalSim),
      highlight: (first.percSubTotalSim ?? 0) > (first.percSubTotalNao ?? 0),
    },
    {
      label: 'Não',
      value: resultPercent(first.percSubTotalNao),
      highlight: (first.percSubTotalNao ?? 0) > (first.percSubTotalSim ?? 0),
    },
    {
      label: 'Total geral',
      value: resultMoney(first.valorTotalGeral),
      highlight: true,
    },
  ];
  return (
    <Section title="Subtotal">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' },
          gap: 2,
        }}
      >
        {cards.map((card, i) => (
          <Paper
            key={i}
            sx={{
              p: 3,
              backgroundColor: card.highlight ? '#f39c12' : 'background.paper',
              color: '#111',
            }}
          >
            <Typography variant="h5">{card.value}</Typography>
            <Typography variant="h6">{card.label}</Typography>
          </Paper>
        ))}
      </Box>
    </Section>
  );
}
export default function ResultsPage() {
  const session = useReadySession();
  const query = useQuery({
    queryKey: session.key('results'),
    queryFn: ({ signal }) =>
      readResults(session.http, session.assembly, signal),
  });
  const active = useQuery({
    queryKey: session.key('activeAssembly'),
    queryFn: ({ signal }) => readActive(session.http, signal),
  });
  useEffect(() => {
    if (
      active.isSuccess &&
      active.data?.codigo !== session.assembly &&
      session.current()
    )
      void session.controller.retryScope();
  }, [
    active.isSuccess,
    active.data?.codigo,
    session.assembly,
    session.controller,
  ]);
  const first = query.data?.[0];
  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Resultado
      </Typography>
      {(query.isPending || active.isPending) && (
        <Typography role="status">Carregando…</Typography>
      )}
      {(query.isError || active.isError) && (
        <Alert severity="error">
          Não foi possível consultar o resultado.{' '}
          <Button
            onClick={() => {
              void query.refetch();
              void active.refetch();
            }}
          >
            Consultar novamente
          </Button>
        </Alert>
      )}
      {first && (
        <Section title="Pergunta">
          <Typography variant="h5" sx={{ textAlign: 'center' }}>
            {active.data?.pergunta}
          </Typography>
        </Section>
      )}
      {first?.tipoResultado === 'V' ? (
        <Subtotal first={first} />
      ) : (
        <Section title="Detalhamento por classe">
          <TableContainer
            component={Paper}
            tabIndex={0}
            aria-label="Resultado por classe"
            sx={{ overflowX: 'auto' }}
          >
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow>
                  {[
                    'Classe',
                    'Valor crédito',
                    'Credores',
                    'Valor Sim',
                    'Valor Não',
                    'Valor Abs',
                    'SIM (%)',
                    'NÃO (%)',
                  ].map((title) => (
                    <TableCell key={title}>{title}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data?.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row.descricaoClasse}</TableCell>
                    <TableCell align="right">
                      {resultMoney(row.valorCredito)}
                    </TableCell>
                    <TableCell align="right">{row.quantCredores}</TableCell>
                    <TableCell align="right">{amounts(row, 'Sim')}</TableCell>
                    <TableCell align="right">{amounts(row, 'Nao')}</TableCell>
                    <TableCell align="right">{amounts(row, 'Abs')}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor:
                          row.percValorSim! > row.percValorNao!
                            ? '#f39c12'
                            : undefined,
                      }}
                    >
                      {percentages(row, 'Sim')}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor:
                          row.percValorNao! > row.percValorSim!
                            ? '#f39c12'
                            : undefined,
                      }}
                    >
                      {percentages(row, 'Nao')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      )}
      {query.isSuccess && !first && (
        <Typography role="status">Nenhum resultado disponível.</Typography>
      )}
    </>
  );
}
