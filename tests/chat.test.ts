import { expect, it } from 'vitest';
import {
  latestDate,
  mergeMessages,
  messageBody,
  notificationPath,
  readMarkerKey,
  unreadSentinel,
  type Message,
} from '../src/chat/api';
import type { User } from '../src/auth/session-controller';
const user = {
  id: 'fixture:A',
  nome: 'Teste',
  tipo: 0,
  login: 'fixture',
  codigo: 9,
  codigoCredor: 9,
  codigoAssembleia: 5,
  token: 'sintético',
} satisfies User;
it('payload preserva objeto privado vazio e omissão de destinatário, sem ativar envio privado', () => {
  expect(JSON.parse(JSON.stringify(messageBody(user, 6, ' texto ')))).toEqual({
    msg: ' texto ',
  });
});
it('marcadores não se confundem entre identidades/assembleias e não usam chave global antiga', () => {
  expect(readMarkerKey('a:6', 5)).not.toBe(readMarkerKey('a', 6));
  expect(readMarkerKey(user.id, 5)).not.toBe(readMarkerKey(user.id, 6));
  expect(readMarkerKey(user.id, 6)).not.toBe('_chat_notify_last_read');
});
it('poll mantém barras, limite/ordem e cursor temporal original', () => {
  expect(notificationPath(6, unreadSentinel)).toBe(
    '//chats/?codigoAssembleia=6&data__gt=1899-12-30T21:05:19.000Z&sort=data&limit=300',
  );
});
it('eco não duplica mensagem, atualização por id reconcilia e data mantém ordem', () => {
  const a = { _id: 'a', data: '2026-10-18T10:00:00.000Z', msg: 'A' } as Message;
  const b = { _id: 'b', data: '2026-10-18T11:00:00.000Z', msg: 'B' } as Message;
  expect(mergeMessages([b, a], [{ ...a, msg: 'atualizado' }, b])).toEqual([
    { ...a, msg: 'atualizado' },
    b,
  ]);
  expect(latestDate(unreadSentinel, [b, a])).toBe(b.data);
});
