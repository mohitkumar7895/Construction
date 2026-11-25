import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const ALLOWED_IMAGE_MIME = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const ALLOWED_VIDEO_MIME = new Map<string, string>([
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
]);

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

export function detectFileSignature(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }
  // WEBP: RIFF....WEBP
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  // MP4: ....ftyp
  if (buf.toString('ascii', 4, 8) === 'ftyp') return 'video/mp4';
  // WEBM: 1A 45 DF A3
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return 'video/webm';
  }
  return null;
}

export function sanitizeUploadBaseName(name: string): string {
  const base = path.basename(name, path.extname(name));
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return cleaned || 'media';
}

export interface ProcessedUpload {
  filename: string;
  originalName: string;
  url: string;
  webpUrl: string | null;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
}

export async function processAndStoreUpload(
  file: File,
  folder = 'general'
): Promise<ProcessedUpload> {
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9-_]/g, '') || 'general';
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detectedMime = detectFileSignature(buffer);
  if (!detectedMime) {
    throw new Error('Unsupported or invalid file signature. Allowed: JPG, PNG, WebP, MP4, WebM.');
  }

  const isImage = ALLOWED_IMAGE_MIME.has(detectedMime);
  const isVideo = ALLOWED_VIDEO_MIME.has(detectedMime);

  if (!isImage && !isVideo) {
    throw new Error('Executable and non-media files are strictly prohibited.');
  }

  if (isImage && buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('Image exceeds maximum allowed size of 12 MB.');
  }
  if (isVideo && buffer.length > MAX_VIDEO_BYTES) {
    throw new Error('Video exceeds maximum allowed size of 50 MB.');
  }

  const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './public/uploads');
  const targetDir = path.join(uploadRoot, safeFolder);
  await fs.mkdir(targetDir, { recursive: true });

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const baseName = sanitizeUploadBaseName(file.name);

  if (isImage) {
    const ext = ALLOWED_IMAGE_MIME.get(detectedMime) || '.jpg';
    const filename = `${baseName}-${uniqueSuffix}${ext}`;
    const webpFilename = `${baseName}-${uniqueSuffix}.webp`;

    const image = sharp(buffer, { failOn: 'truncated' }).rotate();
    const meta = await image.metadata();
    const maxDimension = 2200;

    const resized =
      (meta.width && meta.width > maxDimension) || (meta.height && meta.height > maxDimension)
        ? image.resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
        : image;

    const optimizedWebpBuffer = await resized.clone().webp({ quality: 84 }).toBuffer();
    await fs.writeFile(path.join(targetDir, webpFilename), optimizedWebpBuffer);

    let optimizedOriginal: Buffer;
    if (detectedMime === 'image/png') {
      optimizedOriginal = await resized.clone().png({ compressionLevel: 8 }).toBuffer();
    } else if (detectedMime === 'image/webp') {
      optimizedOriginal = optimizedWebpBuffer;
    } else {
      optimizedOriginal = await resized.clone().jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    }

    await fs.writeFile(path.join(targetDir, filename), optimizedOriginal);
    const finalMeta = await sharp(optimizedOriginal).metadata();

    return {
      filename,
      originalName: file.name,
      url: `/uploads/${safeFolder}/${webpFilename}`,
      webpUrl: `/uploads/${safeFolder}/${webpFilename}`,
      mimeType: 'image/webp',
      fileSize: optimizedWebpBuffer.length,
      width: finalMeta.width ?? meta.width ?? null,
      height: finalMeta.height ?? meta.height ?? null,
    };
  }

  // Validated video
  const ext = ALLOWED_VIDEO_MIME.get(detectedMime) || '.mp4';
  const filename = `${baseName}-${uniqueSuffix}${ext}`;
  await fs.writeFile(path.join(targetDir, filename), buffer);

  return {
    filename,
    originalName: file.name,
    url: `/uploads/${safeFolder}/${filename}`,
    webpUrl: null,
    mimeType: detectedMime,
    fileSize: buffer.length,
    width: null,
    height: null,
  };
}
