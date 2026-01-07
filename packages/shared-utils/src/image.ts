/**
 * Image processing utilities for compression and manipulation.
 *
 * @module image
 */

/**
 * Options for image compression.
 */
export interface CompressImageOptions {
  /** Maximum width/height in pixels (default: 400) */
  maxSize?: number;
  /** JPEG/WebP quality 0-1 (default: 0.9) */
  quality?: number;
  /** Output MIME type (default: "image/jpeg") */
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  /** Whether to maintain aspect ratio (default: true) */
  maintainAspectRatio?: boolean;
}

/**
 * Compress an image file to a smaller size.
 *
 * Uses the Canvas API to resize and re-encode the image.
 * Best used in browser environments.
 *
 * @param file - The image file or blob to compress
 * @param options - Compression options
 * @returns Promise resolving to compressed Blob
 *
 * @example
 * ```ts
 * // Basic usage
 * const compressed = await compressImage(file);
 *
 * // Custom options
 * const compressed = await compressImage(file, {
 *   maxSize: 512,
 *   quality: 0.85,
 *   mimeType: "image/webp"
 * });
 * ```
 */
export async function compressImage(
  file: File | Blob,
  options: CompressImageOptions = {},
): Promise<Blob> {
  const {
    maxSize = 400,
    quality = 0.9,
    mimeType = "image/jpeg",
    maintainAspectRatio = true,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (maintainAspectRatio) {
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
      } else {
        width = Math.min(width, maxSize);
        height = Math.min(height, maxSize);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Compress an image and return as a File with the original filename.
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to compressed File
 *
 * @example
 * ```ts
 * const compressedFile = await compressImageAsFile(originalFile, {
 *   maxSize: 400,
 *   quality: 0.9
 * });
 * // compressedFile.name will be "original-name.jpg"
 * ```
 */
export async function compressImageAsFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const blob = await compressImage(file, options);
  const mimeType = options.mimeType ?? "image/jpeg";
  const extension = mimeType.split("/")[1] || "jpg";
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}

/**
 * Get the dimensions of an image file.
 *
 * @param file - The image file or blob to measure
 * @returns Promise resolving to width and height
 *
 * @example
 * ```ts
 * const { width, height } = await getImageDimensions(file);
 * console.log(`Image is ${width}x${height}`);
 * ```
 */
export async function getImageDimensions(
  file: File | Blob,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
