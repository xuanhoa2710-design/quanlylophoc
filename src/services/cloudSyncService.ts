import { doc, setDoc, getDoc, getDocs, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { offloadInlineImagesInActivitiesPayload } from './cloudMediaService';

export type ClassroomSectionId =
  | 'config'
  | 'students_g1'
  | 'students_g2'
  | 'students_g3'
  | 'students_g4'
  | 'attendance'
  | 'emulation'
  | 'activities'
  | 'schedule';

export const ALL_SECTION_IDS: ClassroomSectionId[] = [
  'config',
  'students_g1',
  'students_g2',
  'students_g3',
  'students_g4',
  'attendance',
  'emulation',
  'activities',
  'schedule',
];

export const CLIENT_INSTANCE_ID = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const CLASSROOM_DOC_ID = 'lop_12A7';

export interface SaveSectionResult {
  updatedAt: number;
  firestoreSaved: boolean;
  serverSaved: boolean;
  cleanedPayload: Record<string, any>;
  error?: string;
}

export interface RemoteSectionSnapshot {
  sectionId: ClassroomSectionId;
  payload: Record<string, any>;
  updatedAt?: number;
  clientId?: string;
}

export const sanitizePayloadForFirestore = (payload: any): any => {
  try {
    return JSON.parse(JSON.stringify(payload ?? {}));
  } catch {
    return {};
  }
};

export const ensureMasterClassroomDoc = async (meta: {
  className: string;
  schoolName: string;
  teacherName: string;
}): Promise<void> => {
  try {
    const masterRef = doc(db, 'classrooms', CLASSROOM_DOC_ID);
    const snap = await getDoc(masterRef);
    if (!snap.exists()) {
      await setDoc(
        masterRef,
        {
          ...meta,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('ensureMasterClassroomDoc error:', err);
  }
};

export const fetchAllClassroomSectionsFromFirestore = async (): Promise<
  Record<string, RemoteSectionSnapshot>
> => {
  const result: Record<string, RemoteSectionSnapshot> = {};
  try {
    const colRef = collection(db, 'classrooms', CLASSROOM_DOC_ID, 'sections');
    const snapshot = await getDocs(colRef);
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const secId = docSnap.id as ClassroomSectionId;
      if (data && data.payload && ALL_SECTION_IDS.includes(secId)) {
        result[secId] = {
          sectionId: secId,
          payload: data.payload,
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : undefined,
          clientId: typeof data.clientId === 'string' ? data.clientId : undefined,
        };
      }
    });
  } catch (err) {
    console.warn('fetchAllClassroomSectionsFromFirestore warning:', err);
  }
  return result;
};

export const subscribeToClassroomSections = (
  onSectionUpdate: (
    sectionId: ClassroomSectionId,
    payload: Record<string, any>,
    updatedAt?: number,
    clientId?: string
  ) => void,
  onStatusChange?: (status: 'synced' | 'syncing' | 'offline' | 'error') => void
): (() => void) => {
  try {
    const colRef = collection(db, 'classrooms', CLASSROOM_DOC_ID, 'sections');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            const secId = change.doc.id as ClassroomSectionId;
            if (data && data.payload && ALL_SECTION_IDS.includes(secId)) {
              onSectionUpdate(
                secId,
                data.payload,
                typeof data.updatedAt === 'number' ? data.updatedAt : undefined,
                typeof data.clientId === 'string' ? data.clientId : undefined
              );
            }
          }
        });
        if (onStatusChange) onStatusChange('synced');
      },
      (error) => {
        console.warn('Firestore real-time listener error:', error);
        if (onStatusChange) onStatusChange('error');
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToClassroomSections setup error:', err);
    if (onStatusChange) onStatusChange('error');
    return () => {};
  }
};

export const saveClassroomSection = async (
  sectionId: ClassroomSectionId,
  payload: Record<string, any>,
  role?: string,
  appConfig?: any
): Promise<SaveSectionResult> => {
  const now = Date.now();
  let cleanPayload = sanitizePayloadForFirestore(payload);
  let resolvedTs = now;
  let firestoreSaved = false;
  let serverSaved = false;
  let lastError: string | undefined;

  // Automatically offload any large inline data:image/* in activities to permanent Firestore media docs
  // so `activities` NEVER approaches Firestore's 1 MiB document size limit.
  if (sectionId === 'activities') {
    try {
      const payloadStr = JSON.stringify(cleanPayload);
      if (payloadStr.includes('data:image/') && payloadStr.length > 150 * 1024) {
        const { payload: slimmed, offloadedCount } =
          await offloadInlineImagesInActivitiesPayload(cleanPayload);
        if (offloadedCount > 0) {
          cleanPayload = sanitizePayloadForFirestore(slimmed);
        }
      }
    } catch (err) {
      console.warn('Auto-offload inline images warning:', err);
    }
  }

  // 1. PRIMARY PERSISTENCE: Save to Cloud Firestore (permanent across container restarts & all devices)
  try {
    const payloadBytes = new Blob([JSON.stringify(cleanPayload)]).size;
    if (payloadBytes < 950 * 1024) {
      const secRef = doc(db, 'classrooms', CLASSROOM_DOC_ID, 'sections', sectionId);
      await setDoc(
        secRef,
        {
          sectionId,
          payload: cleanPayload,
          updatedAt: resolvedTs,
          updatedByRole: role || 'teacher',
          className: appConfig?.className || '12A7',
          clientId: CLIENT_INSTANCE_ID,
        },
        { merge: true }
      );
      firestoreSaved = true;
    } else {
      lastError = `Dữ liệu mục "${sectionId}" vượt quá giới hạn 1MB của Firestore (${(payloadBytes / 1024).toFixed(0)}KB).`;
      console.warn(lastError);
    }
  } catch (err: any) {
    lastError = err?.message || 'Lỗi lưu dữ liệu lên Cloud Firestore.';
    console.warn(`Firestore sync warning (${sectionId}):`, err);
  }

  // 2. SECONDARY REAL-TIME PUSH: Persist to backend Shared State API (instant SSE push)
  try {
    const res = await fetch('/api/shared-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionId,
        payload: cleanPayload,
        updatedByRole: role || 'student',
        clientId: CLIENT_INSTANCE_ID,
      }),
    });
    if (res.ok) {
      serverSaved = true;
      const data = await res.json();
      if (data && typeof data.updatedAt === 'number' && data.updatedAt > resolvedTs) {
        resolvedTs = data.updatedAt;
      }
    }
  } catch (err) {
    console.warn(`Shared state server sync warning (${sectionId}):`, err);
  }

  return {
    updatedAt: resolvedTs,
    firestoreSaved,
    serverSaved,
    cleanedPayload: cleanPayload,
    error: firestoreSaved ? undefined : lastError,
  };
};
