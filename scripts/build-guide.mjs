import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Small renderer for this repository's guide: headings, paragraphs, lists and tables.
// Source text is escaped before adding markup; the output has no scripts or remote assets.
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const inline = (value) => escape(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
const source = await readFile(new URL('../docs/DEMO-GUIDE.md', import.meta.url), 'utf8');
const lines = source.split(/\r?\n/);
const blocks = [];
const contents = [];
let headingIndex = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const heading = /^(#{1,3})\s+(.+)$/.exec(line);
  if (heading) {
    const level = heading[1].length;
    const id = `section-${headingIndex++}`;
    blocks.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);
    if (level === 2) contents.push(`<li><a href="#${id}">${inline(heading[2])}</a></li>`);
  } else if (line.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
      if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
      i++;
    }
    i--;
    blocks.push(`<div class="table-wrap"><table><thead><tr>${rows[0].map((cell) => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((cells) => `<tr>${cells.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
  } else if (/^\d+\.\s/.test(line) || /^-\s/.test(line)) {
    const ordered = /^\d+\.\s/.test(line);
    const pattern = ordered ? /^\d+\.\s/ : /^-\s/;
    const items = [];
    while (i < lines.length && pattern.test(lines[i].trim())) items.push(`<li>${inline(lines[i++].trim().replace(pattern, ''))}</li>`);
    i--;
    blocks.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
  } else {
    const paragraph = [line];
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#{1,3}\s|\||\d+\.\s|-\s)/.test(lines[i + 1].trim())) paragraph.push(lines[++i].trim());
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
}
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>小X · 使用与算法演示指南</title><style>
:root{color-scheme:light;font-family:system-ui,"Microsoft YaHei",sans-serif;color:#253631;background:#f6f6f1}*{box-sizing:border-box}body{margin:0}main{max-width:1000px;margin:36px auto;padding:48px 56px;background:#fffefb;border:1px solid #dce2dc;border-radius:20px}h1{font-size:30px;letter-spacing:-.6px;line-height:1.35}h2{margin-top:48px;font-size:22px;padding-top:12px;border-top:1px solid #dce2dc}h3{font-size:18px;margin-top:28px}p,li{font-size:15px;line-height:1.9}p{margin:14px 0}li{margin:8px 0}a{color:#275c4d;text-underline-offset:4px}nav{background:#eef3ed;padding:18px 24px;border-radius:12px;margin:28px 0}nav ol{padding-left:22px;columns:2}nav li{font-size:14px;margin:4px 0;break-inside:avoid}nav strong{font-size:14px}.table-wrap{overflow:auto;border:1px solid #dce2dc;border-radius:10px;margin:20px 0}table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.75;min-width:600px}th,td{text-align:left;vertical-align:top;padding:14px 16px;border-bottom:1px solid #e4e8e1}th{background:#eef3ed;font-weight:600}tr:last-child td{border-bottom:0}td:first-child{width:29%}code{background:#eef3ed;padding:2px 4px;border-radius:4px}h1,h2,h3{scroll-margin-top:24px}.footer{color:#52635c;font-size:13px;border-top:1px solid #dce2dc;margin-top:48px;padding-top:20px}@media(max-width:700px){main{margin:0;border:0;border-radius:0;padding:28px 20px}h1{font-size:25px}nav ol{columns:1}th,td{padding:10px 12px}}@media print{body{background:white}main{border:0;margin:0;padding:0;max-width:none}nav{display:none}h2{break-after:avoid}.table-wrap{overflow:visible}table{min-width:0}tr{break-inside:avoid}}
</style></head><body><main>${blocks[0]}${blocks[1]}<nav aria-label="指南目录"><strong>阅读目录</strong><ol>${contents.join('')}</ol></nav>${blocks.slice(2).join('\n')}<p class="footer">本说明可以离线阅读，也可以使用浏览器的打印功能保存为 PDF。原型与本指南均不包含真实政策或审批结论。</p></main></body></html>`;
await mkdir(new URL('../standalone/', import.meta.url), { recursive: true });
await writeFile(new URL('../standalone/使用说明-双击打开.html', import.meta.url), html, 'utf8');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/guide.html', import.meta.url), html, 'utf8');
console.log('Offline demonstration guide generated.');
