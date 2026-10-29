import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Role } from '../types';

export const CLASS_ID = '12A7';

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

// Track existing section documents and their latest known versions in Firestore
const sectionExistsMap: Record<string, boolean> = {};
const sectionVersionMap: Record<string, number> = {};
let isMasterClassroomReady = false;

/**
 * Strips undefined values recursively by converting to plain JSON-compatible structures.
 * Ensures native Maps and Lists are stored in Firestore without undefined field errors.
 */
export function sanitizePayloadForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function truncateStr(val: string | undefined, maxLen: number, fallback: string): string {
  const clean = (val || fallback).trim();
  if (!clean) return fallback;
  return clean.slice(0, maxLen);
}

/**
 * Ensures the master `/classrooms/12A7` document exists in Firestore.
 * Must only be called when an authenticated & email-verified user is present.
 */
export async function ensureMasterClassroomDoc(meta?: {
  className?: string;
  schoolName?: string;
  teacherName?: string;
}): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) {
    return false;
  }
  if (isMasterClassroomReady) {
    return true;
  }

  const classroomPath = `classrooms/${CLASS_ID}`;
  const classroomRef = doc(db, 'classrooms', CLASS_ID);

  try {
    const snap = await getDoc(classroomRef);
    if (snap.exists()) {
      isMasterClassroomReady = true;
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, classroomPath);
  }

  try {
    await setDoc(classroomRef, {
      classId: CLASS_ID,
      className: truncateStr(meta?.className, 100, '12A7'),
      schoolName: truncateStr(meta?.schoolName, 200, 'THPT Vĩnh Lộc B'),
      teacherName: truncateStr(meta?.teacherName, 150, 'Trương Xuân Hòa'),
      ownerId: currentUser.uid,
      visibility: 'shared',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    isMasterClassroomReady = true;
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, classroomPath);
  }
}

/**
 * Subscribes to real-time updates for all classroom sections in Firestore.
 * Only attaches listeners when the user is authenticated.
 */
export function subscribeToClassroomSections(
  onSectionUpdate: (sectionId: ClassroomSectionId, payload: Record<string, any>, version: number) => void,
  onSyncStatusChange?: (status: 'synced' | 'syncing' | 'error') => void
): Unsubscribe {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return () => {};
  }

  const unsubscribes: Unsubscribe[] = [];

  for (const sectionId of ALL_SECTION_IDS) {
    const sectionPath = `classrooms/${CLASS_ID}/sections/${sectionId}`;
    const sectionRef = doc(db, 'classrooms', CLASS_ID, 'sections', sectionId);

    const unsub = onSnapshot(
      sectionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          sectionExistsMap[sectionId] = true;
          const data = snapshot.data();
          const version = typeof data.version === 'number' ? data.version : 1;
          sectionVersionMap[sectionId] = version;
          if (data.payload && typeof data.payload === 'object') {
            onSectionUpdate(sectionId, data.payload as Record<string, any>, version);
          }
          onSyncStatusChange?.('synced');
        } else {
          sectionExistsMap[sectionId] = false;
        }
      },
      (error) => {
        onSyncStatusChange?.('error');
        handleFirestoreError(error, OperationType.GET, sectionPath);
      }
    );

    unsubscribes.push(unsub);
  }

  return () => {
    unsubscribes.forEach((u) => u());
  };
}

export const CLIENT_INSTANCE_ID = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Persists a specific classroom section to both the server shared-state API and Firestore (when authenticated).
 */
export async function saveClassroomSection(
  sectionId: ClassroomSectionId,
  rawPayload: Record<string, any>,
  role: Role,
  meta?: { className?: string; schoolName?: string; teacherName?: string }
): Promise<number> {
  const cleanPayload = sanitizePayloadForFirestore(rawPayload);
  let serverUpdatedAt = Date.now();

  // 1. Always persist to backend shared-state API so all users with the link see updates immediately
  try {
    const res = await fetch('/api/shared-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        sectionId,
        payload: cleanPayload,
        updatedByRole: role,
        clientId: CLIENT_INSTANCE_ID,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.updatedAt === 'number') {
        serverUpdatedAt = data.updatedAt;
      }
    }
  } catch (err) {
    console.warn(`Backend shared-state sync warning for ${sectionId}:`, err);
  }

  // 2. If signed in with a verified Google account, persist directly to Cloud Firestore
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) {
    return serverUpdatedAt;
  }

  await ensureMasterClassroomDoc(meta);

  const sectionPath = `classrooms/${CLASS_ID}/sections/${sectionId}`;
  const sectionRef = doc(db, 'classrooms', CLASS_ID, 'sections', sectionId);
  const validRole: Role = role === 'teacher' || role === 'student' || role === 'parent' ? role : 'student';

  let existsInFirestore = sectionExistsMap[sectionId];
  if (existsInFirestore === undefined) {
    try {
      const snap = await getDoc(sectionRef);
      existsInFirestore = snap.exists();
      sectionExistsMap[sectionId] = existsInFirestore;
      if (existsInFirestore) {
        const d = snap.data();
        sectionVersionMap[sectionId] = typeof d?.version === 'number' ? d.version : 1;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, sectionPath);
    }
  }

  if (!existsInFirestore) {
    try {
      await setDoc(sectionRef, {
        sectionId,
        classId: CLASS_ID,
        sectionType: sectionId,
        payload: cleanPayload,
        updatedByUid: currentUser.uid,
        updatedByRole: validRole,
        status: 'active',
        version: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      sectionExistsMap[sectionId] = true;
      sectionVersionMap[sectionId] = 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, sectionPath);
    }
  } else {
    const nextVersion = Math.min(1000000, (sectionVersionMap[sectionId] || 1) + 1);
    try {
      await updateDoc(sectionRef, {
        payload: cleanPayload,
        updatedByUid: currentUser.uid,
        updatedByRole: validRole,
        version: nextVersion,
        updatedAt: serverTimestamp(),
      });
      sectionVersionMap[sectionId] = nextVersion;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, sectionPath);
    }
  }

  return serverUpdatedAt;
}

