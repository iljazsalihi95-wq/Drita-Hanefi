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

  // Disa burime të vjetra janë ruajtur si dy bajte për code-unit dhe
  // përmbajnë tashmë U+FFFD në metnin arab. Dekodimi fatal e rrëzonte
  // gjithë build-in edhe pse struktura JSON është e rikuperueshme.
  // Dekodimi standard ruan strukturën dhe shënon vetëm bajtet burimore
  // tashmë të humbura me U+FFFD; nuk sajon tekst zëvendësues.
  return new TextDecoder('utf-8').decode(Uint8Array.from(bytes));
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

  try {
    JSON.parse(repaired);
  } catch (error) {
    throw new Error(`${file}: struktura JSON mbetet e pavlefshme pas rikuperimit: ${error.message}`);
  }

  await writeFile(file, repaired, 'utf8');
  console.log(`JSON NORMALIZED: ${file}`);
}
