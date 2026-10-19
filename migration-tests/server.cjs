// Compila somente o frontend atual se sua implementação coincidir com a referência.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const {verifyOriginal, original, repository} = require('./original.cjs');
const root = verifyOriginal();
process.chdir(root);
const out = path.join(__dirname, '.baseline');
fs.mkdirSync(out, { recursive: true });
const config = require(path.join(root, 'webpack.config.js'));
config.output = { ...config.output, path: out };
// Config original + otimização production do script original, sem tocar em public.
const webpack = require(path.join(root, 'node_modules/webpack'));
config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
webpack(config, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ colors: false })); process.exitCode = 1; return;
  }
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ original,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
    webpackHash: stats.hash,
    sha256: Object.fromEntries(['app.js', 'app.css'].map(name => [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(out, name))).digest('hex')]))
  }, null, 2));
  const mime = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
  http.createServer((req, res) => {
    const name = new URL(req.url, 'http://127.0.0.1').pathname.slice(1) || 'index.html';
    // Somente assets de public/output; nunca raiz, fontes, .git ou backend.
    if (name !== path.basename(name) || name.startsWith('.')) { res.writeHead(404).end(); return; }
    if (name === 'socket.io.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(`window.io = function(url) {
        const listeners = {};
        const socket = { url, on(name, fn) { (listeners[name] ||= []).push(fn); return socket; },
          emit(name, data) { window.__events.push({name, data}); return socket; },
          receive(name, data) { (listeners[name] || []).forEach(fn => fn(data)); } };
        window.__socket = socket; return socket;
      };`); return;
    }
    const file = fs.existsSync(path.join(out, name)) ? path.join(out, name) : path.join(root, 'public', name);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  }).listen(18181, '127.0.0.1', () => console.log('Baseline frontend 127.0.0.1:18181; HTTP/socket simulados pelo harness.'));
});
