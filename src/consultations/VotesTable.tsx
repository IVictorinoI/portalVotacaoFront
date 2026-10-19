import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { decimal, historicalTime, money } from '../common/format';
import { choiceLabels, type Vote, type VoteChoice } from '../voting/api';
export function VotesTable({
  rows,
  live = false,
}: {
  rows: Vote[];
  live?: boolean;
}) {
  return (
    <TableContainer
      component={Paper}
      tabIndex={0}
      aria-label={live ? 'Votos em tempo real' : 'Votos computados'}
      sx={{ overflowX: 'auto' }}
    >
      <Table sx={{ minWidth: 850 }}>
        <TableHead>
          <TableRow>
            {[
              'Nome',
              'Valor',
              'Percentual',
              'Classe',
              'Voto',
              'Horário',
              'Procurador',
            ].map((title) => (
              <TableCell key={title}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row._id}
              sx={
                live
                  ? {
                      backgroundColor:
                        row.tipo === 'S'
                          ? '#dff0d8'
                          : row.tipo === 'N'
                            ? '#f2dede'
                            : row.tipo === 'A'
                              ? '#f5f5f5'
                              : 'inherit',
                    }
                  : {}
              }
            >
              <TableCell>{row.nomeCredor}</TableCell>
              <TableCell align="right">{money(row.valor)}</TableCell>
              <TableCell align="right">
                {typeof row.percentualClasse === 'number'
                  ? decimal(row.percentualClasse)
                  : ''}
              </TableCell>
              <TableCell>{row.descricaoClasse}</TableCell>
              <TableCell>
                {choiceLabels[row.tipo as VoteChoice] ?? ''}
              </TableCell>
              <TableCell>{historicalTime(row.data)}</TableCell>
              <TableCell>{row.nomeProcurador}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
