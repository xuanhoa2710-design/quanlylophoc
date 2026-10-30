import { doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';

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

export const subscribeToClassroomSections = (
  onSectionUpdate: (sectionId: ClassroomSectionId, payload: Record<string, any>) => void,
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
              onSectionUpdate(secId, data.payload);
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
): Promise<number> => {
  const now = Date.now();
  const cleanPayload = sanitizePayloadForFirestore(payload);
  const secRef = doc(db, 'classrooms', CLASSROOM_DOC_ID, 'sections', sectionId);
  await setDoc(
    secRef,
    {
      sectionId,
      payload: cleanPayload,
      updatedAt: now,
      updatedByRole: role || 'teacher',
      className: appConfig?.className || '12A7',
      clientId: CLIENT_INSTANCE_ID,
    },
    { merge: true }
  );
  return now;
};
