import { it, expect } from 'vitest';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server } from 'socket.io';
import { createSocket } from '../src/lib/socket';
it('cliente 2.3 conecta namespace original /api/ com servidor sintético 2.3, EIO3', async () => {
  const server = createServer();
  const io = new Server(server, { serveClient: false });
  const namespace = io.of('/api/');
  const handshakes: string[] = [];
  namespace.on('connection', (socket) => {
    expect(socket.handshake.auth).toEqual({ token: 'token-sintetico' });
    handshakes.push(socket.request.url ?? '');
    socket.emit('getUser', {});
    socket.on('setUser', () =>
      socket.emit('connectedUsers', [{ id: 'fixture-local' }]),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const client = createSocket(
    'http://127.0.0.1:' + port + '/api/',
    'token-sintetico',
  );
  try {
    expect(handshakes).toEqual([]); // construir adapter não abre rede
    const response = new Promise<unknown>((resolve, reject) => {
      client.on('connect_error', reject);
      client.on('getUser', () => client.emit('setUser'));
      client.on('connectedUsers', resolve);
    });
    client.connect();
    await expect(response).resolves.toEqual([{ id: 'fixture-local' }]);
    expect(handshakes).toHaveLength(1);
    expect(handshakes[0]).toContain('EIO=4');
  } finally {
    client.disconnect();
    await new Promise<void>((resolve) => io.close(() => resolve()));
  }
});
