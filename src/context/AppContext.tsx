import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGooglePopup, signOutFirebaseUser } from '../firebase';
import {
  ClassroomSectionId,
  ALL_SECTION_IDS,
  CLIENT_INSTANCE_ID,
  sanitizePayloadForFirestore,
  ensureMasterClassroomDoc,
  subscribeToClassroomSections,
  saveClassroomSection,
} from '../services/cloudSyncService';
import { VIOLATIONS_CATALOG } from '../data/violationsCatalog';
import {
  SchoolWeekRange,
  getWeekRangeByIndex,
  getWeekIndexFromDate,
  getWeekRangeFromDate,
  isDateInWeek,
  getAllSchoolWeeks,
} from '../utils/weekUtils';

export {
  getWeekRangeByIndex,
  getWeekIndexFromDate,
  getWeekRangeFromDate,
  isDateInWeek,
  getAllSchoolWeeks,
};
export type { SchoolWeekRange };
import {
  Student,
  Role,
  StudentCadreRole,
  DailyAttendance,
  AttendanceStatus,
  Assignment,
  Announcement,
  EvaluationComment,
  ChatMessage,
  Appointment,
  HappyPost,
  TimetableEntry,
  TimetablePeriod,
  ClassAppConfig,
  StudentDisciplineEntry,
  BonusPointEntry,
  EmulationScoreAdjustment,
  DutyScheduleItem,
  SupplementaryAttendanceEntry,
} from '../types';
import { INITIAL_STUDENTS } from '../data/studentsData';
import {
  INITIAL_TIMETABLE,
  INITIAL_DUTY_SCHEDULE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_HAPPY_POSTS,
  INITIAL_MESSAGES,
  INITIAL_APPOINTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_ALL_ATTENDANCE_DAYS,
  INITIAL_SUPPLEMENTARY_ATTENDANCE,
  INITIAL_APP_CONFIG,
  INITIAL_DISCIPLINE_ENTRIES,
  INITIAL_BONUS_ENTRIES,
  INITIAL_EMULATION_ADJUSTMENTS,
  INITIAL_CURRENT_WEEK,
} from '../data/seedData';

export const TEACHER_PASSWORD = 'Hoahieu87@';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  teacher: ['overview', 'students', 'attendance', 'grades', 'assignments', 'discipline', 'profile', 'evaluations', 'leaderboard', 'announcements', 'happy_corner', 'ai_assistant', 'student_ai', 'timetable', 'duty_schedule'],
  student: ['overview', 'student_ai', 'timetable', 'duty_schedule', 'assignments', 'discipline', 'profile', 'attendance', 'leaderboard', 'announcements', 'happy_corner'],
  parent: ['overview', 'discipline', 'attendance', 'evaluations', 'announcements', 'timetable'],
};

export const normalizeToSchoolDay = (dateStr: string): { date: string; wasWeekend: boolean; dayLabel: string; dayIndex: number } => {
  const parts = dateStr.split('-').map(Number);
  const dt = parts.length === 3 && !isNaN(parts[0]) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
  const rawDay = dt.getDay();
  let wasWeekend = false;
  if (rawDay === 6) { dt.setDate(dt.getDate() - 1); wasWeekend = true; }
  else if (rawDay === 0) { dt.setDate(dt.getDate() - 2); wasWeekend = true; }
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const finalDay = dt.getDay();
  const labels: Record<number, string> = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6' };
  return { date: `${y}-${m}-${d}`, wasWeekend, dayLabel: labels[finalDay] || 'Thứ 6', dayIndex: finalDay >= 1 && finalDay <= 5 ? finalDay : 5 };
};

export const getWeekSchoolDays = (dateStr: string): Array<{ date: string; dayLabel: string; shortDate: string; isFriday: boolean }> => {
  const norm = normalizeToSchoolDay(dateStr);
  const [y, m, d] = norm.date.split('-').map(Number);
  const current = new Date(y, m - 1, d);
  const dayOfWeek = current.getDay();
  const monday = new Date(current);
  monday.setDate(current.getDate() - (dayOfWeek - 1));
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  return dayNames.map((label, idx) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + idx);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return { date: `${yy}-${mm}-${dd}`, dayLabel: label, shortDate: `${dd}/${mm}`, isFriday: idx === 4 };
  });
};

export interface WeeklyEmulationSummary {
  weekNumber: number;
  dateRangeLabel: string;
  isAutoSummarized: boolean;
  statusLabel: string;
  summarizedAt: string;
  classAvgScore: number;
  perfectCount: number;
  deductedCount: number;
  totalViolations: number;
  totalBonuses: number;
  groupRankings: Array<{ rank: number; group: number; avgScore: number; perfectCount: number; totalCount: number; violationCount: number; flagTitle: string }>;
  topStudents: Array<{ student: Student; total: number; bonus: number; deducted: number; classification: string }>;
  violatingStudents: Array<{ student: Student; total: number; deducted: number; violations: StudentDisciplineEntry[] }>;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  isTeacherAuthenticated: boolean;
  authenticateTeacher: (password: string) => boolean;
  logoutTeacher: () => void;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  requestTeacherAccess: (onSuccess?: () => void) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  currentStudent: Student | undefined;
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'stt'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  assignStudentCadreRole: (studentId: string, cadreRole: StudentCadreRole) => void;
  isStudentUnlocked: (studentId: string) => boolean;
  unlockStudent: (studentId: string, pin: string) => boolean;
  lockStudent: (studentId: string) => void;
  setStudentPin: (studentId: string, newPin: string, oldPin?: string) => { success: boolean; message: string };
  removeStudentPin: (studentId: string, currentPin?: string) => { success: boolean; message: string };
  resetStudentPinByTeacher: (studentId: string, newDefaultPin?: string) => { success: boolean; message: string };
  resetAllStudentPinsByTeacher: (newDefaultPin?: string) => { success: boolean; message: string };
  currentDateAttendance: DailyAttendance;
  selectedAttendanceDate: string;
  setSelectedAttendanceDate: (date: string) => void;
  updateAttendanceStatus: (studentId: string, status: AttendanceStatus, targetDate?: string, violationOpts?: { ruleNumber?: number; pointsDeducted?: number; note?: string; recordedBy?: string; skipViolationSync?: boolean }) => void;
  markAllPresent: (targetDate?: string) => void;
  saveAttendanceNote: (note: string, targetDate?: string) => void;
  allAttendanceDays: Record<string, DailyAttendance>;
  saveDateAttendance: (date: string, attendance: DailyAttendance) => void;
  scanQRAttendance: (studentCodeOrId: string) => { success: boolean; message: string; studentName?: string };
  supplementaryAttendanceList: SupplementaryAttendanceEntry[];
  addSupplementaryAttendance: (entry: Omit<SupplementaryAttendanceEntry, 'id' | 'createdAt'>) => void;
  deleteSupplementaryAttendance: (id: string) => void;
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, content: string, attachments?: string[]) => void;
  gradeSubmission: (assignmentId: string, studentId: string, grade: number, feedback: string) => void;
  updateSubjectScore: (studentId: string, subjectKey: keyof Student['scores'], field: 'regular' | 'midterm' | 'final', value: number | number[]) => void;
  updateConduct: (studentId: string, conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt') => void;
  importExcelScores: (records: Array<{ studentId: string; scores: Partial<Record<keyof Student['scores'], number | { avg?: number; regular?: number[]; midterm?: number; final?: number }>>; conduct?: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' }>) => { successCount: number; message: string };
  evaluations: EvaluationComment[];
  addEvaluation: (evaluation: Omit<EvaluationComment, 'id' | 'createdAt'>) => void;
  updateEvaluation: (evaluation: EvaluationComment) => void;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, updatedData: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  sendMessage: (studentId: string, text: string, fileName?: string) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  happyPosts: HappyPost[];
  addHappyPost: (post: Omit<HappyPost, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>) => void;
  updateHappyPost: (id: string, updatedData: Partial<HappyPost>) => void;
  deleteHappyPost: (id: string) => void;
  deletePostComment: (postId: string, commentId: string) => void;
  toggleLikePost: (postId: string, userId: string) => void;
  addPostComment: (postId: string, author: string, text: string) => void;
  timetable: TimetableEntry[];
  updateTimetable: (newTimetable: TimetableEntry[]) => void;
  updatePeriod: (day: string, periodNumber: number, data: Partial<TimetablePeriod>, session?: 'morning' | 'afternoon') => void;
  addPeriod: (day: string, session: 'morning' | 'afternoon', data: { subject: string; teacher: string; room: string; time?: string }) => void;
  deletePeriod: (day: string, session: 'morning' | 'afternoon', periodNumber: number) => void;
  resetTimetable: () => void;
  dutySchedule: DutyScheduleItem[];
  updateDutySchedule: (newSchedule: DutyScheduleItem[]) => void;
  updateDutyItem: (id: string, itemData: Partial<DutyScheduleItem>) => void;
  addDutyItem: (itemData: Omit<DutyScheduleItem, 'id'>) => void;
  deleteDutyItem: (id: string) => void;
  resetDutySchedule: () => void;
  appConfig: ClassAppConfig;
  updateAppConfig: (config: Partial<ClassAppConfig>) => void;
  resetAppConfig: () => void;
  isAppConfigModalOpen: boolean;
  setIsAppConfigModalOpen: (open: boolean) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  disciplineEntries: StudentDisciplineEntry[];
  bonusEntries: BonusPointEntry[];
  emulationScoreAdjustments: EmulationScoreAdjustment[];
  addDisciplineEntry: (entry: Omit<StudentDisciplineEntry, 'id' | 'createdAt'>) => void;
  updateDisciplineEntry: (id: string, updated: Partial<StudentDisciplineEntry>) => void;
  deleteDisciplineEntry: (id: string) => void;
  addBonusPointEntry: (entry: Omit<BonusPointEntry, 'id' | 'createdAt'>) => void;
  updateBonusPointEntry: (id: string, updated: Partial<BonusPointEntry>) => void;
  deleteBonusPointEntry: (id: string) => void;
  setEmulationScoreAdjustment: (adjustment: Omit<EmulationScoreAdjustment, 'id' | 'createdAt'>) => void;
  removeEmulationScoreAdjustment: (studentId: string, weekNumber: number) => void;
  getStudentWeeklyScore: (studentId: string, week?: number) => { initialPoints: number; deducted: number; bonus: number; autoScore: number; total: number; isAdjustedByTeacher: boolean; adjustment?: EmulationScoreAdjustment; violations: StudentDisciplineEntry[]; bonuses: BonusPointEntry[]; classification: 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu' };
  getWeeklyEmulationSummary: (week?: number) => WeeklyEmulationSummary;
  triggerAutoWeeklySummary: (week?: number) => WeeklyEmulationSummary;
  recentAlerts: string[];
  clearAlerts: () => void;
  isJsonModalOpen: boolean;
  setIsJsonModalOpen: (open: boolean) => void;
  getExportJsonPayload: (scope?: 'all' | 'students' | 'attendance_discipline') => Record<string, any>;
  downloadDataAsJson: (scope?: 'all' | 'students' | 'attendance_discipline') => string;
  importDataFromJson: (jsonString: string) => { success: boolean; message: string };
  resetToHardcodedDefaultData: () => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string;
  firebaseUserEmail: string | null;
  firebaseUserName: string | null;
  loginWithGoogleCloud: () => Promise<void>;
  logoutGoogleCloud: () => Promise<void>;
  syncAllToCloudNow: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'a7_students_v2026_10_25_hardcoded',
  ROLE: 'a7_user_role_v2026_10_25_hardcoded',
  ACTIVE_STUDENT: 'a7_active_student_v2026_10_25_hardcoded',
  ATTENDANCE_DAYS: 'a7_attendance_days_v2026_10_25_hardcoded',
  SUPPLEMENTARY_ATTENDANCE: 'a7_supp_attendance_v2026_10_25_hardcoded',
  ASSIGNMENTS: 'a7_assignments_v2026_10_25_hardcoded',
  EVALUATIONS: 'a7_evaluations_v2026_10_25_hardcoded',
  ANNOUNCEMENTS: 'a7_announcements_v2026_10_25_hardcoded',
  MESSAGES: 'a7_messages_v2026_10_25_hardcoded',
  APPOINTMENTS: 'a7_appointments_v2026_10_25_hardcoded',
  HAPPY_POSTS: 'a7_happy_posts_v2026_10_25_hardcoded',
  TIMETABLE: 'a7_timetable_v2026_10_25_hardcoded',
  DUTY_SCHEDULE: 'a7_duty_schedule_v2026_10_25_hardcoded',
  APP_CONFIG: 'a7_app_config_v2026_10_25_hardcoded',
  DISCIPLINE_ENTRIES: 'a7_discipline_entries_v2026_10_25_hardcoded',
  BONUS_ENTRIES: 'a7_bonus_entries_v2026_10_25_hardcoded',
  EMULATION_ADJUSTMENTS: 'a7_emulation_adjustments_v2026_10_25_hardcoded',
  CURRENT_WEEK: 'a7_current_week_v2026_10_25_hardcoded',
};

const safeGetLocal = (key: string): string | null => {
  try { if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key); } catch (e) { console.warn(e); }
  return null;
};
const safeSetLocal = (key: string, value: string): void => {
  try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value); } catch (e) { console.warn(e); }
};
const safeRemoveLocal = (key: string): void => {
  try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key); } catch (e) { console.warn(e); }
};
const safeGetSession = (key: string): string | null => {
  try { if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage.getItem(key); } catch (e) { console.warn(e); }
  return null;
};
const safeSetSession = (key: string, value: string): void => {
  try { if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.setItem(key, value); } catch (e) { console.warn(e); }
};
const safeRemoveSession = (key: string): void => {
  try { if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.removeItem(key); } catch (e) { console.warn(e); }
};

const DEFAULT_SUBJECT_SCORE = { regular: [8.0, 8.0], midterm: 8.0, final: 8.0, avg: 8.0 };

const normalizeStudentRecord = (raw: any, index: number, defaultRoles: Record<string, StudentCadreRole>): Student => {
  const fallback = INITIAL_STUDENTS[index] || INITIAL_STUDENTS[0];
  const rawScores = raw?.scores && typeof raw.scores === 'object' ? raw.scores : fallback?.scores || {};
  const ensureSubject = (key: keyof Student['scores']) => {
    const sub = rawScores?.[key] || fallback?.scores?.[key] || DEFAULT_SUBJECT_SCORE;
    return {
      regular: Array.isArray(sub?.regular) ? sub.regular : [8.0, 8.0],
      midterm: typeof sub?.midterm === 'number' ? sub.midterm : 8.0,
      final: typeof sub?.final === 'number' ? sub.final : 8.0,
      avg: typeof sub?.avg === 'number' ? sub.avg : 8.0,
    };
  };
  const rawStats = raw?.attendanceStats && typeof raw.attendanceStats === 'object' ? raw.attendanceStats : fallback?.attendanceStats;
  const id = raw?.id || fallback?.id || `hs-${index + 1}`;
  return {
    ...fallback,
    ...raw,
    id,
    stt: typeof raw?.stt === 'number' ? raw.stt : index + 1,
    code: raw?.code || fallback?.code || `12A7-${String(index + 1).padStart(2, '0')}`,
    name: raw?.name || fallback?.name || 'Học sinh 12A7',
    group: typeof raw?.group === 'number' ? raw.group : fallback?.group || 1,
    classRole: raw?.classRole || defaultRoles[id] || fallback?.classRole || 'Học sinh',
    currentGpa: typeof raw?.currentGpa === 'number' ? raw.currentGpa : fallback?.currentGpa || 8.0,
    currentClassification: raw?.currentClassification || fallback?.currentClassification || 'Giỏi',
    currentConduct: raw?.currentConduct || fallback?.currentConduct || 'Tốt',
    attendanceStats: {
      present: typeof rawStats?.present === 'number' ? rawStats.present : 35,
      excused: typeof rawStats?.excused === 'number' ? rawStats.excused : 0,
      unexcused: typeof rawStats?.unexcused === 'number' ? rawStats.unexcused : 0,
      late: typeof rawStats?.late === 'number' ? rawStats.late : 0,
      rate: typeof rawStats?.rate === 'number' ? rawStats.rate : 100,
    },
    scores: {
      toan: ensureSubject('toan'),
      van: ensureSubject('van'),
      anh: ensureSubject('anh'),
      ly: ensureSubject('ly'),
      hoa: ensureSubject('hoa'),
      su: ensureSubject('su'),
      gdktpl: ensureSubject('gdktpl'),
      tin: ensureSubject('tin'),
      gddp: ensureSubject('gddp'),
      gdqp: ensureSubject('gdqp'),
    },
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => safeGetSession('a7_teacher_auth_v1') === 'true');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);

  const [role, setRoleState] = useState<Role>(() => {
    const savedRole = safeGetLocal(STORAGE_KEYS.ROLE) as Role | null;
    const isAuth = safeGetSession('a7_teacher_auth_v1') === 'true';
    if (savedRole === 'teacher' && !isAuth) return 'student';
    if (savedRole === 'teacher' || savedRole === 'student' || savedRole === 'parent') return savedRole;
    return 'student';
  });

  const [activeStudentId, setActiveStudentIdState] = useState<string>(() => safeGetLocal(STORAGE_KEYS.ACTIVE_STUDENT) || 'hs-27');

  const authenticateTeacher = (password: string): boolean => {
    if ((password || '').trim() === TEACHER_PASSWORD) {
      setIsTeacherAuthenticated(true);
      safeSetSession('a7_teacher_auth_v1', 'true');
      setRoleState('teacher');
      safeSetLocal(STORAGE_KEYS.ROLE, 'teacher');
      setIsPasswordModalOpen(false);
      if (pendingSuccessCallback) {
        pendingSuccessCallback();
        setPendingSuccessCallback(null);
      }
      return true;
    }
    return false;
  };

  const logoutTeacher = () => {
    setIsTeacherAuthenticated(false);
    safeRemoveSession('a7_teacher_auth_v1');
    setRoleState('student');
    safeSetLocal(STORAGE_KEYS.ROLE, 'student');
  };

  const requestTeacherAccess = (onSuccess?: () => void) => {
    if (isTeacherAuthenticated) {
      setRoleState('teacher');
      safeSetLocal(STORAGE_KEYS.ROLE, 'teacher');
      if (onSuccess) onSuccess();
    } else {
      setPendingSuccessCallback(() => (onSuccess ? onSuccess : null));
      setIsPasswordModalOpen(true);
    }
  };

  const setRole = (newRole: Role) => {
    if (newRole === 'teacher') {
      requestTeacherAccess();
      return;
    }
    setRoleState(newRole);
    safeSetLocal(STORAGE_KEYS.ROLE, newRole);
  };

  const setActiveStudentId = (id: string) => {
    setActiveStudentIdState(id);
    safeSetLocal(STORAGE_KEYS.ACTIVE_STUDENT, id);
  };

  const DEFAULT_CADRE_ROLES: Record<string, StudentCadreRole> = {
    'hs-27': 'Lớp trưởng',
    'hs-1': 'Lớp phó học tập',
    'hs-35': 'Lớp phó kỉ luật',
    'hs-42': 'Bí thư',
    'hs-21': 'Lớp phó lao động',
    'hs-20': 'Tổ trưởng',
    'hs-13': 'Tổ trưởng',
    'hs-31': 'Tổ trưởng',
    'hs-46': 'Tổ trưởng',
  };

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES));
        }
      } catch (e) { console.error(e); }
    }
    return (INITIAL_STUDENTS || []).map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES));
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.STUDENTS, JSON.stringify(students)); }, [students]);

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [currentWeek, setCurrentWeekState] = useState<number>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.CURRENT_WEEK);
    const num = saved ? Number(saved) : NaN;
    return !isNaN(num) && num > 0 ? num : INITIAL_CURRENT_WEEK;
  });

  const [disciplineEntries, setDisciplineEntries] = useState<StudentDisciplineEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.DISCIPLINE_ENTRIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_DISCIPLINE_ENTRIES;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.DISCIPLINE_ENTRIES, JSON.stringify(disciplineEntries)); }, [disciplineEntries]);

  const [bonusEntries, setBonusEntries] = useState<BonusPointEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.BONUS_ENTRIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_BONUS_ENTRIES;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.BONUS_ENTRIES, JSON.stringify(bonusEntries)); }, [bonusEntries]);

  const [emulationScoreAdjustments, setEmulationScoreAdjustments] = useState<EmulationScoreAdjustment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.EMULATION_ADJUSTMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_EMULATION_ADJUSTMENTS;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.EMULATION_ADJUSTMENTS, JSON.stringify(emulationScoreAdjustments)); }, [emulationScoreAdjustments]);

  const rawTodayStr = new Date().toISOString().split('T')[0];
  const todayStr = normalizeToSchoolDay(rawTodayStr).date;
  const [selectedAttendanceDateState, setSelectedAttendanceDateState] = useState<string>(todayStr);

  const setSelectedAttendanceDate = (date: string) => {
    const normalized = normalizeToSchoolDay(date);
    setSelectedAttendanceDateState(normalized.date);
    const weekIdx = getWeekIndexFromDate(normalized.date);
    if (weekIdx !== currentWeek) {
      setCurrentWeekState(weekIdx);
      safeSetLocal(STORAGE_KEYS.CURRENT_WEEK, weekIdx.toString());
    }
  };

  const setCurrentWeek = (week: number) => {
    setCurrentWeekState(week);
    safeSetLocal(STORAGE_KEYS.CURRENT_WEEK, week.toString());
    if (!isDateInWeek(selectedAttendanceDateState, week)) {
      const range = getWeekRangeByIndex(week);
      setSelectedAttendanceDateState(range.mondayDate);
    }
  };

  const selectedAttendanceDate = selectedAttendanceDateState;

  const [allAttendanceDays, setAllAttendanceDays] = useState<Record<string, DailyAttendance>>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.ATTENDANCE_DAYS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return {
      ...INITIAL_ALL_ATTENDANCE_DAYS,
      [todayStr]: INITIAL_ALL_ATTENDANCE_DAYS[todayStr] || { ...INITIAL_ATTENDANCE, date: todayStr },
    };
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.ATTENDANCE_DAYS, JSON.stringify(allAttendanceDays)); }, [allAttendanceDays]);

  const rawCurrentDay = allAttendanceDays?.[selectedAttendanceDate];
  const currentDateAttendance: DailyAttendance = {
    date: rawCurrentDay?.date || selectedAttendanceDate,
    records: rawCurrentDay?.records && typeof rawCurrentDay.records === 'object' ? rawCurrentDay.records : INITIAL_ATTENDANCE.records || {},
    note: rawCurrentDay?.note ?? INITIAL_ATTENDANCE.note ?? '',
    checkedBy: rawCurrentDay?.checkedBy || INITIAL_ATTENDANCE.checkedBy,
  };

  const [supplementaryAttendanceList, setSupplementaryAttendanceList] = useState<SupplementaryAttendanceEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.SUPPLEMENTARY_ATTENDANCE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_SUPPLEMENTARY_ATTENDANCE;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.SUPPLEMENTARY_ATTENDANCE, JSON.stringify(supplementaryAttendanceList)); }, [supplementaryAttendanceList]);

  const [recentAlerts, setRecentAlerts] = useState<string[]>([
    `Hệ thống tự động: Sau ngày Thứ 6, hệ thống đã tự động khóa sổ điểm danh tuần (${getWeekRangeByIndex(INITIAL_CURRENT_WEEK).rangeLabel}) và hoàn tất tổng kết điểm thi đua cho 50 học sinh lớp 12A7.`,
  ]);

  const clearAlerts = () => setRecentAlerts([]);

  const syncDisciplineViolationFromAttendance = (
    studentId: string,
    status: AttendanceStatus,
    dateToUse: string,
    opts?: { ruleNumber?: number; pointsDeducted?: number; note?: string; recordedBy?: string }
  ) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return;
    const targetWeek = getWeekIndexFromDate(dateToUse);
    const linkedId = `att-disc-${dateToUse}-${studentId}`;
    const attendanceRuleNumbers = [1, 8, 9];

    if (status === 'present') {
      setDisciplineEntries((prev) =>
        prev.filter((d) => d.id !== linkedId && !(d.studentId === studentId && d.date === dateToUse && attendanceRuleNumbers.includes(d.ruleNumber)))
      );
      return;
    }

    const defaultRuleNum = status === 'late' ? 1 : status === 'excused' ? 8 : 9;
    const ruleNum = opts?.ruleNumber || defaultRuleNum;
    const ruleObj = VIOLATIONS_CATALOG.find((r) => r.stt === ruleNum);
    const points = opts?.pointsDeducted !== undefined ? opts.pointsDeducted : ruleObj?.pointsDeducted ?? (status === 'unexcused' ? 20 : 5);
    const defaultNote = status === 'late' ? 'Đi học trễ (Tự động liên kết từ Điểm danh)' : status === 'excused' ? 'Vắng có phép 1 buổi (Tự động liên kết từ Điểm danh)' : 'Vắng không phép 1 buổi (Tự động liên kết từ Điểm danh)';
    const recorder = opts?.recordedBy || (role === 'teacher' ? 'Thầy Trương Xuân Hòa (GVCN)' : currentStudent?.name ? `${currentStudent.name} (${currentStudent.classRole || 'Ban cán sự'})` : 'Hệ thống Điểm danh 12A7');

    const newViolationEntry: StudentDisciplineEntry = {
      id: linkedId,
      studentId: stu.id,
      studentName: stu.name,
      group: stu.group,
      weekNumber: targetWeek,
      date: dateToUse,
      ruleNumber: ruleNum,
      violationText: ruleObj ? ruleObj.title : defaultNote,
      level: ruleObj ? ruleObj.level : 'Mức độ III',
      pointsDeducted: points,
      note: opts?.note || defaultNote,
      recordedBy: recorder,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setDisciplineEntries((prev) => {
      const filtered = prev.filter((d) => d.id !== linkedId && !(d.studentId === studentId && d.date === dateToUse && attendanceRuleNumbers.includes(d.ruleNumber)));
      return [newViolationEntry, ...filtered];
    });
  };

  const updateAttendanceStatus = (
    studentId: string,
    status: AttendanceStatus,
    targetDate?: string,
    violationOpts?: { ruleNumber?: number; pointsDeducted?: number; note?: string; recordedBy?: string; skipViolationSync?: boolean }
  ) => {
    const rawDate = targetDate || selectedAttendanceDate || todayStr;
    const norm = normalizeToSchoolDay(rawDate);
    const dateToUse = norm.date;

    setAllAttendanceDays((prev) => {
      const targetDay = prev[dateToUse] || { date: dateToUse, records: {}, note: '' };
      return { ...prev, [dateToUse]: { ...targetDay, records: { ...targetDay.records, [studentId]: status } } };
    });

    if (!violationOpts?.skipViolationSync) {
      syncDisciplineViolationFromAttendance(studentId, status, dateToUse, violationOpts);
    }

    setStudents((prevStudents) =>
      prevStudents.map((st) => {
        if (st.id === studentId) {
          const stats = { ...st.attendanceStats };
          if (status === 'present') stats.present += 1;
          if (status === 'excused') stats.excused += 1;
          if (status === 'unexcused') stats.unexcused += 1;
          if (status === 'late') stats.late += 1;
          const totalDays = stats.present + stats.excused + stats.unexcused;
          stats.rate = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 100;
          return { ...st, attendanceStats: stats };
        }
        return st;
      })
    );

    if (norm.dayIndex === 5) {
      const weekRange = getWeekRangeFromDate(dateToUse);
      const alertMsg = `Tự động tổng kết sau Thứ 6 (${dateToUse}): Đã cập nhật chuyên cần ngày Thứ 6 và tự động tổng kết điểm thi đua (${weekRange.rangeLabel}) cho lớp 12A7.`;
      setRecentAlerts((prev) => [alertMsg, ...prev.filter((m) => m !== alertMsg).slice(0, 8)]);
    }
  };

  const markAllPresent = (targetDate?: string) => {
    const rawDate = targetDate || selectedAttendanceDate || todayStr;
    const norm = normalizeToSchoolDay(rawDate);
    const dateToUse = norm.date;
    const allPresentRecords: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { allPresentRecords[s.id] = 'present'; });

    setAllAttendanceDays((prev) => {
      const targetDay = prev[dateToUse] || { date: dateToUse, records: {}, note: '' };
      return { ...prev, [dateToUse]: { ...targetDay, records: allPresentRecords } };
    });

    setDisciplineEntries((prev) =>
      prev.filter((d) => !(d.date === dateToUse && (d.id.startsWith(`att-disc-${dateToUse}-`) || [1, 8, 9].includes(d.ruleNumber))))
    );
  };

  const saveAttendanceNote = (note: string, targetDate?: string) => {
    const dateToUse = targetDate || selectedAttendanceDate || todayStr;
    setAllAttendanceDays((prev) => {
      const targetDay = prev[dateToUse] || { date: dateToUse, records: {}, note: '' };
      return { ...prev, [dateToUse]: { ...targetDay, note } };
    });
  };

  const addSupplementaryAttendance = (entryData: Omit<SupplementaryAttendanceEntry, 'id' | 'createdAt'>) => {
    const normDate = normalizeToSchoolDay(entryData.date).date;
    const newEntry: SupplementaryAttendanceEntry = {
      ...entryData,
      date: normDate,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setSupplementaryAttendanceList((prev) => [newEntry, ...prev]);
    setAllAttendanceDays((prev) => {
      const day = prev[normDate] || { date: normDate, records: {}, note: '' };
      return { ...prev, [normDate]: { ...day, records: { ...day.records, [entryData.studentId]: entryData.newStatus } } };
    });
    syncDisciplineViolationFromAttendance(entryData.studentId, entryData.newStatus, normDate, {
      note: `Điểm danh bổ sung: ${entryData.reason}${entryData.note ? ` (${entryData.note})` : ''}`,
      recordedBy: entryData.recordedBy,
    });
    const statusLabels: Record<AttendanceStatus, string> = {
      present: 'Có mặt',
      late: 'Đi trễ (-5đ)',
      excused: 'Vắng có phép (-5đ)',
      unexcused: 'Vắng không phép (-20đ)',
    };
    const alertMsg = `Điểm danh bổ sung: Đã cập nhật trạng thái em ${entryData.studentName} (${entryData.studentCode}) ngày ${normDate} thành "${statusLabels[entryData.newStatus]}" và đồng bộ điểm thi đua. Lý do: ${entryData.reason}.`;
    setRecentAlerts((prev) => [alertMsg, ...prev.slice(0, 9)]);
  };

  const deleteSupplementaryAttendance = (id: string) => {
    setSupplementaryAttendanceList((prev) => prev.filter((item) => item.id !== id));
  };

  const saveDateAttendance = (date: string, attendance: DailyAttendance) => {
    setAllAttendanceDays((prev) => ({ ...prev, [date]: attendance }));
  };

  const scanQRAttendance = (codeOrId: string) => {
    const trimmed = codeOrId.trim().toUpperCase();
    const stu = students.find((s) => s.code.toUpperCase() === trimmed || s.id.toUpperCase() === trimmed || s.name.toUpperCase().includes(trimmed));
    if (!stu) return { success: false, message: `Không tìm thấy học sinh với mã "${codeOrId}" trong danh sách 12A7!` };
    updateAttendanceStatus(stu.id, 'present');
    return { success: true, message: `Điểm danh thành công cho học sinh ${stu.name} (${stu.code})!`, studentName: stu.name };
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'stt'>) => {
    const newStt = students.length + 1;
    const newStudent: Student = { ...studentData, id: `hs-${Date.now()}`, stt: newStt, code: `12A7-${newStt.toString().padStart(2, '0')}` };
    setStudents((prev) => [...prev, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  const assignStudentCadreRole = (studentId: string, cadreRole: StudentCadreRole) => {
    const singletonRoles: StudentCadreRole[] = ['Lớp trưởng', 'Lớp phó học tập', 'Lớp phó kỉ luật', 'Lớp phó lao động', 'Bí thư'];
    const targetStu = students.find((s) => s.id === studentId);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) return { ...s, classRole: cadreRole };
        if (singletonRoles.includes(cadreRole) && s.classRole === cadreRole) return { ...s, classRole: 'Học sinh' };
        return s;
      })
    );
    if (cadreRole === 'Lớp phó lao động' && targetStu) {
      setDutySchedule((prev) => prev.map((item) => ({ ...item, assignedBy: `${targetStu.name} (Lớp phó Lao động)` })));
    }
  };

  const [unlockedStudents, setUnlockedStudents] = useState<Record<string, boolean>>(() => {
    try {
      const saved = safeGetSession('a7_unlocked_students_v1');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  });

  const isStudentUnlocked = (studentId: string): boolean => {
    if (role === 'teacher' && isTeacherAuthenticated) return true;
    const stu = students.find((s) => s.id === studentId);
    if (!stu || !stu.pinCode || stu.pinCode.trim() === '') return true;
    return !!unlockedStudents[studentId];
  };

  const unlockStudent = (studentId: string, pin: string): boolean => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return false;
    if (!stu.pinCode || stu.pinCode.trim() === '') return true;
    if (stu.pinCode.trim() === pin.trim()) {
      setUnlockedStudents((prev) => {
        const next = { ...prev, [studentId]: true };
        safeSetSession('a7_unlocked_students_v1', JSON.stringify(next));
        return next;
      });
      return true;
    }
    return false;
  };

  const lockStudent = (studentId: string) => {
    setUnlockedStudents((prev) => {
      const next = { ...prev, [studentId]: false };
      safeSetSession('a7_unlocked_students_v1', JSON.stringify(next));
      return next;
    });
  };

  const setStudentPin = (studentId: string, newPin: string, oldPin?: string) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return { success: false, message: 'Không tìm thấy học sinh.' };
    const cleaned = newPin.trim();
    if (cleaned.length < 4) return { success: false, message: 'Mật khẩu / Mã PIN bảo mật phải có ít nhất 4 ký tự.' };
    const isTeacher = role === 'teacher' && isTeacherAuthenticated;
    if (!isTeacher && stu.pinCode && stu.pinCode.trim() !== '') {
      if (!oldPin || oldPin.trim() !== stu.pinCode.trim()) return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }
    updateStudent({ ...stu, pinCode: cleaned });
    setUnlockedStudents((prev) => {
      const next = { ...prev, [studentId]: true };
      safeSetSession('a7_unlocked_students_v1', JSON.stringify(next));
      return next;
    });
    return { success: true, message: 'Đã cài đặt mật khẩu bảo vệ hồ sơ & Gia sư AI thành công!' };
  };

  const removeStudentPin = (studentId: string, currentPin?: string) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return { success: false, message: 'Không tìm thấy học sinh.' };
    const isTeacher = role === 'teacher' && isTeacherAuthenticated;
    if (!isTeacher && stu.pinCode && stu.pinCode.trim() !== '') {
      if (!currentPin || currentPin.trim() !== stu.pinCode.trim()) return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }
    updateStudent({ ...stu, pinCode: undefined });
    setUnlockedStudents((prev) => {
      const next = { ...prev, [studentId]: true };
      safeSetSession('a7_unlocked_students_v1', JSON.stringify(next));
      return next;
    });
    return { success: true, message: 'Đã gỡ bỏ mật khẩu bảo vệ cá nhân.' };
  };

  const resetStudentPinByTeacher = (studentId: string, newDefaultPin?: string) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return { success: false, message: 'Không tìm thấy học sinh.' };
    const updatedPin = newDefaultPin && newDefaultPin.trim() !== '' ? newDefaultPin.trim() : undefined;
    updateStudent({ ...stu, pinCode: updatedPin });
    setUnlockedStudents((prev) => {
      const next = { ...prev, [studentId]: true };
      safeSetSession('a7_unlocked_students_v1', JSON.stringify(next));
      return next;
    });
    if (updatedPin) return { success: true, message: `Thầy Trương Xuân Hòa đã đặt lại mật khẩu (Mã PIN) của em ${stu.name} thành "${updatedPin}".` };
    return { success: true, message: `Thầy Trương Xuân Hòa đã gỡ khóa và đặt lại mật khẩu cho em ${stu.name}.` };
  };

  const resetAllStudentPinsByTeacher = (newDefaultPin?: string) => {
    const updatedPin = newDefaultPin && newDefaultPin.trim() !== '' ? newDefaultPin.trim() : undefined;
    setStudents((prev) => prev.map((s) => ({ ...s, pinCode: updatedPin })));
    const allUnlocked: Record<string, boolean> = {};
    students.forEach((s) => { allUnlocked[s.id] = true; });
    setUnlockedStudents(allUnlocked);
    safeSetSession('a7_unlocked_students_v1', JSON.stringify(allUnlocked));
    if (updatedPin) return { success: true, message: `Đã đặt lại mật khẩu (Mã PIN) mặc định "${updatedPin}" cho toàn bộ ${students.length} học sinh 12A7!` };
    return { success: true, message: `Đã gỡ mật khẩu và mở khóa tự do cho toàn bộ ${students.length} học sinh 12A7!` };
  };

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.ASSIGNMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_ASSIGNMENTS;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments)); }, [assignments]);

  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => {
    const newAssignment: Assignment = { ...assignmentData, id: `asg-${Date.now()}`, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16), submissions: {} };
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const submitAssignment = (assignmentId: string, studentId: string, content: string, attachments?: string[]) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return;
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === assignmentId) {
          const subs = { ...asg.submissions };
          subs[studentId] = { studentId, studentName: stu.name, submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16), content, attachments: attachments || ['bai_nop_' + stu.code + '.pdf'], status: 'submitted' };
          return { ...asg, submissions: subs };
        }
        return asg;
      })
    );
  };

  const gradeSubmission = (assignmentId: string, studentId: string, grade: number, feedback: string) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === assignmentId && asg.submissions[studentId]) {
          const sub = { ...asg.submissions[studentId], grade, feedback, status: 'graded' as const };
          return { ...asg, submissions: { ...asg.submissions, [studentId]: sub } };
        }
        return asg;
      })
    );
  };

  const updateSubjectScore = (studentId: string, subjectKey: keyof Student['scores'], field: 'regular' | 'midterm' | 'final', value: number | number[]) => {
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id === studentId) {
          const subject = { ...stu.scores[subjectKey] };
          if (field === 'regular') subject.regular = Array.isArray(value) ? value : [value];
          else if (field === 'midterm') subject.midterm = typeof value === 'number' ? value : value[0] || 0;
          else if (field === 'final') subject.final = typeof value === 'number' ? value : value[0] || 0;
          const regAvg = subject.regular.length > 0 ? subject.regular.reduce((a, b) => a + b, 0) / subject.regular.length : 0;
          subject.avg = Number(((regAvg + subject.midterm * 2 + subject.final * 3) / 6).toFixed(1));
          const newScores = { ...stu.scores, [subjectKey]: subject };
          const allAvgs = Object.values(newScores).map((s) => s.avg);
          const newGpa = Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2));
          let classification: Student['currentClassification'] = 'Đạt';
          const minScore = Math.min(...allAvgs);
          if (newGpa >= 9.0 && minScore >= 8.0 && stu.currentConduct === 'Tốt') classification = 'Xuất sắc';
          else if (newGpa >= 8.0 && minScore >= 6.5 && stu.currentConduct === 'Tốt') classification = 'Giỏi';
          else if (newGpa >= 6.5 && minScore >= 5.0) classification = 'Khá';
          else if (newGpa >= 5.0) classification = 'Đạt';
          else classification = 'Chưa đạt';
          return { ...stu, scores: newScores, currentGpa: newGpa, currentClassification: classification };
        }
        return stu;
      })
    );
  };

  const updateConduct = (studentId: string, conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt') => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, currentConduct: conduct } : s)));
  };

  const importExcelScores = (
    records: Array<{ studentId: string; scores: Partial<Record<keyof Student['scores'], number | { avg?: number; regular?: number[]; midterm?: number; final?: number }>>; conduct?: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' }>
  ) => {
    let count = 0;
    setStudents((prev) =>
      prev.map((stu) => {
        const match = records.find((r) => r.studentId === stu.id);
        if (!match) return stu;
        count++;
        const newScores = { ...stu.scores };
        for (const [key, val] of Object.entries(match.scores)) {
          const subKey = key as keyof Student['scores'];
          if (newScores[subKey]) {
            if (typeof val === 'number') {
              newScores[subKey] = { ...newScores[subKey], avg: Number(val.toFixed(1)), midterm: Number(val.toFixed(1)), final: Number(val.toFixed(1)) };
            } else if (val && typeof val === 'object') {
              const currentSub = newScores[subKey];
              const regular = val.regular || currentSub.regular;
              const midterm = typeof val.midterm === 'number' ? val.midterm : currentSub.midterm;
              const final = typeof val.final === 'number' ? val.final : currentSub.final;
              const regAvg = regular.length > 0 ? regular.reduce((a, b) => a + b, 0) / regular.length : 0;
              const calculatedAvg = typeof val.avg === 'number' ? val.avg : Number(((regAvg + midterm * 2 + final * 3) / 6).toFixed(1));
              newScores[subKey] = { ...currentSub, regular, midterm, final, avg: calculatedAvg };
            }
          }
        }
        const newConduct = match.conduct || stu.currentConduct;
        const allAvgs = Object.values(newScores).map((s) => s.avg);
        const newGpa = Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2));
        let classification: Student['currentClassification'] = 'Đạt';
        const minScore = Math.min(...allAvgs);
        if (newGpa >= 9.0 && minScore >= 8.0 && newConduct === 'Tốt') classification = 'Xuất sắc';
        else if (newGpa >= 8.0 && minScore >= 6.5 && newConduct === 'Tốt') classification = 'Giỏi';
        else if (newGpa >= 6.5 && minScore >= 5.0) classification = 'Khá';
        else if (newGpa >= 5.0) classification = 'Đạt';
        else classification = 'Chưa đạt';
        return { ...stu, scores: newScores, currentConduct: newConduct, currentGpa: newGpa, currentClassification: classification };
      })
    );
    return { successCount: count, message: `Đã cập nhật thành công bảng điểm cho ${count} học sinh từ file Excel.` };
  };

  const [evaluations, setEvaluations] = useState<EvaluationComment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.EVALUATIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_EVALUATIONS;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations)); }, [evaluations]);

  const addEvaluation = (evalData: Omit<EvaluationComment, 'id' | 'createdAt'>) => {
    const newEval: EvaluationComment = { ...evalData, id: `ev-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setEvaluations((prev) => [newEval, ...prev]);
  };

  const updateEvaluation = (updated: EvaluationComment) => {
    setEvaluations((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.ANNOUNCEMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements)); }, [announcements]);

  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = { ...annData, id: `ann-${Date.now()}`, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAnnouncement = (id: string, updatedData: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) } : a))
    );
  };

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.MESSAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_MESSAGES;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.MESSAGES, JSON.stringify(messages)); }, [messages]);

  const sendMessage = (studentId: string, text: string, fileName?: string) => {
    const currentList = messages[studentId] || [];
    const sender = role === 'teacher' ? 'teacher' : 'parent';
    const senderName = role === 'teacher' ? 'Thầy Trương Xuân Hòa (GVCN)' : (currentStudent?.primaryParentName || 'Phụ huynh học sinh');
    const newMsg: ChatMessage = { id: `m-${Date.now()}`, studentId, sender, senderName, text, fileName, timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => ({ ...prev, [studentId]: [...currentList, newMsg] }));
  };

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.APPOINTMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_APPOINTMENTS;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments)); }, [appointments]);

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newApt: Appointment = { ...aptData, id: `apt-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString().split('T')[0] };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const [happyPosts, setHappyPosts] = useState<HappyPost[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.HAPPY_POSTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({ ...p, likedBy: Array.isArray(p?.likedBy) ? p.likedBy : [], comments: Array.isArray(p?.comments) ? p.comments : [] }));
        }
      } catch (e) { console.error(e); }
    }
    return (INITIAL_HAPPY_POSTS || []).map((p: any) => ({ ...p, likedBy: Array.isArray(p?.likedBy) ? p.likedBy : [], comments: Array.isArray(p?.comments) ? p.comments : [] }));
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.HAPPY_POSTS, JSON.stringify(happyPosts)); }, [happyPosts]);

  const addHappyPost = (postData: Omit<HappyPost, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>) => {
    const newPost: HappyPost = { ...postData, id: `post-${Date.now()}`, likes: 1, likedBy: [activeStudentId], comments: [], createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setHappyPosts((prev) => [newPost, ...prev]);
  };

  const toggleLikePost = (postId: string, userId: string) => {
    setHappyPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const likedByList = Array.isArray(p.likedBy) ? p.likedBy : [];
          const already = likedByList.includes(userId);
          const updatedLikedBy = already ? likedByList.filter((id) => id !== userId) : [...likedByList, userId];
          return { ...p, likes: updatedLikedBy.length, likedBy: updatedLikedBy };
        }
        return p;
      })
    );
  };

  const addPostComment = (postId: string, author: string, text: string) => {
    setHappyPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newC = { id: `c-${Date.now()}`, author, text, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
          const existingComments = Array.isArray(p.comments) ? p.comments : [];
          return { ...p, comments: [...existingComments, newC] };
        }
        return p;
      })
    );
  };

  const updateHappyPost = (id: string, updatedData: Partial<HappyPost>) => {
    setHappyPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) } : p)));
  };

  const deleteHappyPost = (id: string) => {
    setHappyPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const deletePostComment = (postId: string, commentId: string) => {
    setHappyPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: (Array.isArray(p.comments) ? p.comments : []).filter((c) => c.id !== commentId) } : p))
    );
  };

  const OFFICIAL_MORNING_TIMES = ['07:25 - 08:10', '08:15 - 09:00', '09:35 - 10:20', '10:25 - 11:10', '11:15 - 12:00'];
  const OFFICIAL_AFTERNOON_TIMES = ['13:15 - 14:00', '14:05 - 14:50', '15:15 - 16:00', '16:05 - 16:50'];
  const LEGACY_TIMETABLE_TIMES = new Set(['07:00 - 07:45', '07:50 - 08:35', '08:55 - 09:40', '09:45 - 10:30', '10:35 - 11:20', '11:25 - 12:10', '13:30 - 14:15', '14:20 - 15:05']);

  const normalizeTimetablePeriodTimes = useCallback((entries: TimetableEntry[]): TimetableEntry[] => {
    if (!Array.isArray(entries)) return INITIAL_TIMETABLE;
    return entries.map((d) => ({
      ...d,
      periods: (Array.isArray(d?.periods) ? d.periods : []).map((p) => {
        const sess = p?.session || 'morning';
        const pIdx = Math.max(0, (p?.period || 1) - 1);
        const standardTime = sess === 'morning' ? OFFICIAL_MORNING_TIMES[pIdx] || p.time : OFFICIAL_AFTERNOON_TIMES[pIdx] || p.time;
        const shouldUpgrade = !p?.time || LEGACY_TIMETABLE_TIMES.has(p.time.trim());
        return { ...p, session: sess, time: shouldUpgrade ? standardTime : p.time };
      }),
    }));
  }, []);

  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.TIMETABLE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAfternoon = parsed.some((d: any) => Array.isArray(d?.periods) && d.periods.some((p: any) => p?.session === 'afternoon'));
          if (hasAfternoon) {
            return parsed.map((d: any) => ({
              ...d,
              periods: (Array.isArray(d?.periods) ? d.periods : []).map((p: any) => {
                const sess = p?.session || 'morning';
                const pIdx = Math.max(0, (p?.period || 1) - 1);
                const standardTime = sess === 'morning' ? OFFICIAL_MORNING_TIMES[pIdx] || p.time : OFFICIAL_AFTERNOON_TIMES[pIdx] || p.time;
                const shouldUpgrade = !p?.time || LEGACY_TIMETABLE_TIMES.has(String(p.time).trim());
                return { ...p, session: sess, time: shouldUpgrade ? standardTime : p.time };
              }),
            }));
          }
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_TIMETABLE;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable)); }, [timetable]);

  const updateTimetable = (newTimetable: TimetableEntry[]) => { setTimetable(newTimetable); };

  const updatePeriod = (day: string, periodNumber: number, data: Partial<TimetablePeriod>, session?: 'morning' | 'afternoon') => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const updatedPeriods = (d.periods || []).map((p) => {
            const matchesSession = !session || (p.session || 'morning') === session;
            if (p.period === periodNumber && matchesSession) return { ...p, ...data };
            return p;
          });
          return { ...d, periods: updatedPeriods };
        }
        return d;
      })
    );
  };

  const addPeriod = (day: string, session: 'morning' | 'afternoon', data: { subject: string; teacher: string; room: string; time?: string }) => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const periodsList = Array.isArray(d.periods) ? d.periods : [];
          const sessionPeriods = periodsList.filter((p) => (p.session || 'morning') === session);
          const newPeriodNum = sessionPeriods.length + 1;
          const defaultTime = session === 'morning' ? OFFICIAL_MORNING_TIMES[newPeriodNum - 1] || `Tiết ${newPeriodNum} sáng` : OFFICIAL_AFTERNOON_TIMES[newPeriodNum - 1] || `Tiết ${newPeriodNum} chiều`;
          const newPeriod: TimetablePeriod = { period: newPeriodNum, session, time: data.time || defaultTime, subject: data.subject || 'Môn học mới', teacher: data.teacher || 'Giáo viên phụ trách', room: data.room || 'P.12A7' };
          return { ...d, periods: [...periodsList, newPeriod] };
        }
        return d;
      })
    );
  };

  const deletePeriod = (day: string, session: 'morning' | 'afternoon', periodNumber: number) => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          let removed = false;
          const filtered = (d.periods || []).filter((p) => {
            const pSession = p.session || 'morning';
            if (pSession === session && p.period === periodNumber && !removed) { removed = true; return false; }
            return true;
          });
          let morningIndex = 1;
          let afternoonIndex = 1;
          const reindexed = filtered.map((p) => {
            const pSession = p.session || 'morning';
            return pSession === 'morning' ? { ...p, period: morningIndex++ } : { ...p, period: afternoonIndex++ };
          });
          return { ...d, periods: reindexed };
        }
        return d;
      })
    );
  };

  const resetTimetable = () => {
    setTimetable(INITIAL_TIMETABLE);
    safeRemoveLocal(STORAGE_KEYS.TIMETABLE);
  };

  const [dutySchedule, setDutySchedule] = useState<DutyScheduleItem[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.DUTY_SCHEDULE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_DUTY_SCHEDULE;
  });

  useEffect(() => { safeSetLocal(STORAGE_KEYS.DUTY_SCHEDULE, JSON.stringify(dutySchedule)); }, [dutySchedule]);

  const updateDutySchedule = (newSchedule: DutyScheduleItem[]) => { setDutySchedule(newSchedule); };
  const updateDutyItem = (id: string, itemData: Partial<DutyScheduleItem>) => { setDutySchedule((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item))); };
  const addDutyItem = (itemData: Omit<DutyScheduleItem, 'id'>) => { setDutySchedule((prev) => [...prev, { ...itemData, id: `duty-${Date.now()}` }]); };
  const deleteDutyItem = (id: string) => { setDutySchedule((prev) => prev.filter((item) => item.id !== id)); };
  const resetDutySchedule = () => { setDutySchedule(INITIAL_DUTY_SCHEDULE); safeRemoveLocal(STORAGE_KEYS.DUTY_SCHEDULE); };

  const [appConfig, setAppConfig] = useState<ClassAppConfig>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.APP_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...INITIAL_APP_CONFIG, ...parsed };
      } catch (e) { console.error(e); }
    }
    return INITIAL_APP_CONFIG;
  });

  const [isAppConfigModalOpen, setIsAppConfigModalOpen] = useState(false);

  useEffect(() => { safeSetLocal(STORAGE_KEYS.APP_CONFIG, JSON.stringify(appConfig)); }, [appConfig]);

  const updateAppConfig = (config: Partial<ClassAppConfig>) => { setAppConfig((prev) => ({ ...prev, ...config })); };
  const resetAppConfig = () => { setAppConfig(INITIAL_APP_CONFIG); safeRemoveLocal(STORAGE_KEYS.APP_CONFIG); };

  const addDisciplineEntry = (entryData: Omit<StudentDisciplineEntry, 'id' | 'createdAt'>) => {
    const normDate = normalizeToSchoolDay(entryData.date || todayStr).date;
    const computedWeek = entryData.date ? getWeekIndexFromDate(normDate) : entryData.weekNumber;
    const newEntry: StudentDisciplineEntry = { ...entryData, date: normDate, weekNumber: computedWeek, id: `disc-${Date.now()}`, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setDisciplineEntries((prev) => [newEntry, ...prev]);
    if (entryData.ruleNumber === 1 || entryData.ruleNumber === 8 || entryData.ruleNumber === 9) {
      const mappedStatus: AttendanceStatus = entryData.ruleNumber === 1 ? 'late' : entryData.ruleNumber === 8 ? 'excused' : 'unexcused';
      setAllAttendanceDays((prev) => {
        const day = prev[normDate] || { date: normDate, records: {}, note: '' };
        return { ...prev, [normDate]: { ...day, records: { ...day.records, [entryData.studentId]: mappedStatus } } };
      });
    }
  };

  const updateDisciplineEntry = (id: string, updated: Partial<StudentDisciplineEntry>) => {
    setDisciplineEntries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextDate = updated.date ? normalizeToSchoolDay(updated.date).date : d.date;
          const nextWeek = updated.date ? getWeekIndexFromDate(nextDate) : (updated.weekNumber ?? d.weekNumber);
          return { ...d, ...updated, date: nextDate, weekNumber: nextWeek };
        }
        return d;
      })
    );
  };

  const deleteDisciplineEntry = (id: string) => {
    const target = disciplineEntries.find((d) => d.id === id);
    setDisciplineEntries((prev) => prev.filter((d) => d.id !== id));
    if (target && (target.ruleNumber === 1 || target.ruleNumber === 8 || target.ruleNumber === 9)) {
      const normDate = normalizeToSchoolDay(target.date).date;
      setAllAttendanceDays((prev) => {
        const day = prev[normDate];
        if (!day || !day.records) return prev;
        return { ...prev, [normDate]: { ...day, records: { ...day.records, [target.studentId]: 'present' } } };
      });
    }
  };

  const addBonusPointEntry = (bonusData: Omit<BonusPointEntry, 'id' | 'createdAt'>) => {
    const normDate = normalizeToSchoolDay(bonusData.date || todayStr).date;
    const computedWeek = bonusData.date ? getWeekIndexFromDate(normDate) : bonusData.weekNumber;
    const newBonus: BonusPointEntry = { ...bonusData, date: normDate, weekNumber: computedWeek, id: `bon-${Date.now()}`, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setBonusEntries((prev) => [newBonus, ...prev]);
  };

  const updateBonusPointEntry = (id: string, updated: Partial<BonusPointEntry>) => {
    setBonusEntries((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBonusPointEntry = (id: string) => {
    setBonusEntries((prev) => prev.filter((b) => b.id !== id));
  };

  const setEmulationScoreAdjustment = (adjustmentData: Omit<EmulationScoreAdjustment, 'id' | 'createdAt'>) => {
    const newEntry: EmulationScoreAdjustment = { ...adjustmentData, id: `adj-${Date.now()}`, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setEmulationScoreAdjustments((prev) => [newEntry, ...prev.filter((a) => !(a.studentId === adjustmentData.studentId && a.weekNumber === adjustmentData.weekNumber))]);
  };

  const removeEmulationScoreAdjustment = (studentId: string, weekNumber: number) => {
    setEmulationScoreAdjustments((prev) => prev.filter((a) => !(a.studentId === studentId && a.weekNumber === weekNumber)));
  };

  const getStudentWeeklyScore = (studentId: string, week?: number) => {
    const targetWeek = week !== undefined ? week : currentWeek;
    const student = students.find((s) => s.id === studentId);
    const violations = disciplineEntries.filter((d) => d.studentId === studentId && (d.weekNumber === targetWeek || isDateInWeek(d.date, targetWeek)));
    const bonuses = bonusEntries.filter((b) => (b.studentId === studentId || (!b.studentId && b.group === student?.group)) && (b.weekNumber === targetWeek || isDateInWeek(b.date, targetWeek)));
    const initialPoints = 100;
    const deducted = violations.reduce((sum, v) => sum + v.pointsDeducted, 0);
    const bonus = bonuses.reduce((sum, b) => sum + b.pointsAdded, 0);
    const autoScore = Math.max(0, initialPoints - deducted + bonus);
    const adjustment = emulationScoreAdjustments.find((a) => a.studentId === studentId && a.weekNumber === targetWeek);
    const total = adjustment !== undefined ? adjustment.adjustedScore : autoScore;
    let classification: 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu' = 'Xuất sắc';
    if (total >= 90) classification = 'Xuất sắc';
    else if (total >= 75) classification = 'Khá';
    else if (total >= 50) classification = 'Trung bình';
    else classification = 'Yếu';
    return { initialPoints, deducted, bonus, autoScore, total, isAdjustedByTeacher: !!adjustment, adjustment, violations, bonuses, classification };
  };

  const getWeeklyEmulationSummary = (week?: number): WeeklyEmulationSummary => {
    const targetWeek = week !== undefined ? week : currentWeek;
    const weekRange = getWeekRangeByIndex(targetWeek);
    const fridayIso = weekRange.fridayDate;
    const dateRangeLabel = weekRange.rangeLabel;
    const now = new Date();
    const todayDayOfWeek = now.getDay();
    const [fy, fm, fd] = fridayIso.split('-').map(Number);
    const weekFriday = new Date(fy, fm - 1, fd, 23, 59, 59);
    const isWeekendOrPastFriday = targetWeek < currentWeek || todayDayOfWeek === 6 || todayDayOfWeek === 0 || now > weekFriday || !!allAttendanceDays[fridayIso];
    const allScores = students.map((stu) => ({ student: stu, ...getStudentWeeklyScore(stu.id, targetWeek) }));
    const totalPoints = allScores.reduce((sum, item) => sum + item.total, 0);
    const classAvgScore = students.length > 0 ? Number((totalPoints / students.length).toFixed(1)) : 100;
    const perfectCount = allScores.filter((i) => i.total >= 100).length;
    const deductedCount = allScores.filter((i) => i.deducted > 0).length;
    const weekViolations = disciplineEntries.filter((d) => d.weekNumber === targetWeek || isDateInWeek(d.date, targetWeek));
    const weekBonuses = bonusEntries.filter((b) => b.weekNumber === targetWeek || isDateInWeek(b.date, targetWeek));
    const rawGroups = [1, 2, 3, 4].map((g) => {
      const members = allScores.filter((i) => i.student.group === g);
      const avgScore = members.length > 0 ? Number((members.reduce((sum, m) => sum + m.total, 0) / members.length).toFixed(1)) : 100;
      const groupPerfect = members.filter((m) => m.total >= 100).length;
      const groupViolations = members.reduce((sum, m) => sum + m.violations.length, 0);
      return { group: g, avgScore, perfectCount: groupPerfect, totalCount: members.length, violationCount: groupViolations };
    });
    const sortedGroups = [...rawGroups].sort((a, b) => (b.avgScore !== a.avgScore ? b.avgScore - a.avgScore : a.violationCount - b.violationCount));
    const flagTitles = ['🏆 Hạng Nhất - Cờ Đỏ Thi Đua Tuần', '🥈 Hạng Nhì - Tổ Tiên Tiến', '🥉 Hạng Ba - Tổ Nỗ Lực', '🌱 Hạng Tư - Cần Cố Gắng'];
    const groupRankings = sortedGroups.map((g, idx) => ({ ...g, rank: idx + 1, flagTitle: flagTitles[idx] || `Hạng ${idx + 1}` }));
    const topStudents = [...allScores].sort((a, b) => b.total - a.total || b.bonus - a.bonus).slice(0, 10).map((item) => ({ student: item.student, total: item.total, bonus: item.bonus, deducted: item.deducted, classification: item.classification }));
    const violatingStudents = allScores.filter((item) => item.deducted > 0).sort((a, b) => b.deducted - a.deducted).map((item) => ({ student: item.student, total: item.total, deducted: item.deducted, violations: item.violations }));
    return {
      weekNumber: targetWeek,
      dateRangeLabel,
      isAutoSummarized: isWeekendOrPastFriday,
      statusLabel: isWeekendOrPastFriday ? `Đã tự động tổng kết sau Thứ 6 (${weekRange.fridayShort})` : `Đang theo dõi (${weekRange.rangeLabel})`,
      summarizedAt: `Thứ 6 (${weekRange.fridayFull}) • 17:00`,
      classAvgScore,
      perfectCount,
      deductedCount,
      totalViolations: weekViolations.length,
      totalBonuses: weekBonuses.length,
      groupRankings,
      topStudents,
      violatingStudents,
    };
  };

  const triggerAutoWeeklySummary = (week?: number): WeeklyEmulationSummary => {
    const targetWeek = week !== undefined ? week : currentWeek;
    const summary = getWeeklyEmulationSummary(targetWeek);
    const bestGroup = summary.groupRankings[0];
    const msg = `Tổng kết thi đua (${summary.dateRangeLabel}): ĐTB toàn lớp đạt ${summary.classAvgScore}/100đ • ${summary.perfectCount}/${students.length} học sinh giữ trọn 100đ • Tổ dẫn đầu: Tổ ${bestGroup.group} (${bestGroup.avgScore}đ).`;
    setRecentAlerts((prev) => [msg, ...prev.filter((m) => m !== msg).slice(0, 8)]);
    return summary;
  };

  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  const getExportJsonPayload = (scope: 'all' | 'students' | 'attendance_discipline' = 'all'): Record<string, any> => {
    const exportedAt = new Date().toISOString();
    const weeklySummary = getWeeklyEmulationSummary(currentWeek);
    if (scope === 'students') {
      return { meta: { title: `Dữ liệu Hồ sơ & Bảng điểm Tổng hợp 10 Môn - Lớp ${appConfig.className}`, schoolName: appConfig.schoolName, schoolYear: appConfig.schoolYear, homeroomTeacher: appConfig.teacherName, totalStudents: students.length, exportedAt, scope: 'students' }, appConfig, students };
    }
    if (scope === 'attendance_discipline') {
      return { meta: { title: `Dữ liệu Điểm danh (Thứ 2 - Thứ 6) & Thi đua Tuần - Lớp ${appConfig.className}`, schoolName: appConfig.schoolName, schoolYear: appConfig.schoolYear, homeroomTeacher: appConfig.teacherName, currentWeek, exportedAt, scope: 'attendance_discipline' }, currentWeek, weeklyEmulationSummary: weeklySummary, allAttendanceDays, supplementaryAttendanceList, disciplineEntries, bonusEntries, emulationScoreAdjustments };
    }
    return { meta: { title: `Toàn bộ Dữ liệu Hệ thống Quản lý Lớp ${appConfig.className}`, schoolName: appConfig.schoolName, schoolYear: appConfig.schoolYear, homeroomTeacher: appConfig.teacherName, totalStudents: students.length, currentWeek, exportedAt, version: '2.0', scope: 'all' }, appConfig, currentWeek, weeklyEmulationSummary: weeklySummary, students, allAttendanceDays, supplementaryAttendanceList, disciplineEntries, bonusEntries, emulationScoreAdjustments, evaluations, announcements, timetable, dutySchedule, happyPosts, assignments };
  };

  const downloadDataAsJson = (scope: 'all' | 'students' | 'attendance_discipline' = 'all'): string => {
    const payload = getExportJsonPayload(scope);
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateTag = new Date().toISOString().split('T')[0];
    const fileName = scope === 'students' ? `Ho_So_Bang_Diem_50HS_12A7_${dateTag}.json` : scope === 'attendance_discipline' ? `Diem_Danh_Thi_Dua_12A7_Tuan_${currentWeek}_${dateTag}.json` : `Du_Lieu_Toan_Bo_Lop_12A7_THPT_Vinh_Loc_B_${dateTag}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return fileName;
  };

  const importDataFromJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return { success: false, message: 'Nội dung file JSON không hợp lệ!' };
      const restoredItems: string[] = [];
      if (parsed.appConfig && typeof parsed.appConfig === 'object') { setAppConfig((prev) => ({ ...prev, ...parsed.appConfig })); restoredItems.push('Cấu hình lớp'); }
      if (Array.isArray(parsed.students) && parsed.students.length > 0) { setStudents(parsed.students.map((s: any, idx: number) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES))); restoredItems.push(`${parsed.students.length} Học sinh & Bảng điểm`); }
      if (parsed.allAttendanceDays && typeof parsed.allAttendanceDays === 'object') { setAllAttendanceDays(parsed.allAttendanceDays); restoredItems.push('Điểm danh'); }
      if (Array.isArray(parsed.supplementaryAttendanceList)) setSupplementaryAttendanceList(parsed.supplementaryAttendanceList);
      if (Array.isArray(parsed.disciplineEntries)) { setDisciplineEntries(parsed.disciplineEntries); restoredItems.push('Thi đua tuần'); }
      if (Array.isArray(parsed.bonusEntries)) setBonusEntries(parsed.bonusEntries);
      if (Array.isArray(parsed.emulationScoreAdjustments)) setEmulationScoreAdjustments(parsed.emulationScoreAdjustments);
      if (typeof parsed.currentWeek === 'number') setCurrentWeek(parsed.currentWeek);
      if (Array.isArray(parsed.evaluations)) { setEvaluations(parsed.evaluations); restoredItems.push('Nhận xét GVCN'); }
      if (Array.isArray(parsed.announcements)) { setAnnouncements(parsed.announcements); restoredItems.push('Thông báo'); }
      if (Array.isArray(parsed.timetable)) { setTimetable(parsed.timetable); restoredItems.push('Thời khóa biểu'); }
      if (Array.isArray(parsed.dutySchedule)) { setDutySchedule(parsed.dutySchedule); restoredItems.push('Lịch trực nhật'); }
      if (Array.isArray(parsed.happyPosts)) { setHappyPosts(parsed.happyPosts); restoredItems.push('Góc Hạnh Phúc'); }
      if (restoredItems.length === 0) return { success: false, message: 'Không tìm thấy trường dữ liệu hợp lệ trong file JSON.' };
      lastSyncedJsonRef.current = {};
      return { success: true, message: `Đã nhập thành công dữ liệu từ JSON: ${restoredItems.join(', ')}!` };
    } catch {
      return { success: false, message: 'Lỗi cú pháp JSON! Vui lòng kiểm tra lại định dạng file .json.' };
    }
  };

  const resetToHardcodedDefaultData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.ROLE && key !== STORAGE_KEYS.ACTIVE_STUDENT) safeRemoveLocal(key);
    });
    const defaultStudents = (INITIAL_STUDENTS || []).map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES));
    const defaultAttendanceDays = { ...INITIAL_ALL_ATTENDANCE_DAYS, [todayStr]: INITIAL_ALL_ATTENDANCE_DAYS[todayStr] || { ...INITIAL_ATTENDANCE, date: todayStr } };
    setAppConfig(INITIAL_APP_CONFIG);
    setCurrentWeekState(INITIAL_CURRENT_WEEK);
    setStudents(defaultStudents);
    setAllAttendanceDays(defaultAttendanceDays);
    setSupplementaryAttendanceList(INITIAL_SUPPLEMENTARY_ATTENDANCE);
    setDisciplineEntries(INITIAL_DISCIPLINE_ENTRIES);
    setBonusEntries(INITIAL_BONUS_ENTRIES);
    setEmulationScoreAdjustments(INITIAL_EMULATION_ADJUSTMENTS);
    setEvaluations(INITIAL_EVALUATIONS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setTimetable(INITIAL_TIMETABLE);
    setDutySchedule(INITIAL_DUTY_SCHEDULE);
    setHappyPosts(INITIAL_HAPPY_POSTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    lastSyncedJsonRef.current = {};
  };

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(null);
  const [firebaseUserName, setFirebaseUserName] = useState<string | null>(null);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState<boolean>(false);

  const lastSyncedJsonRef = useRef<Record<string, string>>({});
  const isInitialRemoteLoadedRef = useRef<boolean>(false);
  const lastServerTimestampRef = useRef<number>(0);

  const buildSectionPayload = useCallback(
    (sectionId: ClassroomSectionId): Record<string, any> => {
      switch (sectionId) {
        case 'config': return { appConfig, currentWeek };
        case 'students_g1': return { list: students.filter((s) => s.group === 1) };
        case 'students_g2': return { list: students.filter((s) => s.group === 2) };
        case 'students_g3': return { list: students.filter((s) => s.group === 3) };
        case 'students_g4': return { list: students.filter((s) => s.group !== 1 && s.group !== 2 && s.group !== 3) };
        case 'attendance': return { allAttendanceDays, supplementaryAttendanceList };
        case 'emulation': return { disciplineEntries, bonusEntries, emulationScoreAdjustments };
        case 'activities': return { evaluations, announcements, happyPosts, assignments, messages, appointments };
        case 'schedule': return { timetable, dutySchedule };
      }
    },
    [appConfig, currentWeek, students, allAttendanceDays, supplementaryAttendanceList, disciplineEntries, bonusEntries, emulationScoreAdjustments, evaluations, announcements, happyPosts, assignments, messages, appointments, timetable, dutySchedule]
  );

  if (Object.keys(lastSyncedJsonRef.current).length === 0) {
    for (const secId of ALL_SECTION_IDS) {
      lastSyncedJsonRef.current[secId] = JSON.stringify(sanitizePayloadForFirestore(buildSectionPayload(secId)));
    }
  }

  const applyRemoteSection = useCallback(
    (sectionId: ClassroomSectionId, rawPayload: Record<string, any>) => {
      if (!rawPayload || typeof rawPayload !== 'object') return;
      const incomingJson = JSON.stringify(sanitizePayloadForFirestore(rawPayload));
      if (lastSyncedJsonRef.current[sectionId] === incomingJson) return;

      if (sectionId === 'config') {
        const nextAppConfig = rawPayload.appConfig && typeof rawPayload.appConfig === 'object' ? { ...INITIAL_APP_CONFIG, ...rawPayload.appConfig } : INITIAL_APP_CONFIG;
        const nextWeek = typeof rawPayload.currentWeek === 'number' && rawPayload.currentWeek > 0 ? rawPayload.currentWeek : INITIAL_CURRENT_WEEK;
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(sanitizePayloadForFirestore({ appConfig: nextAppConfig, currentWeek: nextWeek }));
        setAppConfig(nextAppConfig);
        setCurrentWeekState(nextWeek);
        safeSetLocal(STORAGE_KEYS.CURRENT_WEEK, String(nextWeek));
      } else if (sectionId === 'students_g1' || sectionId === 'students_g2' || sectionId === 'students_g3' || sectionId === 'students_g4') {
        if (Array.isArray(rawPayload.list)) {
          const targetGroup = sectionId === 'students_g1' ? 1 : sectionId === 'students_g2' ? 2 : sectionId === 'students_g3' ? 3 : 4;
          const normalizedGroupList = rawPayload.list.map((s: any, idx: number) => normalizeStudentRecord(s, typeof s?.stt === 'number' ? s.stt - 1 : idx, DEFAULT_CADRE_ROLES)).sort((a: Student, b: Student) => a.stt - b.stt);
          lastSyncedJsonRef.current[sectionId] = JSON.stringify(sanitizePayloadForFirestore({ list: normalizedGroupList }));
          setStudents((prev) => {
            const others = prev.filter((st) => (targetGroup === 4 ? st.group === 1 || st.group === 2 || st.group === 3 : st.group !== targetGroup));
            return [...others, ...normalizedGroupList].sort((a, b) => a.stt - b.stt);
          });
        }
      } else if (sectionId === 'attendance') {
        const nextAttendanceDays = rawPayload.allAttendanceDays && typeof rawPayload.allAttendanceDays === 'object' ? rawPayload.allAttendanceDays : {};
        const nextSupp = Array.isArray(rawPayload.supplementaryAttendanceList) ? rawPayload.supplementaryAttendanceList : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(sanitizePayloadForFirestore({ allAttendanceDays: nextAttendanceDays, supplementaryAttendanceList: nextSupp }));
        setAllAttendanceDays(nextAttendanceDays);
        setSupplementaryAttendanceList(nextSupp);
      } else if (sectionId === 'emulation') {
        const nextDisc = Array.isArray(rawPayload.disciplineEntries) ? rawPayload.disciplineEntries : [];
        const nextBonus = Array.isArray(rawPayload.bonusEntries) ? rawPayload.bonusEntries : [];
        const nextAdj = Array.isArray(rawPayload.emulationScoreAdjustments) ? rawPayload.emulationScoreAdjustments : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(sanitizePayloadForFirestore({ disciplineEntries: nextDisc, bonusEntries: nextBonus, emulationScoreAdjustments: nextAdj }));
        setDisciplineEntries(nextDisc);
        setBonusEntries(nextBonus);
        setEmulationScoreAdjustments(nextAdj);
      } else if (sectionId === 'activities') {
        const nextEvals = Array.isArray(rawPayload.evaluations) ? rawPayload.evaluations : [];
        const nextAnn = Array.isArray(rawPayload.announcements) ? rawPayload.announcements : [];
        const nextHappy = Array.isArray(rawPayload.happyPosts) ? rawPayload.happyPosts : [];
        const nextAss = Array.isArray(rawPayload.assignments) ? rawPayload.assignments : [];
        const nextMsgs = rawPayload.messages && typeof rawPayload.messages === 'object' ? rawPayload.messages : {};
        const nextAppts = Array.isArray(rawPayload.appointments) ? rawPayload.appointments : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(sanitizePayloadForFirestore({ evaluations: nextEvals, announcements: nextAnn, happyPosts: nextHappy, assignments: nextAss, messages: nextMsgs, appointments: nextAppts }));
        setEvaluations(nextEvals);
        setAnnouncements(nextAnn);
        setHappyPosts(nextHappy);
        setAssignments(nextAss);
        setMessages(nextMsgs);
        setAppointments(nextAppts);
      } else if (sectionId === 'schedule') {
        const rawTimetable = Array.isArray(rawPayload.timetable) ? rawPayload.timetable : [];
        const nextTimetable = normalizeTimetablePeriodTimes(rawTimetable);
        const nextDuty = Array.isArray(rawPayload.dutySchedule) ? rawPayload.dutySchedule : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(sanitizePayloadForFirestore({ timetable: nextTimetable, dutySchedule: nextDuty }));
        setTimetable(nextTimetable);
        setDutySchedule(nextDuty);
      }

      setLastSyncedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      setCloudSyncStatus('synced');
    },
    [normalizeTimetablePeriodTimes]
  );

  const syncAllToCloudNow = useCallback(async () => {
    setCloudSyncStatus('syncing');
    try {
      for (const secId of ALL_SECTION_IDS) {
        const payload = buildSectionPayload(secId);
        const cleanJson = JSON.stringify(sanitizePayloadForFirestore(payload));
        lastSyncedJsonRef.current[secId] = cleanJson;
        const serverTs = await saveClassroomSection(secId, payload, role, appConfig);
        if (serverTs > lastServerTimestampRef.current) lastServerTimestampRef.current = serverTs;
      }
      setLastSyncedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Manual cloud sync error:', err);
      setCloudSyncStatus('error');
    }
  }, [buildSectionPayload, role, appConfig]);

  useEffect(() => {
    ensureMasterClassroomDoc({ className: appConfig.className, schoolName: appConfig.schoolName, teacherName: appConfig.teacherName }).catch((err) => console.warn(err));
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUserEmail(user.email || null);
        setFirebaseUserName(user.displayName || user.email || 'Người dùng');
      } else {
        setFirebaseUserEmail(null);
        setFirebaseUserName(null);
      }
      setIsFirebaseAuthReady(true);
    });
    return () => unsubAuth();
  }, [appConfig.className, appConfig.schoolName, appConfig.teacherName]);

  useEffect(() => {
    const unsubFirestore = subscribeToClassroomSections(
      (sectionId, payload) => {
        applyRemoteSection(sectionId, payload);
        isInitialRemoteLoadedRef.current = true;
      },
      (status) => { setCloudSyncStatus(status); }
    );
    const initTimer = window.setTimeout(() => { isInitialRemoteLoadedRef.current = true; }, 1500);
    return () => {
      unsubFirestore();
      window.clearTimeout(initTimer);
    };
  }, [applyRemoteSection]);

  useEffect(() => {
    if (!isInitialRemoteLoadedRef.current) return;
    const pushChangedSections = async () => {
      for (const secId of ALL_SECTION_IDS) {
        const payload = buildSectionPayload(secId);
        const currentJson = JSON.stringify(sanitizePayloadForFirestore(payload));
        if (lastSyncedJsonRef.current[secId] !== currentJson) {
          lastSyncedJsonRef.current[secId] = currentJson;
          setCloudSyncStatus('syncing');
          try {
            const serverTs = await saveClassroomSection(secId, payload, role, appConfig);
            if (serverTs > lastServerTimestampRef.current) lastServerTimestampRef.current = serverTs;
            setLastSyncedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
            setCloudSyncStatus('synced');
          } catch (err) {
            console.warn(`Error syncing section ${secId}:`, err);
            setCloudSyncStatus('error');
          }
        }
      }
    };
    const timer = window.setTimeout(pushChangedSections, 180);
    return () => window.clearTimeout(timer);
  }, [buildSectionPayload, role, appConfig]);

  const loginWithGoogleCloud = async () => {
    try {
      setCloudSyncStatus('syncing');
      await signInWithGooglePopup();
      await syncAllToCloudNow();
    } catch (err) {
      console.warn('Google sign-in cancelled or failed:', err);
      setCloudSyncStatus('synced');
    }
  };

  const logoutGoogleCloud = async () => {
    try { await signOutFirebaseUser(); } catch (err) { console.warn('Google sign-out error:', err); }
  };

  return (
    <AppContext.Provider
      value={{
        role, setRole, isTeacherAuthenticated, authenticateTeacher, logoutTeacher, isPasswordModalOpen, setIsPasswordModalOpen, requestTeacherAccess, activeStudentId, setActiveStudentId, currentStudent, students, addStudent, updateStudent, deleteStudent, getStudentById, assignStudentCadreRole, currentDateAttendance, selectedAttendanceDate, setSelectedAttendanceDate, updateAttendanceStatus, markAllPresent, saveAttendanceNote, allAttendanceDays, saveDateAttendance, scanQRAttendance, supplementaryAttendanceList, addSupplementaryAttendance, deleteSupplementaryAttendance, assignments, addAssignment, submitAssignment, gradeSubmission, updateSubjectScore, updateConduct, importExcelScores, evaluations, addEvaluation, updateEvaluation, announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, messages, sendMessage, appointments, addAppointment, updateAppointmentStatus, happyPosts, addHappyPost, updateHappyPost, deleteHappyPost, deletePostComment, toggleLikePost, addPostComment, timetable, updateTimetable, updatePeriod, addPeriod, deletePeriod, resetTimetable, dutySchedule, updateDutySchedule, updateDutyItem, addDutyItem, deleteDutyItem, resetDutySchedule, appConfig, updateAppConfig, resetAppConfig, isAppConfigModalOpen, setIsAppConfigModalOpen, currentWeek, setCurrentWeek, disciplineEntries, bonusEntries, emulationScoreAdjustments, addDisciplineEntry, updateDisciplineEntry, deleteDisciplineEntry, addBonusPointEntry, updateBonusPointEntry, deleteBonusPointEntry, setEmulationScoreAdjustment, removeEmulationScoreAdjustment, getStudentWeeklyScore, getWeeklyEmulationSummary, triggerAutoWeeklySummary, recentAlerts, clearAlerts, isStudentUnlocked, unlockStudent, lockStudent, setStudentPin, removeStudentPin, resetStudentPinByTeacher, resetAllStudentPinsByTeacher, isJsonModalOpen, setIsJsonModalOpen, getExportJsonPayload, downloadDataAsJson, importDataFromJson, resetToHardcodedDefaultData, cloudSyncStatus, lastSyncedAt, firebaseUserEmail, firebaseUserName, loginWithGoogleCloud, logoutGoogleCloud, syncAllToCloudNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
