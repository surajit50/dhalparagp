export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetSizeBytes?: number;
  initialQuality?: number;
  mimeType?: string;
}

export interface CompressResult {
  file: File;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  previewUrl: string;
}

export const DEFAULT_TARGET_SIZE_BYTES = 200 * 1024; // 200 KB

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const result = await compressImageWithDetails(file, options);
  return result.file;
}

export async function compressImageWithDetails(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const targetSizeBytes = options.targetSizeBytes ?? DEFAULT_TARGET_SIZE_BYTES;
  const originalSize = file.size;

  const {
    maxWidth = 1400,
    maxHeight = 1400,
    initialQuality = 0.8,
    mimeType = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg",
  } = options;

  const src = URL.createObjectURL(file);
  try {
    const img = await loadImage(src);
    const { width, height } = fitDimensions(
      img.naturalWidth,
      img.naturalHeight,
      maxWidth,
      maxHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // Fill white background for JPEGs
    if (mimeType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);

    let quality = initialQuality;
    let blob = await canvasToBlob(canvas, mimeType, quality);

    // Adaptive step-down loop to guarantee file size is strictly <= targetSizeBytes
    let iterations = 8;
    while (blob && blob.size > targetSizeBytes && iterations-- > 0 && quality > 0.2) {
      // Step quality down proportionally
      const ratio = targetSizeBytes / blob.size;
      quality = Math.max(0.18, quality * Math.min(0.88, ratio * 0.95));
      blob = await canvasToBlob(canvas, mimeType, quality);
    }

    // If still oversized, resize canvas resolution down
    if (blob && blob.size > targetSizeBytes) {
      const smallerCanvas = document.createElement("canvas");
      const scale = Math.sqrt(targetSizeBytes / blob.size) * 0.9;
      smallerCanvas.width = Math.max(480, Math.round(width * scale));
      smallerCanvas.height = Math.max(480, Math.round(height * scale));
      const sCtx = smallerCanvas.getContext("2d");
      if (sCtx) {
        if (mimeType === "image/jpeg") {
          sCtx.fillStyle = "#ffffff";
          sCtx.fillRect(0, 0, smallerCanvas.width, smallerCanvas.height);
        }
        sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
        blob = (await canvasToBlob(smallerCanvas, mimeType, 0.72)) || blob;
      }
    }

    if (!blob) throw new Error("Image compression failed");

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const ext = mimeType === "image/png" ? "png" : "jpg";
    const compressed = new File([blob], `${baseName}-opt.${ext}`, {
      type: mimeType,
      lastModified: Date.now(),
    });

    const compressedSize = compressed.size;
    const reduction =
      originalSize > 0
        ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
        : 0;

    const previewUrl = URL.createObjectURL(blob);

    return {
      file: compressed,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      reductionPercentage: reduction,
      previewUrl,
    };
  } finally {
    URL.revokeObjectURL(src);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = src;
  });
}

function fitDimensions(
  width: number,
  height: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  const ratio = Math.min(maxW / width, maxH / height, 1);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

