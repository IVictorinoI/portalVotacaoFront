import { expect, it } from 'vitest';
import {
  approvalColor,
  minuteGroups,
  signedCount,
  type Minute,
} from '../src/minutes/api';
it('caracteriza Me/Epp original: conta todos os registros, outras classes apenas aprovados (D3)', () => {
  const rows = [
    { _id: 'a', codigoClasse: 1, nomeCredor: 'A', aprovou: false },
    { _id: 'b', codigoClasse: 4, nomeCredor: 'B', aprovou: false },
  ] as Minute[];
  const groups = minuteGroups(rows);
  expect(signedCount(groups[0] ?? [], 1)).toBe(0);
  expect(signedCount(groups[3] ?? [], 4)).toBe(1);
});
it('cor preserva limiar >=2 ou total, não percentual de aprovação', () => {
  expect(approvalColor(2, 100)).toBe('green');
  expect(approvalColor(1, 100)).toBe('yellow');
  expect(approvalColor(0, 10)).toBe('gray');
  expect(approvalColor(1, 1)).toBe('green');
});
