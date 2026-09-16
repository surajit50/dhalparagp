import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ImageState {
  preview: string | null;
  uploading: boolean;
}

interface UploadResult {
  url: string;
  publicId: string;
}

export function useImageUpload(defaultFolder: string) {
  const [states, setStates] = useState<Record<string, ImageState>>({});

  const getState = useCallback((key: string) => {
    return states[key] || { preview: null, uploading: false };
  }, [states]);

  const setState = useCallback((key: string, updater: (prev: ImageState) => ImageState) => {
    setStates((prev) => ({
      ...prev,
      [key]: updater(prev[key] || { preview: null, uploading: false }),
    }));
  }, []);

  const upload = useCallback(
    async (
      file: File,
      key: string,
      onSuccess?: (result: UploadResult) => void
    ) => {
      setState(key, (prev) => ({ ...prev, uploading: true }));
      const previewUrl = URL.createObjectURL(file);
      setState(key, (prev) => ({ ...prev, preview: previewUrl }));

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", defaultFolder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        const result = { url: data.url, publicId: data.publicId };

        if (onSuccess) {
          onSuccess(result);
        }
        
        toast.success("Image uploaded successfully");
        return result;
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
        setState(key, (prev) => ({ ...prev, preview: null }));
        return null;
      } finally {
        setState(key, (prev) => ({ ...prev, uploading: false }));
      }
    },
    [defaultFolder, setState]
  );

  const clear = useCallback(
    (key: string) => {
      setState(key, () => ({ preview: null, uploading: false }));
    },
    [setState]
  );

  return { getState, upload, clear };
}
