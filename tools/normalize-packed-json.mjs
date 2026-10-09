import { readFile, writeFile } from 'node:fs/promises';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Jep të paktën një skedar JSON');

function validJson(text) {
  try {
    JSON.parse(text.replace(/^\uFEFF/, ''));
    return true;
  } catch {
    return false;
  }
}

function decodeUtf16BE(buffer) {
  const evenLength = buffer.length - (buffer.length % 2);
  const swapped = Buffer.allocUnsafe(evenLength);
  for (let i = 0; i < evenLength; i += 2) {
    swapped[i] = buffer[i + 1];
    swapped[i + 1] = buffer[i];
  }
  return swapped.toString('utf16le');
}

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

function addCandidate(candidates, text) {
  if (typeof text !== 'string') return;
  const clean = text.replace(/^\uFEFF/, '');
  candidates.push(clean);
  const withoutNuls = clean.replace(/\u0000/g, '');
  if (withoutNuls !== clean) candidates.push(withoutNuls);
}

function recoverJson(buffer) {
  // Provojmë dekodimet mbi bajtet origjinale para çdo konvertimi lossy.
  // Kandidati pranohet vetëm kur JSON.parse kalon; përmbajtja nuk plotësohet.
  const candidates = [];
  const utf8 = buffer.toString('utf8');
  addCandidate(candidates, utf8);
  addCandidate(candidates, buffer.toString('utf16le'));
  addCandidate(candidates, decodeUtf16BE(buffer));

  const packed = packedUtf8ToText(utf8);
  addCandidate(candidates, packed);

  return candidates.find(validJson) ?? null;
}

for (const file of files) {
  const buffer = await readFile(file);
  const utf8 = buffer.toString('utf8').replace(/^\uFEFF/, '');
  if (validJson(utf8)) {
    console.log(`JSON OK: ${file}`);
    continue;
  }

  const repaired = recoverJson(buffer);
  if (!repaired) {
    throw new Error(`${file}: struktura JSON mbetet e pavlefshme pas rikuperimit të sigurt nga bajtet origjinale`);
  }

  await writeFile(file, repaired, 'utf8');
  console.log(`JSON NORMALIZED: ${file}`);
}
