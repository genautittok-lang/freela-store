import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";

let ffmpegSingleton: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export function hasSharedArrayBuffer() {
  return typeof SharedArrayBuffer !== "undefined";
}

export function isCrossOriginIsolated() {
  return typeof crossOriginIsolated !== "undefined" && crossOriginIsolated;
}

/** COOP/COEP required for multi-thread; single-thread core still works without SAB. */
export function assertFfmpegEnvironment() {
  if (!isCrossOriginIsolated() && !hasSharedArrayBuffer()) {
    const msg =
      "This browser tab is not cross-origin isolated (COOP/COEP). Media conversion may be slower or unavailable — try a hard refresh.";
    toast.error(msg);
  }
}

const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
const CORE_MT_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm";

export async function getFfmpeg(onLog?: (line: string) => void): Promise<FFmpeg> {
  assertFfmpegEnvironment();
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => onLog?.(message));
    const useMt = isCrossOriginIsolated() && hasSharedArrayBuffer();
    const base = useMt ? CORE_MT_BASE : CORE_BASE;
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
        ...(useMt
          ? { workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, "text/javascript") }
          : {}),
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not load the local media engine (ffmpeg.wasm). Check network for the WASM core or try again.";
      toast.error(msg);
      loadPromise = null;
      throw new Error(msg);
    }
    ffmpegSingleton = ffmpeg;
    return ffmpeg;
  })();
  return loadPromise;
}

function extOf(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] || "bin";
}

function stemOf(name: string) {
  return name.replace(/\.[^.]+$/, "") || "media";
}

async function writeInput(ffmpeg: FFmpeg, file: File, forcedExt?: string) {
  const ext = forcedExt || extOf(file.name);
  const input = `input.${ext}`;
  await ffmpeg.writeFile(input, await fetchFile(file));
  return input;
}

async function readOutput(ffmpeg: FFmpeg, output: string, mime: string) {
  const data = await ffmpeg.readFile(output);
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  // Copy into a fresh ArrayBuffer-backed Uint8Array for BlobPart typing.
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: mime });
}

export type FfmpegProgress = (ratio: number) => void;

function wireProgress(ffmpeg: FFmpeg, onProgress?: FfmpegProgress) {
  if (!onProgress) return () => undefined;
  const handler = ({ progress }: { progress: number }) => onProgress(Math.min(1, Math.max(0, progress)));
  ffmpeg.on("progress", handler);
  return () => ffmpeg.off("progress", handler);
}

export async function convertVideoToMp4(file: File, onProgress?: FfmpegProgress) {
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = "out.mp4";
    const code = await ffmpeg.exec([
      "-i",
      input,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      output,
    ]);
    if (code !== 0) throw new Error("This clip could not be converted to MP4. The codec may be unsupported in-browser.");
    const blob = await readOutput(ffmpeg, output, "video/mp4");
    return { blob, name: `${stemOf(file.name)}.mp4` };
  } finally {
    off();
  }
}

export async function convertVideoToWebm(file: File, onProgress?: FfmpegProgress) {
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = "out.webm";
    const code = await ffmpeg.exec([
      "-i",
      input,
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "1M",
      "-c:a",
      "libopus",
      output,
    ]);
    if (code !== 0) throw new Error("This clip could not be converted to WebM. Try MP4 output instead.");
    const blob = await readOutput(ffmpeg, output, "video/webm");
    return { blob, name: `${stemOf(file.name)}.webm` };
  } finally {
    off();
  }
}

export async function convertVideoToGif(
  file: File,
  opts: { fps?: number; width?: number; start?: number; duration?: number },
  onProgress?: FfmpegProgress,
) {
  const fps = Math.min(15, Math.max(4, opts.fps ?? 10));
  const width = Math.min(640, Math.max(120, opts.width ?? 320));
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = "out.gif";
    const args = ["-i", input];
    if (opts.start != null && opts.start > 0) args.push("-ss", String(opts.start));
    if (opts.duration != null && opts.duration > 0) args.push("-t", String(opts.duration));
    args.push("-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`, "-loop", "0", output);
    const code = await ffmpeg.exec(args);
    if (code !== 0) throw new Error("Could not build a GIF from this video. Try a shorter segment.");
    const blob = await readOutput(ffmpeg, output, "image/gif");
    return { blob, name: `${stemOf(file.name)}.gif` };
  } finally {
    off();
  }
}

export async function extractAudio(
  file: File,
  format: "mp3" | "wav" | "aac",
  onProgress?: FfmpegProgress,
) {
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = `out.${format}`;
    const codec =
      format === "mp3" ? ["-c:a", "libmp3lame", "-q:a", "2"] : format === "aac" ? ["-c:a", "aac", "-b:a", "192k"] : ["-c:a", "pcm_s16le"];
    const mime = format === "mp3" ? "audio/mpeg" : format === "aac" ? "audio/aac" : "audio/wav";
    const code = await ffmpeg.exec(["-i", input, "-vn", ...codec, output]);
    if (code !== 0) throw new Error("No audio track could be extracted from this file.");
    const blob = await readOutput(ffmpeg, output, mime);
    return { blob, name: `${stemOf(file.name)}.${format}` };
  } finally {
    off();
  }
}

export async function convertAudio(
  file: File,
  format: "mp3" | "wav" | "ogg" | "aac",
  onProgress?: FfmpegProgress,
) {
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = `out.${format}`;
    const args =
      format === "mp3"
        ? ["-i", input, "-c:a", "libmp3lame", "-q:a", "2", output]
        : format === "wav"
          ? ["-i", input, "-c:a", "pcm_s16le", output]
          : format === "ogg"
            ? ["-i", input, "-c:a", "libvorbis", "-q:a", "5", output]
            : ["-i", input, "-c:a", "aac", "-b:a", "192k", output];
    const mime =
      format === "mp3" ? "audio/mpeg" : format === "wav" ? "audio/wav" : format === "ogg" ? "audio/ogg" : "audio/aac";
    const code = await ffmpeg.exec(args);
    if (code !== 0) throw new Error(`Could not convert this audio to ${format.toUpperCase()}.`);
    const blob = await readOutput(ffmpeg, output, mime);
    return { blob, name: `${stemOf(file.name)}.${format}` };
  } finally {
    off();
  }
}

export async function compressVideo(file: File, crf = 28, onProgress?: FfmpegProgress) {
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = "out.mp4";
    const q = Math.min(36, Math.max(18, Math.round(crf)));
    const code = await ffmpeg.exec([
      "-i",
      input,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      String(q),
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      output,
    ]);
    if (code !== 0) throw new Error("Could not compress this video in the browser.");
    const blob = await readOutput(ffmpeg, output, "video/mp4");
    return { blob, name: `${stemOf(file.name)}-compressed.mp4` };
  } finally {
    off();
  }
}

export async function trimVideo(file: File, start: number, end: number, onProgress?: FfmpegProgress) {
  if (!(end > start) || start < 0) throw new Error("Enter a valid start and end time (end must be after start).");
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = "out.mp4";
    const duration = end - start;
    const code = await ffmpeg.exec([
      "-ss",
      String(start),
      "-i",
      input,
      "-t",
      String(duration),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      output,
    ]);
    if (code !== 0) throw new Error("Could not trim this video. Check the timecodes.");
    const blob = await readOutput(ffmpeg, output, "video/mp4");
    return { blob, name: `${stemOf(file.name)}-trim.mp4` };
  } finally {
    off();
  }
}

export async function resizeVideo(file: File, height: 720 | 480 | 360, onProgress?: FfmpegProgress) {
  const ffmpeg = await getFfmpeg();
  const off = wireProgress(ffmpeg, onProgress);
  try {
    const input = await writeInput(ffmpeg, file);
    const output = "out.mp4";
    const code = await ffmpeg.exec([
      "-i",
      input,
      "-vf",
      `scale=-2:${height}`,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      output,
    ]);
    if (code !== 0) throw new Error("Could not resize this video.");
    const blob = await readOutput(ffmpeg, output, "video/mp4");
    return { blob, name: `${stemOf(file.name)}-${height}p.mp4` };
  } finally {
    off();
  }
}
