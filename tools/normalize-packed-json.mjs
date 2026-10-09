import { readFile, writeFile } from 'node:fs/promises';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Jep të paktën një skedar JSON');

function packedUtf8ToText(text) {
  const bytes = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code > 0xffff) return null;
    bytes.push((code >> 8) & 0xff, code & 0xff);
  }
  while (bytes.length && bytes.at(-1) === 0) bytes.pop();
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
}

for (const file of files) {
  const raw = await readFile(file, 'utf8');
  try {
    JSON.parse(raw);
    console.log(`JSON OK: ${file}`);
    continue;
  } catch {}

  const repaired = packedUtf8ToText(raw);
  if (!repaired) throw new Error(`${file}: formati i dëmtuar nuk është i rikuperueshëm si packed UTF-8`);
  JSON.parse(repaired);
  await writeFile(file, repaired, 'utf8');
  console.log(`JSON NORMALIZED: ${file}`);
}
