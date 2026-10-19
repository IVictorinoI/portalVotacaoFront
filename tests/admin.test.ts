import { expect, it } from 'vitest';
import { connectedUsers, notificationUrl } from '../src/admin/api';
it('notificações preservam regex/lido e não recebem escopo novo na URL', () => {
  expect(notificationUrl('Ana', true)).toBe(
    '/notificacoes?sort=-_id&mensagem__regex=/Ana/&lido=false',
  );
  expect(notificationUrl('', false)).toBe('/notificacoes?sort=-_id');
});
it('usuários de socket inválidos não substituem lista conhecida por dados sem identidade', () => {
  expect(connectedUsers([{ id: 'fixture', nome: 'Teste' }])).toEqual([
    { id: 'fixture', nome: 'Teste' },
  ]);
  expect(connectedUsers([{ nome: 'Sem id' }])).toBeNull();
  expect(connectedUsers({ users: [] })).toBeNull();
});
