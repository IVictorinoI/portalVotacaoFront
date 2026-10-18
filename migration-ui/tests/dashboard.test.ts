import { expect, it } from 'vitest';
import {
  cardColor,
  chartColor,
  chartRows,
  percentage,
  type SummaryRow,
} from '../src/dashboard/api';
import { openingTime } from '../src/assembly/api';
const row: SummaryRow = {
  codigoClasse: 1,
  descricaoClasse: 'Classe 1',
  valorEsperado: 100,
  valorConfirmado: 50,
};
it('preserva seis casas, NaN convertido a zero e arredondamento no limiar', () => {
  expect(percentage({ ...row, valorEsperado: 3, valorConfirmado: 2 })).toBe(
    '66.666667',
  );
  expect(percentage({ ...row, valorEsperado: 0, valorConfirmado: 0 })).toBe(
    '0.000000',
  );
  expect(percentage({ ...row, valorConfirmado: 49.9999999 })).toBe('50.000000');
});
it('cores dos cards de votos e do gráfico continuam diferentes entre 50 e 100', () => {
  expect(cardColor('50.000000', true)).toBe('yellow');
  expect(cardColor('50.000000', false)).toBe('green');
  expect(chartColor('50.000000')).toEqual([
    'rgba(75, 192, 192, 0.2)',
    'rgba(75, 192, 192, 1)',
  ]);
  expect(cardColor('0.000000', true)).toBe('red');
  expect(cardColor('100.000000', true)).toBe('green');
});
it('gráfico omite classe ponto e esperado zero, sem eliminar cards válidos', () => {
  expect(
    chartRows([
      row,
      { ...row, codigoClasse: 2, descricaoClasse: '.' },
      { ...row, codigoClasse: 3, valorEsperado: 0 },
    ]),
  ).toEqual([row]);
});
it('abertura conserva recorte local sem aplicar offset do sufixo', () => {
  expect(openingTime('2026-10-18T09:00:00.000Z')).toBe('09:00:00');
  expect(openingTime(undefined)).toBe('');
});
