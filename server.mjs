import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.pdf':'application/pdf','.jpg':'image/jpeg','.webp':'image/webp'};
const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const route = pathname === '/' ? '/index.html' : /^\/(projects|experience|writing|tech-blog|about)$/.test(pathname) ? pathname + '.html' : pathname;
    const file = resolve(root, '.' + route);
    if (!file.startsWith(root + sep)) {res.writeHead(403).end();return;}
    const content = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream'}).end(content);
  } catch {res.writeHead(404).end('Not found');}
});
const port = Number(process.env.PORT || 5173);
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
