// Preview the built prototype without installing project dependencies.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4300);
const host = process.env.HOST || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}
try {
  await stat(resolve(root, 'index.html'));
} catch {
  console.error('Missing dist/index.html. Build the project first: npm run build');
  process.exit(1);
}
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
};
const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = resolve(root, `.${pathname}`);
    if (requested !== resolve(root) && !requested.startsWith(resolve(root) + sep)) {
      response.writeHead(403).end();
      return;
    }
    let file = requested;
    try {
      if (!(await stat(file)).isFile()) file = resolve(root, 'index.html');
    } catch {
      // Client routes need the app shell; missing assets must remain 404s.
      if (extname(pathname)) {
        response.writeHead(404).end();
        return;
      }
      file = resolve(root, 'index.html');
    }
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(400).end();
  }
});
let retried = false;
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && !process.env.PORT && !retried) {
    retried = true;
    console.log(`Port ${port} is occupied. Choosing an available port...`);
    server.listen(0, host);
    return;
  }
  console.error(`Preview could not start: ${error.message}`);
  process.exitCode = 1;
});
server.on('listening', () => {
  const address = server.address();
  const url = `http://${host}:${address.port}`;
  console.log(`Campus prototype is running: ${url}`);
  console.log('Keep this window open. Press Ctrl+C to stop.');
  if (process.argv.includes('--open')) {
    const opener = process.platform === 'win32'
      ? spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { windowsHide: true })
      : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url]);
    opener.on('error', () => console.log(`Open this address in your browser: ${url}`));
  }
});
server.listen(port, host);
