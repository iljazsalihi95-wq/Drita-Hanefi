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
  return new TextDecoder('utf-8').decode(Uint8Array.from(bytes));
}

function validJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function recoverJson(raw) {
  // Burimet e vjetra të Hadithit kanë ekzistuar në dy forma të dëmtuara:
  // 1) code-unit-e të paketuara si çifte bajtesh; 2) UTF-16 i lexuar si UTF-8,
  // që lë NUL ndërmjet karaktereve ASCII. Pranojmë vetëm një kandidat që
  // kalon JSON.parse; nuk ndërtojmë dhe nuk plotësojmë përmbajtje.
  const candidates = [];
  const withoutNuls = raw.replace(/\u0000/g, '');
  if (withoutNuls !== raw) candidates.push(withoutNuls);

  const packed = packedUtf8ToText(raw);
  if (packed) {
    candidates.push(packed);
    const packedWithoutNuls = packed.replace(/\u0000/g, '');
    if (packedWithoutNuls !== packed) candidates.push(packedWithoutNuls);
  }

  return candidates.find(validJson) ?? null;
}

for (const file of files) {
  const raw = await readFile(file, 'utf8');
  if (validJson(raw)) {
    console.log(`JSON OK: ${file}`);
    continue;
  }

  const repaired = recoverJson(raw);
  if (!repaired) {
    throw new Error(`${file}: struktura JSON mbetet e pavlefshme pas rikuperimit të sigurt`);
  }

  await writeFile(file, repaired, 'utf8');
  console.log(`JSON NORMALIZED: ${file}`);
}
