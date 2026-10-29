/**
 * Firestore Security Rules Verification Suite (Dirty Dozen Payloads)
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: {
    uid: string;
    email: string;
    email_verified: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write to Classroom',
    operation: 'create',
    path: '/classrooms/12A7',
    auth: null,
    payload: { classId: '12A7', className: '12A7' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoofing',
    operation: 'create',
    path: '/classrooms/12A7',
    auth: { uid: 'attacker-1', email: 'xuanhoa2710@gmail.com', email_verified: false },
    payload: { classId: '12A7', className: '12A7' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Ghost Field Injection on Create',
    operation: 'create',
    path: '/classrooms/12A7',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      classId: '12A7',
      className: '12A7',
      schoolName: 'THPT Vinh Loc B',
      teacherName: 'Thay Hoa',
      ownerId: 'user-1',
      visibility: 'shared',
      status: 'active',
      isSuperAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Section Update',
    operation: 'update',
    path: '/classrooms/12A7/sections/config',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      hackedField: 'injected',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Identity Spoofing on Classroom Create',
    operation: 'create',
    path: '/classrooms/12A7',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      classId: '12A7',
      className: '12A7',
      schoolName: 'THPT Vinh Loc B',
      teacherName: 'Thay Hoa',
      ownerId: 'victim-uid',
      visibility: 'shared',
      status: 'active',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable Field Mutation on Classroom Update',
    operation: 'update',
    path: '/classrooms/12A7',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      ownerId: 'new-owner-uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned Subcollection Write Without Parent Classroom',
    operation: 'create',
    path: '/classrooms/ghost_class/sections/config',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      sectionId: 'config',
      classId: 'ghost_class',
      sectionType: 'config',
      payload: {},
      updatedByUid: 'user-1',
      updatedByRole: 'student',
      status: 'active',
      version: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Terminal State Bypass on Locked Section',
    operation: 'update',
    path: '/classrooms/12A7/sections/config',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      status: 'active',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Value / Size Poisoning on Classroom Name',
    operation: 'create',
    path: '/classrooms/12A7',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      classId: '12A7',
      className: 'A'.repeat(500),
      schoolName: 'THPT Vinh Loc B',
      teacherName: 'Thay Hoa',
      ownerId: 'user-1',
      visibility: 'shared',
      status: 'active',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client Timestamp Forgery',
    operation: 'update',
    path: '/classrooms/12A7/sections/config',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      updatedAt: '2099-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Self-Assigned Privilege Escalation in /admins',
    operation: 'create',
    path: '/admins/user-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      uid: 'user-1',
      email: 'user1@example.com',
      role: 'admin',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized List Query Scraping',
    operation: 'list',
    path: '/classrooms',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
