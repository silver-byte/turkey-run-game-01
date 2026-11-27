import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('./game/', import.meta.url)));
const portOption = process.argv.indexOf('--port');
const port = portOption < 0 ? 8080 : Number(process.argv[portOption + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Expected --port followed by a valid TCP port');
const media = new Map([
  ['.html', 'text/html'], ['.js', 'text/javascript'], ['.css', 'text/css'], ['.json', 'application/json'],
]);

function inside(path: string) {
  return path.startsWith(root + sep);
}

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return response.writeHead(405, { allow: 'GET, HEAD' }).end();
  let path: string;
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    path = decodeURIComponent(url.pathname);
  } catch {
    return response.writeHead(400).end();
  }
  if (path.endsWith('/')) path += 'index.html';
  const requested = resolve(root, `.${path}`);
  if (!inside(requested)) return response.writeHead(403).end();
  try {
    const file = await realpath(requested);
    if (!inside(file)) return response.writeHead(403).end();
    const details = await stat(file);
    if (!details.isFile()) return response.writeHead(404).end();
    response.writeHead(200, {
      'content-type': `${media.get(extname(file)) ?? 'application/octet-stream'}; charset=utf-8`,
      'content-length': details.size,
      'cache-control': 'no-store',
    });
    if (request.method === 'HEAD') return response.end();
    createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, '127.0.0.1', () => console.log(`Gobble Run 3D: http://127.0.0.1:${port}/`));
