import { useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Collapse, Paper, Typography } from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import { openingTime } from '../assembly/api';
import {
  cardColor,
  chartColor,
  chartRows,
  percentage,
  readActive,
  readSummary,
  type SummaryRow,
} from './api';
function Panel({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Paper component="section" sx={{ p: 2, my: 2, minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
    </Paper>
  );
}
const colors = { red: '#dd4b39', yellow: '#f39c12', green: '#00a65a' };
function Cards({
  rows,
  votes = false,
}: {
  rows: SummaryRow[];
  votes?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2,1fr)',
          lg: 'repeat(4,1fr)',
        },
        gap: 2,
        mt: 2,
      }}
    >
      {rows
        .filter((row) => row.descricaoClasse !== '.')
        .map((row) => {
          const percent = percentage(row);
          const color = cardColor(percent, votes);
          return (
            <Box
              key={row.codigoClasse}
              data-testid={votes ? 'vote-card' : 'quorum-card'}
              data-color={color}
              sx={{ p: 2, backgroundColor: colors[color], color: '#111' }}
            >
              <Typography component="h3" variant="subtitle1">
                {row.descricaoClasse}
              </Typography>
              <Typography>
                {row.valorEsperado.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}{' '}
                <small>
                  {votes ? 'Credores presentes' : 'Credores sujeitos'}
                </small>
              </Typography>
              <Typography>
                {row.valorConfirmado.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}{' '}
                <small>
                  {votes ? 'Votos computados' : 'Credores presentes'}
                </small>
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{percent}%</Typography>
            </Box>
          );
        })}
    </Box>
  );
}
function Bars({ rows, title }: { rows: SummaryRow[]; title: string }) {
  const visible = chartRows(rows);
  const segment = 540 / Math.max(visible.length, 1);
  return (
    <Box
      tabIndex={0}
      aria-label={'Rolagem do ' + title}
      sx={{ overflowX: 'auto', minWidth: 0, maxWidth: '100%' }}
    >
      <svg
        viewBox="0 0 600 400"
        width="100%"
        style={{ minWidth: 400, display: 'block' }}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <text x="300" y="20" textAnchor="middle" fontSize="14">
          {title.includes('quórum') ? '% dos presentes' : '% dos votos'}
        </text>
        {[0, 25, 50, 75, 100].map((tick) => (
          <line
            key={tick}
            x1="30"
            x2="570"
            y1={300 - tick * 2.5}
            y2={300 - tick * 2.5}
            stroke="#ddd"
          />
        ))}
        {visible.map((row, index) => {
          const percent = percentage(row);
          const [fill, stroke] = chartColor(percent);
          const height = Math.max(0, Math.min(100, +percent)) * 2.5;
          const center = 30 + segment * (index + 0.5);
          return (
            <g
              key={row.codigoClasse}
              data-testid="chart-bar"
              data-value={percent}
            >
              <rect
                x={center - segment * 0.3}
                y={300 - height}
                width={segment * 0.6}
                height={height}
                fill={fill}
                stroke={stroke}
              >
                <title>
                  {row.descricaoClasse}: {percent}%
                </title>
              </rect>
              <text
                x={center}
                y={Math.max(40, 290 - height)}
                textAnchor="middle"
                fontSize="14"
              >
                {(+percent).toLocaleString('pt-BR', {
                  maximumFractionDigits: 0,
                })}
                %
              </text>
              <text x={center} y="325" textAnchor="middle" fontSize="12">
                {row.descricaoClasse
                  .split(' ')
                  .reduce<string[]>((lines, word) => {
                    const last = lines.at(-1);
                    if (last && last.length + word.length < 17)
                      lines[lines.length - 1] = last + ' ' + word;
                    else lines.push(word);
                    return lines;
                  }, [])
                  .map((line, i) => (
                    <tspan key={i} x={center} dy={i ? 15 : 0}>
                      {line}
                    </tspan>
                  ))}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}
export default function DashboardPage() {
  const session = useReadySession();
  const active = useQuery({
    queryKey: session.key('activeAssembly'),
    queryFn: ({ signal }) => readActive(session.http, signal),
  });
  const summary = useQuery({
    queryKey: session.key('dashboard'),
    queryFn: ({ signal }) => readSummary(session.http, signal),
    refetchInterval: 10000,
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
  const assembly = active.data;
  return (
    <>
      <Typography component="h1" variant="h4">
        Início
      </Typography>
      {(active.isError || summary.isError) && (
        <Alert severity="error">
          Não foi possível consultar o dashboard.{' '}
          <Button
            onClick={() => {
              void active.refetch();
              void summary.refetch();
            }}
          >
            Consultar novamente
          </Button>
        </Alert>
      )}
      {(active.isPending || summary.isPending) && (
        <Typography role="status">Carregando…</Typography>
      )}
      <Typography component="h2" variant="h5" sx={{ mt: 2 }}>
        {assembly?.descricao}
      </Typography>
      <Typography>{assembly?.assunto}</Typography>
      <Paper sx={{ p: 2, my: 2 }}>
        <Typography>Previsão de início</Typography>
        <Typography>
          Credenciamento <b>{openingTime(assembly?.inicioConfPres)}</b>
        </Typography>
        <Typography>
          Início da Assembéia <b>{openingTime(assembly?.inicioVotacao)}</b>
        </Typography>
      </Paper>
      {summary.data && (
        <>
          <Panel title="Verificação do quorum">
            <Cards rows={summary.data.quorum2} />
          </Panel>
          <Panel title="Verificação dos votos">
            <Cards rows={summary.data.votos2} votes />
          </Panel>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0,1fr)',
                lg: 'repeat(2,minmax(0,1fr))',
              },
              gap: 2,
            }}
          >
            <Panel title="Gráfico de quorum">
              <Bars rows={summary.data.quorum2} title="Gráfico de quórum" />
            </Panel>
            <Panel title="Gráfico de votos">
              <Bars rows={summary.data.votos2} title="Gráfico de votos" />
            </Panel>
          </Box>
          {!summary.data.quorum2.length && !summary.data.votos2.length && (
            <Typography role="status">
              Nenhum dado disponível para esta assembleia.
            </Typography>
          )}
        </>
      )}
    </>
  );
}
