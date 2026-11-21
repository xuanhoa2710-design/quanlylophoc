import { uploadImageToCloudMedia } from '../services/cloudMediaService';

/**
 * Utility for client-side image compression and resizing so photos uploaded
 * from computers or phones (camera/gallery) stay lightweight (~50KB-140KB)
 * and persist permanently in Cloud Firestore across reloads and all devices.
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
 * Compress an image file on the client and upload it permanently to Cloud Firestore
 * (`classrooms/lop_12A7/media/{id}`), returning a lightweight permanent reference
 * (`fsmedia://{id}`). Falls back to `/api/media/upload-image` or compact inline base64
 * only if Firestore is unreachable.
 */
export async function uploadImageFileToServer(
  file: File,
  maxDimension: number = 960,
  quality: number = 0.72
): Promise<string> {
  const compressedDataUrl = await compressImageFileToDataUrl(file, maxDimension, quality);

  // 1. Primary: Permanent Cloud Firestore media document (survives all reloads & container restarts)
  try {
    const cloudRefUrl = await uploadImageToCloudMedia(compressedDataUrl, file.name || 'photo.jpg');
    if (cloudRefUrl) {
      return cloudRefUrl;
    }
  } catch (err) {
    console.warn('Cloud Firestore media upload failed, trying server fallback:', err);
  }

  // 2. Secondary fallback: Server media upload
  try {
    const response = await fetch('/api/media/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name || 'photo.jpg',
        mimeType: 'image/jpeg',
        base64Data: compressedDataUrl,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.url === 'string' && data.url.trim().length > 0) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Upload image to server failed, falling back to compact inline image:', err);
  }

  // 3. Offline fallback: compact inline data URL
  try {
    return await compressImageFileToDataUrl(file, 520, 0.5);
  } catch {
    return compressedDataUrl;
  }
}

/**
 * Compress and upload multiple image files sequentially to permanent Cloud Firestore media
 * so multi-photo posts in Happy Corner & Announcements stay lightweight (~32 bytes per image ref)
 * and persist permanently across reloads, devices, and server restarts.
 */
export async function compressMultipleImageFiles(
  files: FileList | File[],
  maxDimension: number = 1280,
  quality: number = 0.8,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const fileArray = Array.from(files || []);
  if (fileArray.length === 0) return [];

  const results: string[] = [];
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    try {
      const urlOrDataUrl = await uploadImageFileToServer(file, maxDimension, quality);
      if (urlOrDataUrl) {
        results.push(urlOrDataUrl);
      }
    } catch (err) {
      console.warn('Error uploading/compressing image file:', err);
    } finally {
      if (onProgress) {
        onProgress(i + 1, fileArray.length);
      }
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

