import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');
const buildResourcesDir = path.join(projectRoot, 'buildResources');
const rasterDir = path.join(buildResourcesDir, 'generated-png');

const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title>7-Zip GUI</title>
  <desc>Fallback icon with zipper motif</desc>
  <defs>
    <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="zip" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
  </defs>
  <rect x="36" y="52" width="440" height="408" rx="64" fill="url(#bg)" />
  <rect x="100" y="112" width="312" height="288" rx="32" fill="#1e40af" opacity="0.85" />
  <path d="M256 92c-12 0-22 8-24 19l-16 130c-3 24 15 45 39 45s42-21 39-45l-16-130c-2-11-12-19-24-19z" fill="url(#zip)" />
  <rect x="236" y="292" width="40" height="96" rx="12" fill="#f8fafc" />
  <path d="M212 348h88" stroke="#f8fafc" stroke-width="24" stroke-linecap="round" />
</svg>`;

const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

const icoTarget = path.join(buildResourcesDir, 'icon.ico');
const icnsTarget = path.join(buildResourcesDir, 'icon.icns');
const linuxPngTarget = path.join(buildResourcesDir, 'icon.png');
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function blend(start, end, t) {
  return start + (end - start) * t;
}

async function createFallbackPng(size) {
  const rowLength = size * 4 + 1;
  const raw = Buffer.alloc(rowLength * size);

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * rowLength;
    raw[rowOffset] = 0; // No filter
    const v = y / (size - 1);
    for (let x = 0; x < size; x += 1) {
      const u = x / (size - 1);
      const pixelOffset = rowOffset + 1 + x * 4;

      let r = blend(15, 29, (u + v) / 2);
      let g = blend(23, 78, (u + v) / 2);
      let b = blend(42, 216, u);

      // Inner panel
      if (u > 0.25 && u < 0.75 && v > 0.3 && v < 0.78) {
        const mix = (u - 0.25) / 0.5 * 0.4 + (0.78 - v) / 0.48 * 0.2;
        r = blend(r, 14, mix);
        g = blend(g, 165, mix);
        b = blend(b, 233, mix);
      }

      // Vertical zipper
      const zipperDistance = Math.abs(u - 0.5);
      if (zipperDistance < 0.02 && v > 0.25 && v < 0.8) {
        r = blend(r, 253, 0.9);
        g = blend(g, 224, 0.9);
        b = blend(b, 71, 0.9);
      }

      // Teeth
      const toothSpacing = 0.07;
      if (zipperDistance < 0.13 && v > 0.25 && v < 0.75) {
        if (Math.abs(((v - 0.25) % toothSpacing) - toothSpacing / 2) < 0.01) {
          r = blend(r, 248, 0.8);
          g = blend(g, 250, 0.8);
          b = blend(b, 252, 0.8);
        }
      }

      // Pull tab circle
      const dx = u - 0.5;
      const dy = v - 0.75;
      const pullDist = Math.sqrt(dx * dx + dy * dy);
      if (pullDist < 0.08) {
        r = blend(r, 253, 0.85);
        g = blend(g, 224, 0.85);
        b = blend(b, 71, 0.85);
      }

      // Pull tab slot
      if (Math.abs(u - 0.5) < 0.02 && v > 0.72 && v < 0.82) {
        r = blend(r, 15, 0.9);
        g = blend(g, 23, 0.9);
        b = blend(b, 42, 0.9);
      }

      raw[pixelOffset] = Math.round(Math.max(0, Math.min(255, r)));
      raw[pixelOffset + 1] = Math.round(Math.max(0, Math.min(255, g)));
      raw[pixelOffset + 2] = Math.round(Math.max(0, Math.min(255, b)));
      raw[pixelOffset + 3] = 255;
    }
  }

  const { deflateSync } = await import('node:zlib');
  const compressed = deflateSync(raw);

  const chunks = [];
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const makeChunk = (type, data) => {
    const typeBuffer = Buffer.from(type, 'ascii');
    const lenBuffer = Buffer.alloc(4);
    lenBuffer.writeUInt32BE(data.length, 0);
    const crcBuffer = Buffer.alloc(4);
    const crcValue = crc32(Buffer.concat([typeBuffer, data]));
    crcBuffer.writeUInt32BE(crcValue >>> 0, 0);
    return Buffer.concat([lenBuffer, typeBuffer, data, crcBuffer]);
  };

  chunks.push(makeChunk('IHDR', ihdr));
  chunks.push(makeChunk('IDAT', compressed));
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat([signature, ...chunks]);
}

async function generateFallbackPngs() {
  const fallbackSizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  const buffers = new Map();
  for (const size of fallbackSizes) {
    buffers.set(size, await createFallbackPng(size));
  }
  return buffers;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function discoverSvg() {
  const preferred = path.join(assetsDir, 'app-icon.svg');
  if (await fileExists(preferred)) {
    return preferred;
  }

  if (!(await fileExists(assetsDir))) {
    return null;
  }

  const entries = await fs.readdir(assetsDir);
  const svg = entries.find((entry) => entry.toLowerCase().endsWith('.svg'));
  return svg ? path.join(assetsDir, svg) : null;
}

function validateSvg(content) {
  if (typeof content !== 'string') {
    return false;
  }

  const trimmed = content.trim();
  if (!trimmed.startsWith('<')) {
    return false;
  }

  const openTagMatch = trimmed.match(/<svg\b[^>]*>/i);
  if (!openTagMatch) {
    return false;
  }

  if (!trimmed.toLowerCase().includes('</svg>')) {
    return false;
  }

  const openTag = openTagMatch[0];
  const hasViewBox = /viewBox\s*=\s*"[^"]+"/i.test(openTag) || /viewBox\s*=\s*'[^']+'/i.test(openTag);
  const hasWidth = /width\s*=\s*"[^"]+"/i.test(openTag) || /width\s*=\s*'[^']+'/i.test(openTag);
  const hasHeight = /height\s*=\s*"[^"]+"/i.test(openTag) || /height\s*=\s*'[^']+'/i.test(openTag);

  return hasViewBox || (hasWidth && hasHeight);
}

let ResvgConstructor = null;

async function getResvg() {
  if (ResvgConstructor) {
    return ResvgConstructor;
  }

  try {
    const mod = await import('@resvg/resvg-js');
    if (!mod?.Resvg) {
      throw new Error('`@resvg/resvg-js` did not expose a Resvg constructor');
    }
    ResvgConstructor = mod.Resvg;
    return ResvgConstructor;
  } catch (error) {
    throw new Error(`Unable to load @resvg/resvg-js: ${error.message}`);
  }
}

async function generatePngs(svgMarkup) {
  await ensureDir(rasterDir);
  const pngBuffers = new Map();
  let Resvg;
  try {
    Resvg = await getResvg();
  } catch (error) {
    console.warn(`[icon] ${error.message}. Falling back to procedural artwork.`);
    const fallback = await generateFallbackPngs();
    for (const [size, buffer] of fallback.entries()) {
      pngBuffers.set(size, buffer);
      const outputPath = path.join(rasterDir, `icon-${size}.png`);
      await fs.writeFile(outputPath, buffer);
    }
    await fs.copyFile(path.join(rasterDir, 'icon-512.png'), linuxPngTarget).catch(async () => {
      const png512 = fallback.get(512);
      if (png512) {
        await fs.writeFile(linuxPngTarget, png512);
      }
    });
    return pngBuffers;
  }

  for (const size of sizes) {
    const resvg = new Resvg(svgMarkup, {
      fitTo: { mode: 'width', value: size },
      background: 'rgba(0,0,0,0)'
    });
    const rendered = resvg.render();
    const pngBuffer = rendered.asPng();
    const outputPath = path.join(rasterDir, `icon-${size}.png`);
    await fs.writeFile(outputPath, pngBuffer);
    pngBuffers.set(size, pngBuffer);
  }

  await fs.copyFile(path.join(rasterDir, 'icon-512.png'), linuxPngTarget);

  return pngBuffers;
}

async function writeIco(pngBuffers) {
  const iterator = pngBuffers.entries();
  const firstEntry = iterator.next().value;
  const buffer = pngBuffers.get(256) ?? pngBuffers.get(128) ?? (firstEntry ? firstEntry[1] : null);
  if (!buffer) {
    throw new Error('No raster data available for ICO generation');
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // width 256 encoded as 0
  entry.writeUInt8(0, 1); // height 256 encoded as 0
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(buffer.length, 8);
  entry.writeUInt32LE(6 + 16, 12);

  const icoBuffer = Buffer.concat([header, entry, buffer]);
  await fs.writeFile(icoTarget, icoBuffer);
}

async function writeIcns(pngBuffers) {
  const chunks = [];
  const sizeToChunk = [
    [1024, 'ic10'],
    [512, 'ic09'],
    [256, 'ic08'],
  ];

  for (const [size, chunkType] of sizeToChunk) {
    if (pngBuffers.has(size)) {
      chunks.push({ type: chunkType, data: pngBuffers.get(size) });
    }
  }

  if (chunks.length === 0 && pngBuffers.size > 0) {
    const [, fallbackData] = pngBuffers.entries().next().value;
    chunks.push({ type: 'ic08', data: fallbackData });
  }

  if (chunks.length === 0) {
    throw new Error('No raster data available for ICNS generation');
  }

  let totalLength = 8;
  for (const chunk of chunks) {
    totalLength += 8 + chunk.data.length;
  }

  const header = Buffer.alloc(8);
  header.write('icns', 0, 'ascii');
  header.writeUInt32BE(totalLength, 4);

  const buffers = [header];
  for (const chunk of chunks) {
    const chunkHeader = Buffer.alloc(8);
    chunkHeader.write(chunk.type, 0, 'ascii');
    chunkHeader.writeUInt32BE(chunk.data.length + 8, 4);
    buffers.push(chunkHeader, chunk.data);
  }

  await fs.writeFile(icnsTarget, Buffer.concat(buffers));
}

async function main() {
  await ensureDir(buildResourcesDir);

  let svgPath = await discoverSvg();
  let svgContent = svgPath ? await fs.readFile(svgPath, 'utf8') : null;

  if (!svgContent || !validateSvg(svgContent)) {
    if (svgPath) {
      console.warn(`[icon] SVG at ${path.relative(projectRoot, svgPath)} is invalid. Falling back to bundled artwork.`);
    } else {
      console.warn('[icon] No SVG icon found. Using bundled fallback artwork.');
    }
    svgContent = fallbackSvg;
  }

  const pngBuffers = await generatePngs(svgContent);

  try {
    await writeIco(pngBuffers);
  } catch (error) {
    console.warn('[icon] Failed to generate ICO file:', error.message);
  }

  try {
    await writeIcns(pngBuffers);
  } catch (error) {
    console.warn('[icon] Failed to generate ICNS file:', error.message);
  }
}

main().catch((error) => {
  console.error('[icon] Unable to prepare icons:', error);
  process.exitCode = 1;
});
