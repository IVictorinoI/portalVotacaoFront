export function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function decimal(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}
export function historicalTime(value: string | undefined) {
  return value === '1899-12-30T00:00:00.000Z'
    ? ''
    : value
      ? new Date(value).toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour12: false,
        })
      : '';
}
