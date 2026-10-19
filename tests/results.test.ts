import { expect, it } from 'vitest';
import {
  resultMode,
  resultMoney,
  resultPercent,
  type Result,
} from '../src/results/api';
it('classes 1/4 alternam valor/quantidade conforme tipo; 2/3 exibem ambos', () => {
  for (const codigoClasse of [1, 4]) {
    expect(resultMode({ codigoClasse, tipoResultado: 'V' } as Result)).toBe(
      'value',
    );
    expect(resultMode({ codigoClasse, tipoResultado: 'Q' } as Result)).toBe(
      'quantity',
    );
  }
  for (const codigoClasse of [2, 3])
    expect(resultMode({ codigoClasse, tipoResultado: 'V' } as Result)).toBe(
      'both',
    );
});
it('formatadores preservam fallback original de zero e seis casas, sem recalcular apuração', () => {
  expect(resultMoney(undefined)).toBe('R$ 0,00');
  expect(resultPercent(66.666666)).toBe('66,666666%');
  expect(resultPercent(undefined)).toBe('0,0000%');
});
