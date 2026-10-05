import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const result = await build({
  configFile: false,
  root: projectRoot,
  publicDir: false,
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    write: false,
    lib: {
      entry: fileURLToPath(new URL('../src/main.tsx', import.meta.url)),
      name: 'CampusPrototype',
      formats: ['iife'],
    },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
const javascript = outputs.filter((item) => item.type === 'chunk').map((item) => item.code).join('\n');
const css = outputs.filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
  .map((item) => typeof item.source === 'string' ? item.source : new TextDecoder().decode(item.source)).join('\n');
if (!javascript || !css) throw new Error('Standalone build is missing JavaScript or styles.');
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
<meta name="theme-color" content="#faf9f6" />
<meta name="description" content="小X校园助手：可直接双击打开的离线前端交互原型。" />
<title>小X · 校园助手</title>
<style>${css.replace(/<\/style/gi, '<\\/style')}</style>
</head>
<body><div id="root"></div><script>${javascript.replace(/<\/script/gi, '<\\/script')}</script></body>
</html>`;
const outputDirectory = new URL('../standalone/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL('校园助手-双击打开.html', outputDirectory), html, 'utf8');
console.log(`Standalone preview generated (${Math.round(Buffer.byteLength(html) / 1024)} KB).`);
