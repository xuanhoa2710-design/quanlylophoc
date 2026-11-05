/**
 * Utility for client-side image compression and resizing so photos uploaded
 * from computers or phones (camera/gallery) stay lightweight (~40KB-80KB)
 * and sync reliably across devices via Firestore and shared state.
 */
export async function compressImageFileToDataUrl(
  file: File,
  maxDimension: number = 960,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, HEIC...).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh từ thiết bị.'));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Dữ liệu hình ảnh trống.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to raw dataUrl if Image decode fails
        resolve(dataUrl);
      };
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts month (1..12) and day (1..31) from birthday string in DD/MM/YYYY or YYYY-MM-DD format
 */
export function parseStudentBirthday(birthdayStr?: string): { day: number; month: number; year: number } | null {
  if (!birthdayStr) return null;
  const trimmed = birthdayStr.trim();
  // Format DD/MM/YYYY or D/M/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    return {
      day: parseInt(dmyMatch[1], 10),
      month: parseInt(dmyMatch[2], 10),
      year: parseInt(dmyMatch[3], 10),
    };
  }
  // Format YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    return {
      year: parseInt(ymdMatch[1], 10),
      month: parseInt(ymdMatch[2], 10),
      day: parseInt(ymdMatch[3], 10),
    };
  }
  return null;
}

/**
 * Compress multiple image files in parallel while keeping total payload light for Firestore & SSE sync
 */
export async function compressMultipleImageFiles(
  files: FileList | File[],
  maxDimension: number = 900,
  quality: number = 0.72
): Promise<string[]> {
  const fileArray = Array.from(files || []);
  if (fileArray.length === 0) return [];
  // Adjust dimension slightly if uploading many photos at once so Firestore doc stays well under 1MB
  const adjustedDim = fileArray.length > 4 ? Math.min(maxDimension, 780) : maxDimension;
  const adjustedQuality = fileArray.length > 4 ? Math.min(quality, 0.68) : quality;

  const results: string[] = [];
  for (const file of fileArray) {
    try {
      const dataUrl = await compressImageFileToDataUrl(file, adjustedDim, adjustedQuality);
      if (dataUrl) results.push(dataUrl);
    } catch (err) {
      console.warn('Error compressing image file:', err);
    }
  }
  return results;
}

