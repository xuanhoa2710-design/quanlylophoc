import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CLASSROOM_DOC_ID = 'lop_12A7';
const MEDIA_PREFIX = 'fsmedia://';
const IDB_NAME = 'a7_cloud_media_cache_v1';
const IDB_STORE = 'images';

// Fast in-memory cache so images never flicker on re-render or navigation
const memoryCache = new Map<string, string>();
const inFlightFetches = new Map<string, Promise<string | null>>();

export const isCloudMediaUrl = (url?: string | null): boolean => {
  return typeof url === 'string' && url.startsWith(MEDIA_PREFIX);
};

export const extractCloudMediaId = (url: string): string => {
  return url.slice(MEDIA_PREFIX.length).trim();
};

export const makeCloudMediaUrl = (mediaId: string): string => {
  return `${MEDIA_PREFIX}${mediaId}`;
};

// --- IndexedDB helpers (never touches localStorage 5MB quota) ---
let idbPromise: Promise<IDBDatabase | null> | null = null;

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains(IDB_STORE)) {
          database.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return idbPromise;
}

async function idbGet(mediaId: string): Promise<string | null> {
  try {
    const database = await openMediaDb();
    if (!database) return null;
    return await new Promise((resolve) => {
      const tx = database.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(mediaId);
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(mediaId: string, dataUrl: string): Promise<void> {
  try {
    const database = await openMediaDb();
    if (!database) return;
    await new Promise<void>((resolve) => {
      const tx = database.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(dataUrl, mediaId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore IndexedDB quota errors
  }
}

/**
 * Re-compresses a data URL using an offscreen canvas if it exceeds maxBytes (~420KB)
 * so every image document stays comfortably under Firestore's 1 MiB document limit.
 */
async function ensureFirestoreSafeDataUrl(
  dataUrl: string,
  maxBytes: number = 420 * 1024
): Promise<string> {
  if (dataUrl.length <= maxBytes || typeof document === 'undefined') {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        const attempts: Array<{ maxDim: number; quality: number }> = [
          { maxDim: 960, quality: 0.72 },
          { maxDim: 800, quality: 0.62 },
          { maxDim: 640, quality: 0.52 },
          { maxDim: 480, quality: 0.45 },
        ];

        for (const attempt of attempts) {
          let { width, height } = img;
          if (width > attempt.maxDim || height > attempt.maxDim) {
            if (width >= height) {
              height = Math.round((height * attempt.maxDim) / width);
              width = attempt.maxDim;
            } else {
              width = Math.round((width * attempt.maxDim) / height);
              height = attempt.maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) break;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const candidate = canvas.toDataURL('image/jpeg', attempt.quality);
          if (candidate.length <= maxBytes) {
            resolve(candidate);
            return;
          }
        }
        resolve(dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Permanently saves a single image in Cloud Firestore under:
 *   classrooms/lop_12A7/media/{mediaId}
 * Returns a tiny ~32-byte reference URL `fsmedia://{mediaId}` that survives
 * app restarts, container restarts, and syncs across all phones & computers.
 */
export async function uploadImageToCloudMedia(
  dataUrl: string,
  fileName: string = 'photo.jpg'
): Promise<string> {
  const safeDataUrl = await ensureFirestoreSafeDataUrl(dataUrl, 420 * 1024);

  if (safeDataUrl.length > 880 * 1024) {
    throw new Error('Ảnh quá lớn để lưu lên đám mây. Vui lòng chọn ảnh dung lượng nhỏ hơn.');
  }

  const mediaId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const mediaRef = doc(db, 'classrooms', CLASSROOM_DOC_ID, 'media', mediaId);

  await setDoc(mediaRef, {
    mediaId,
    dataUrl: safeDataUrl,
    fileName: fileName.slice(0, 120),
    mimeType: 'image/jpeg',
    size: safeDataUrl.length,
    createdAt: Date.now(),
  });

  // Warm caches immediately so the author sees the image instantaneously
  memoryCache.set(mediaId, safeDataUrl);
  void idbSet(mediaId, safeDataUrl);

  return makeCloudMediaUrl(mediaId);
}

/**
 * Synchronously checks in-memory cache for an `fsmedia://` URL.
 */
export function getCachedCloudMediaSync(url?: string | null): string | null {
  if (!url) return null;
  if (!isCloudMediaUrl(url)) return url;
  const mediaId = extractCloudMediaId(url);
  return memoryCache.get(mediaId) || null;
}

/**
 * Resolves an `fsmedia://{mediaId}` URL to its actual displayable data URL
 * via Memory Cache -> IndexedDB -> Cloud Firestore.
 */
export async function resolveCloudMediaUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (!isCloudMediaUrl(url)) return url;

  const mediaId = extractCloudMediaId(url);
  if (!mediaId) return null;

  const memHit = memoryCache.get(mediaId);
  if (memHit) return memHit;

  const existingPromise = inFlightFetches.get(mediaId);
  if (existingPromise) return existingPromise;

  const loader = (async (): Promise<string | null> => {
    try {
      const idbHit = await idbGet(mediaId);
      if (idbHit) {
        memoryCache.set(mediaId, idbHit);
        return idbHit;
      }

      const mediaRef = doc(db, 'classrooms', CLASSROOM_DOC_ID, 'media', mediaId);
      const snap = await getDoc(mediaRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.dataUrl === 'string' && data.dataUrl.length > 0) {
          memoryCache.set(mediaId, data.dataUrl);
          void idbSet(mediaId, data.dataUrl);
          return data.dataUrl;
        }
      }
      return null;
    } catch (err) {
      console.warn(`Failed to resolve cloud media ${mediaId}:`, err);
      return null;
    } finally {
      inFlightFetches.delete(mediaId);
    }
  })();

  inFlightFetches.set(mediaId, loader);
  return loader;
}

/**
 * Scans an `activities` section payload (happyPosts & announcements) and automatically
 * offloads any large inline `data:image/...` strings into Cloud Firestore `media/{id}`
 * documents so the `activities` document NEVER exceeds Firestore's 1 MiB limit.
 */
export async function offloadInlineImagesInActivitiesPayload(
  payload: Record<string, any>
): Promise<{ payload: Record<string, any>; offloadedCount: number }> {
  if (!payload || typeof payload !== 'object') {
    return { payload, offloadedCount: 0 };
  }

  let offloadedCount = 0;
  const cloned = JSON.parse(JSON.stringify(payload));

  const offloadUrl = async (val: any): Promise<any> => {
    if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 24 * 1024) {
      try {
        const refUrl = await uploadImageToCloudMedia(val, 'migrated_photo.jpg');
        offloadedCount += 1;
        return refUrl;
      } catch (err) {
        console.warn('Could not offload inline image:', err);
        return val;
      }
    }
    return val;
  };

  const processList = async (items: any[]) => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
        const updatedList: string[] = [];
        for (const u of item.imageUrls) {
          updatedList.push(await offloadUrl(u));
        }
        item.imageUrls = updatedList;
        item.imageUrl = updatedList[0];
      } else if (typeof item.imageUrl === 'string') {
        item.imageUrl = await offloadUrl(item.imageUrl);
      }
    }
  };

  if (Array.isArray(cloned.happyPosts)) {
    await processList(cloned.happyPosts);
  }
  if (Array.isArray(cloned.announcements)) {
    await processList(cloned.announcements);
  }

  return { payload: cloned, offloadedCount };
}
