import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const builtRoot = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
export async function createDistServer(directory = builtRoot) {
  const root = await realpath(directory);
  if (!(await stat(path.join(root, 'index.html'))).isFile())
    throw new Error(
      'Build dist sem index.html. Execute build antes de iniciar.',
    );
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname,
      );
      const segments = pathname.split('/');
      if (
        pathname.includes('\\') ||
        pathname.includes('\0') ||
        segments.some((part) => part.startsWith('.'))
      ) {
        res.writeHead(404).end();
        return;
      }
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      const target = await realpath(path.resolve(root, relative));
      if (
        !target.startsWith(root + path.sep) ||
        !(await stat(target)).isFile()
      ) {
        res.writeHead(404).end();
        return;
      }
      const details = await stat(target);
      const hashed =
        relative.startsWith('assets/') &&
        /-[a-zA-Z0-9_-]{8,}\.[a-z0-9]+$/.test(relative);
      res.writeHead(200, {
        'Content-Type':
          mime[path.extname(target)] ?? 'application/octet-stream',
        'Content-Length': details.size,
        'Cache-Control': hashed
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = createReadStream(target);
      stream.on('error', () => res.destroy());
      stream.pipe(res);
    } catch {
      if (!res.headersSent) res.writeHead(404);
      res.end();
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const port = Number(process.env.PORT ?? 18184);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT inválida.');
  const server = await createDistServer();
  server.on('error', () => {
    console.error('Não foi possível iniciar servidor dist.');
    process.exitCode = 1;
  });
  server.listen(port, process.env.HOST ?? '127.0.0.1', () =>
    console.log('Frontend dist pronto na porta ' + port),
  );
}
