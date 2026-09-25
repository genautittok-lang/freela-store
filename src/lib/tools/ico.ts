/** PNG-in-ICO writer for 16/32/48 (and extra) frames. */

function u16(n: number) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}
function u32(n: number) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

export function buildIco(pngFrames: Uint8Array[]): Uint8Array {
  if (!pngFrames.length) throw new Error("Need at least one PNG frame.");
  const count = pngFrames.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const dirs: Uint8Array[] = [];
  for (const png of pngFrames) {
    if (png[0] !== 0x89 || png[1] !== 0x50) throw new Error("ICO frames must be PNG bytes.");
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    // IHDR starts at byte 16: width/height big-endian
    const w = view.getUint32(16, false);
    const h = view.getUint32(20, false);
    const entry = new Uint8Array(16);
    entry[0] = w >= 256 ? 0 : w;
    entry[1] = h >= 256 ? 0 : h;
    entry[2] = 0;
    entry[3] = 0;
    new DataView(entry.buffer).setUint16(4, 1, true);
    new DataView(entry.buffer).setUint16(6, 32, true);
    new DataView(entry.buffer).setUint32(8, png.byteLength, true);
    new DataView(entry.buffer).setUint32(12, offset, true);
    dirs.push(entry);
    offset += png.byteLength;
  }
  const out = new Uint8Array(offset);
  out.set(u16(0), 0);
  out.set(u16(1), 2);
  out.set(u16(count), 4);
  let p = 6;
  for (const d of dirs) {
    out.set(d, p);
    p += 16;
  }
  for (const png of pngFrames) {
    out.set(png, p);
    p += png.byteLength;
  }
  return out;
}

export async function canvasPng(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  draw(ctx, size);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed."))), "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}
