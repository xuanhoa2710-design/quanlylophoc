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
    const hasImageExt = /\.(jpe?g|png|webp|gif|bmp|heic|heif|jfif|avif)$/i.test(file.name || '');
    if (!file.type.startsWith('image/') && !hasImageExt) {
      reject(new Error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, HEIC...).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh từ thiết bị.'));
    reader.onload = (event) => {
      let dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Dữ liệu hình ảnh trống.'));
        return;
      }

      if (dataUrl.startsWith('data:application/octet-stream;base64,')) {
        const ext = (file.name || '').toLowerCase();
        const inferredMime = ext.endsWith('.png')
          ? 'image/png'
          : ext.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';
        dataUrl = dataUrl.replace('data:application/octet-stream;base64,', `data:${inferredMime};base64,`);
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

/**
 * Upload a single video clip from phone or computer to the backend media server
 * and return its streamable URL (/api/media/videos/...).
 */
export async function uploadVideoFileToServer(
  file: File,
  maxSizeMB: number = 35
): Promise<string> {
  const hasVideoExt = /\.(mp4|mov|webm|m4v|ogg|ogv|3gp|avi|mkv)$/i.test(file.name || '');
  if (!file.type.startsWith('video/') && !hasVideoExt) {
    throw new Error('Vui lòng chọn file video/clip hợp lệ (MP4, MOV, WEBM, 3GP...).');
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Dung lượng clip vượt quá giới hạn ${maxSizeMB}MB. Vui lòng chọn clip ngắn hơn hoặc dán link video.`);
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file video từ thiết bị.'));
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (!result) {
        reject(new Error('Dữ liệu video trống.'));
        return;
      }
      resolve(result);
    };
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/media/upload-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name || 'clip.mp4',
      mimeType: file.type || 'video/mp4',
      base64Data,
    }),
  });

  if (!response.ok) {
    let errMsg = 'Không thể tải video lên máy chủ.';
    try {
      const errData = await response.json();
      if (errData?.error) errMsg = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (!data?.url) {
    throw new Error('Máy chủ không trả về đường dẫn video.');
  }
  return data.url;
}

/**
 * Upload multiple video clip files sequentially and return their streamable URLs.
 */
export async function uploadMultipleVideoFiles(
  files: FileList | File[],
  maxSizeMB: number = 35
): Promise<string[]> {
  const fileArray = Array.from(files || []);
  if (fileArray.length === 0) return [];
  const uploadedUrls: string[] = [];
  for (const file of fileArray) {
    const url = await uploadVideoFileToServer(file, maxSizeMB);
    if (url) uploadedUrls.push(url);
  }
  return uploadedUrls;
}

/**
 * Parses a video URL to support direct HTML5 <video> playback as well as YouTube and Google Drive embeds.
 */
export function getEmbedVideoInfo(rawUrl: string): {
  type: 'youtube' | 'drive' | 'direct';
  embedUrl: string;
  originalUrl: string;
} {
  const url = (rawUrl || '').trim();
  // YouTube watch / youtu.be / shorts / embed
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      originalUrl: url,
    };
  }

  // Google Drive file preview
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      originalUrl: url,
    };
  }

  return {
    type: 'direct',
    embedUrl: url,
    originalUrl: url,
  };
}

