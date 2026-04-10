"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxImages - images.length;
      const newFiles = acceptedFiles.slice(0, remaining);
      const updated = [...images, ...newFiles];
      onImagesChange(updated);

      // Generate previews
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [images, maxImages, onImagesChange]
  );

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);

    // Revoke preview URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: images.length >= maxImages,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : images.length >= maxImages
              ? "cursor-not-allowed border-muted bg-muted/50"
              : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        {images.length >= maxImages ? (
          <p className="text-sm text-muted-foreground">
            Máximo de {maxImages} imágenes alcanzado
          </p>
        ) : isDragActive ? (
          <p className="text-sm text-primary">Suelta las imágenes aquí...</p>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG o WebP. Máx 5MB por imagen. ({images.length}/{maxImages})
            </p>
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              <img
                src={preview}
                alt={`Imagen ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
