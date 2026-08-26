"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Crop, ZoomIn, ZoomOut, RotateCcw, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ImageCropDialogProps {
  /** The raw image file to crop (from camera / file input) */
  imageFile: File | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when user confirms the crop — receives the cropped File */
  onCropComplete: (croppedFile: File) => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Aspect ratio for the crop box. Defaults to 1 (square). Use 4/3, 16/9, etc. */
  aspectRatio?: number;
  /** Minimum output dimension in px (default 480) */
  minOutputSize?: number;
}

interface Position {
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Extract the cropped region from the full image and return it as a File.
 */
async function cropImageToFile(
  imageSrc: string,
  cropAreaPx: { x: number; y: number; width: number; height: number },
  outputFileName: string,
  minSize: number
): Promise<File> {
  const img = await loadImageElement(imageSrc);

  // Determine output size — at least minSize, but never upscale past the crop area
  const outW = Math.max(minSize, Math.round(cropAreaPx.width));
  const outH = Math.max(minSize, Math.round(cropAreaPx.height));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);

  ctx.drawImage(
    img,
    cropAreaPx.x,
    cropAreaPx.y,
    cropAreaPx.width,
    cropAreaPx.height,
    0,
    0,
    outW,
    outH
  );

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Crop failed");

  return new File([blob], outputFileName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ImageCropDialog({
  imageFile,
  open,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  minOutputSize = 480,
}: ImageCropDialogProps) {
  /* ----- state ----- */
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<Position | null>(null);
  const panStart = useRef<Position>({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );

  /* ----- load image when file changes ----- */
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;

    // reset transforms
    setZoom(1);
    setPan({ x: 0, y: 0 });

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  /* ----- compute crop box & display sizes ----- */
  const getLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || !imageSize.w) {
      return { cropBoxPx: { x: 0, y: 0, w: 0, h: 0 }, displayScale: 1, containerW: 0, containerH: 0 };
    }

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    // Crop box fills ~80% of the smaller container dimension
    const maxCropDim = Math.min(containerW, containerH) * 0.8;
    let cropW: number, cropH: number;
    if (aspectRatio >= 1) {
      cropW = maxCropDim;
      cropH = maxCropDim / aspectRatio;
    } else {
      cropH = maxCropDim;
      cropW = maxCropDim * aspectRatio;
    }

    const cropX = (containerW - cropW) / 2;
    const cropY = (containerH - cropH) / 2;

    // How big the image is displayed at zoom = 1 (fit-cover the crop box)
    const displayScale = Math.max(cropW / imageSize.w, cropH / imageSize.h);

    return {
      cropBoxPx: { x: cropX, y: cropY, w: cropW, h: cropH },
      displayScale,
      containerW,
      containerH,
    };
  }, [imageSize, aspectRatio]);

  /* ----- pointer handlers ----- */
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

      if (activePointers.current.size === 1) {
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { ...pan };
      }
    },
    [pan]
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const pointers = Array.from(activePointers.current.values());

      // Pinch zoom
      if (pointers.length === 2) {
        const dist = Math.hypot(
          pointers[0].x - pointers[1].x,
          pointers[0].y - pointers[1].y
        );
        if (lastPinchDist.current !== null) {
          const delta = dist / lastPinchDist.current;
          setZoom((z) => clamp(z * delta, 1, 5));
        }
        lastPinchDist.current = dist;
        return;
      }

      // Single-finger drag
      if (dragStart.current && pointers.length === 1) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPan({
          x: panStart.current.x + dx,
          y: panStart.current.y + dy,
        });
      }
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size < 2) {
        lastPinchDist.current = null;
      }
      if (activePointers.current.size === 0) {
        dragStart.current = null;
      }
    },
    []
  );

  /* ----- wheel zoom (desktop) ----- */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => clamp(z - e.deltaY * 0.002, 1, 5));
  }, []);

  /* ----- crop action ----- */
  const handleCrop = useCallback(async () => {
    if (!imageSrc || !imageFile) return;
    setProcessing(true);

    try {
      const { cropBoxPx, displayScale } = getLayout();
      const scaledZoom = displayScale * zoom;

      // Image display position (centered in container + pan offset)
      const displayW = imageSize.w * scaledZoom;
      const displayH = imageSize.h * scaledZoom;

      const layout = getLayout();
      const imgDisplayX = (layout.containerW - displayW) / 2 + pan.x;
      const imgDisplayY = (layout.containerH - displayH) / 2 + pan.y;

      // Map crop box back to original image coordinates
      const srcX = (cropBoxPx.x - imgDisplayX) / scaledZoom;
      const srcY = (cropBoxPx.y - imgDisplayY) / scaledZoom;
      const srcW = cropBoxPx.w / scaledZoom;
      const srcH = cropBoxPx.h / scaledZoom;

      // Clamp to image boundaries
      const clampedX = clamp(srcX, 0, imageSize.w);
      const clampedY = clamp(srcY, 0, imageSize.h);
      const clampedW = clamp(srcW, 1, imageSize.w - clampedX);
      const clampedH = clamp(srcH, 1, imageSize.h - clampedY);

      const baseName = imageFile.name.replace(/\.[^.]+$/, "");
      const croppedFile = await cropImageToFile(
        imageSrc,
        { x: clampedX, y: clampedY, width: clampedW, height: clampedH },
        `${baseName}-cropped.jpg`,
        minOutputSize
      );

      onCropComplete(croppedFile);
    } catch (err) {
      console.error("Crop failed:", err);
      // Fallback: pass the original file through
      onCropComplete(imageFile);
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, imageFile, getLayout, zoom, pan, imageSize, minOutputSize, onCropComplete]);

  /* ----- reset ----- */
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ----- render ----- */
  const layout = getLayout();
  const scaledZoom = layout.displayScale * zoom;
  const displayW = imageSize.w * scaledZoom;
  const displayH = imageSize.h * scaledZoom;
  const imgLeft = (layout.containerW - displayW) / 2 + pan.x;
  const imgTop = (layout.containerH - displayH) / 2 + pan.y;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Crop className="w-4 h-4 text-orange-600" />
            Crop Photo
          </DialogTitle>
          <DialogDescription className="text-xs">
            Drag to reposition · Pinch or scroll to zoom
          </DialogDescription>
        </DialogHeader>

        {/* Crop Canvas Area */}
        <div
          ref={containerRef}
          className="relative w-full bg-black/95 select-none overflow-hidden"
          style={{
            height: "min(60vh, 420px)",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Image layer */}
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt="Crop source"
              draggable={false}
              className="absolute pointer-events-none"
              style={{
                left: imgLeft,
                top: imgTop,
                width: displayW,
                height: displayH,
                maxWidth: "none",
              }}
            />
          )}

          {/* Dark overlay with transparent crop window */}
          {layout.cropBoxPx.w > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 2 }}
            >
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={layout.cropBoxPx.x}
                    y={layout.cropBoxPx.y}
                    width={layout.cropBoxPx.w}
                    height={layout.cropBoxPx.h}
                    rx={8}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.55)"
                mask="url(#crop-mask)"
              />
              {/* Crop border */}
              <rect
                x={layout.cropBoxPx.x}
                y={layout.cropBoxPx.y}
                width={layout.cropBoxPx.w}
                height={layout.cropBoxPx.h}
                rx={8}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2}
              />
              {/* Grid lines (rule of thirds) */}
              {[1, 2].map((i) => (
                <g key={i}>
                  <line
                    x1={layout.cropBoxPx.x + (layout.cropBoxPx.w * i) / 3}
                    y1={layout.cropBoxPx.y}
                    x2={layout.cropBoxPx.x + (layout.cropBoxPx.w * i) / 3}
                    y2={layout.cropBoxPx.y + layout.cropBoxPx.h}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={0.5}
                  />
                  <line
                    x1={layout.cropBoxPx.x}
                    y1={layout.cropBoxPx.y + (layout.cropBoxPx.h * i) / 3}
                    x2={layout.cropBoxPx.x + layout.cropBoxPx.w}
                    y2={layout.cropBoxPx.y + (layout.cropBoxPx.h * i) / 3}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={0.5}
                  />
                </g>
              ))}
              {/* Corner handles */}
              {[
                { cx: layout.cropBoxPx.x, cy: layout.cropBoxPx.y },
                { cx: layout.cropBoxPx.x + layout.cropBoxPx.w, cy: layout.cropBoxPx.y },
                { cx: layout.cropBoxPx.x, cy: layout.cropBoxPx.y + layout.cropBoxPx.h },
                { cx: layout.cropBoxPx.x + layout.cropBoxPx.w, cy: layout.cropBoxPx.y + layout.cropBoxPx.h },
              ].map((corner, idx) => (
                <circle
                  key={idx}
                  cx={corner.cx}
                  cy={corner.cy}
                  r={6}
                  fill="white"
                  stroke="rgba(249,115,22,0.9)"
                  strokeWidth={2}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-muted/30 border-t">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => clamp(z - 0.2, 1, 5))}
            disabled={zoom <= 1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-[140px]">
            <input
              type="range"
              min={100}
              max={500}
              value={zoom * 100}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-orange-600
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            />
            <span className="text-xs text-muted-foreground font-mono w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => clamp(z + 0.2, 1, 5))}
            disabled={zoom >= 5}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-5 bg-border" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <DialogFooter className="px-4 py-3 border-t gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none gap-1.5"
            onClick={onCancel}
            disabled={processing}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 sm:flex-none gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleCrop}
            disabled={processing || !imageSrc}
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cropping…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Crop & Use
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
