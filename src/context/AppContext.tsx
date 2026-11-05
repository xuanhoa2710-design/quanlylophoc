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

export const formatTeacherDisplayName = (rawName?: string): string => {
  const cleaned = (rawName || '').trim().replace(/^(Thầy\s+)+/i, '').trim();
  if (!cleaned) return 'Thầy Trương Xuân Hòa';
  if (/^(Cô|Thầy)\s+/i.test(cleaned)) return cleaned;
  return `Thầy ${cleaned}`;
};
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
  GradeBatch,
  ViewDeviceMode,
  UIDensityMode,
} from '../types';
import { parseStudentBirthday } from '../utils/imageUtils';
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
  teacher: [
    'overview',
    'students',
    'attendance',
    'grades',
    'assignments',
    'discipline',
    'profile',
    'evaluations',
    'leaderboard',
    'announcements',
    'happy_corner',
    'ai_assistant',
    'student_ai',
    'timetable',
    'duty_schedule',
  ],
  student: [
    'overview',
    'student_ai',
    'timetable',
    'duty_schedule',
    'assignments',
    'discipline',
    'profile',
    'attendance',
    'leaderboard',
    'announcements',
    'happy_corner',
  ],
  parent: [
    'overview',
    'discipline',
    'attendance',
    'evaluations',
    'announcements',
    'timetable',
  ],
};

// Helper: Normalize any YYYY-MM-DD date to Monday-Friday (exclude Saturday & Sunday)
export const normalizeToSchoolDay = (dateStr: string): {
  date: string;
  wasWeekend: boolean;
  dayLabel: string;
  dayIndex: number; // 1 = Mon .. 5 = Fri
} => {
  const parts = dateStr.split('-').map(Number);
  const dt =
    parts.length === 3 && !isNaN(parts[0])
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date();
  const rawDay = dt.getDay(); // 0 = Sun, 6 = Sat
  let wasWeekend = false;
  if (rawDay === 6) {
    dt.setDate(dt.getDate() - 1); // Saturday -> Friday
    wasWeekend = true;
  } else if (rawDay === 0) {
    dt.setDate(dt.getDate() - 2); // Sunday -> Friday
    wasWeekend = true;
  }
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const finalDay = dt.getDay(); // 1..5
  const labels: Record<number, string> = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
  };
  return {
    date: `${y}-${m}-${d}`,
    wasWeekend,
    dayLabel: labels[finalDay] || 'Thứ 6',
    dayIndex: finalDay >= 1 && finalDay <= 5 ? finalDay : 5,
  };
};

// Helper: Return the 5 school days (Thứ 2 -> Thứ 6) of the week containing dateStr
export const getWeekSchoolDays = (dateStr: string): Array<{
  date: string;
  dayLabel: string;
  shortDate: string;
  isFriday: boolean;
}> => {
  const norm = normalizeToSchoolDay(dateStr);
  const [y, m, d] = norm.date.split('-').map(Number);
  const current = new Date(y, m - 1, d);
  const dayOfWeek = current.getDay(); // 1..5
  const monday = new Date(current);
  monday.setDate(current.getDate() - (dayOfWeek - 1));

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  return dayNames.map((label, idx) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + idx);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return {
      date: `${yy}-${mm}-${dd}`,
      dayLabel: label,
      shortDate: `${dd}/${mm}`,
      isFriday: idx === 4,
    };
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
  groupRankings: Array<{
    rank: number;
    group: number;
    avgScore: number;
    perfectCount: number;
    totalCount: number;
    violationCount: number;
    flagTitle: string;
  }>;
  topStudents: Array<{
    student: Student;
    total: number;
    bonus: number;
    deducted: number;
    classification: string;
  }>;
  violatingStudents: Array<{
    student: Student;
    total: number;
    deducted: number;
    violations: StudentDisciplineEntry[];
  }>;
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
  
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'stt'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  assignStudentCadreRole: (studentId: string, cadreRole: StudentCadreRole) => void;
  customCadreRoles: string[];
  addCustomCadreRole: (roleName: string) => { success: boolean; message: string };
  removeCustomCadreRole: (roleName: string) => void;

  // UI Display & Device Optimization Mode (Tùy chỉnh giao diện Máy tính / Điện thoại)
  viewDeviceMode: ViewDeviceMode;
  setViewDeviceMode: (mode: ViewDeviceMode) => void;
  uiDensity: UIDensityMode;
  setUiDensity: (density: UIDensityMode) => void;

  // Student Privacy & PIN Lock (Bảo vệ thông tin hồ sơ & Gia sư AI)
  isStudentUnlocked: (studentId: string) => boolean;
  unlockStudent: (studentId: string, pin: string) => boolean;
  lockStudent: (studentId: string) => void;
  setStudentPin: (studentId: string, newPin: string, oldPin?: string) => { success: boolean; message: string };
  removeStudentPin: (studentId: string, currentPin?: string) => { success: boolean; message: string };
  resetStudentPinByTeacher: (studentId: string, newDefaultPin?: string) => { success: boolean; message: string };
  resetAllStudentPinsByTeacher: (newDefaultPin?: string) => { success: boolean; message: string };

  // Attendance
  currentDateAttendance: DailyAttendance;
  selectedAttendanceDate: string;
  setSelectedAttendanceDate: (date: string) => void;
  updateAttendanceStatus: (
    studentId: string,
    status: AttendanceStatus,
    targetDate?: string,
    violationOpts?: {
      ruleNumber?: number;
      pointsDeducted?: number;
      note?: string;
      recordedBy?: string;
      skipViolationSync?: boolean;
    }
  ) => void;
  markAllPresent: (targetDate?: string) => void;
  resetDateAttendance: (targetDate?: string) => void;
  saveAttendanceNote: (note: string, targetDate?: string) => void;
  allAttendanceDays: Record<string, DailyAttendance>;
  saveDateAttendance: (date: string, attendance: DailyAttendance) => void;
  scanQRAttendance: (studentCodeOrId: string) => { success: boolean; message: string; studentName?: string };

  // Supplementary Attendance (Điểm danh bổ sung)
  supplementaryAttendanceList: SupplementaryAttendanceEntry[];
  addSupplementaryAttendance: (entry: Omit<SupplementaryAttendanceEntry, 'id' | 'createdAt'>) => void;
  deleteSupplementaryAttendance: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, content: string, attachments?: string[]) => void;
  gradeSubmission: (assignmentId: string, studentId: string, grade: number, feedback: string) => void;

  // Grades, Multi-Batch Management & AI/Excel Import
  updateSubjectScore: (
    studentId: string,
    subjectKey: keyof Student['scores'],
    field: 'regular' | 'midterm' | 'final',
    value: number | number[]
  ) => void;
  updateConduct: (studentId: string, conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt') => void;
  importExcelScores: (
    records: Array<{
      studentId: string;
      scores: Partial<Record<keyof Student['scores'], number | { avg?: number; regular?: number[]; midterm?: number; final?: number }>>;
      conduct?: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
    }>,
    targetBatchId?: string
  ) => { successCount: number; message: string };
  gradeBatches: GradeBatch[];
  activeGradeBatchId: string;
  setActiveGradeBatchId: (batchId: string) => void;
  createGradeBatch: (name: string, semester: GradeBatch['semester'], copyFromCurrent?: boolean, note?: string) => GradeBatch;
  deleteGradeBatch: (batchId: string) => { success: boolean; message: string };
  clearAllGrades: (subjectKey?: keyof Student['scores']) => { success: boolean; message: string };
  clearStudentGrades: (studentId: string) => void;
  restoreDefaultGrades: () => void;

  // Evaluations
  evaluations: EvaluationComment[];
  addEvaluation: (evaluation: Omit<EvaluationComment, 'id' | 'createdAt'>) => void;
  updateEvaluation: (evaluation: EvaluationComment) => void;

  // Announcements (GVCN có thể thêm, sửa, xóa)
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, updatedData: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  // Chat & Appointments
  messages: Record<string, ChatMessage[]>;
  sendMessage: (studentId: string, text: string, fileName?: string) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  // Happy Post (GVCN có thể thêm, sửa, xóa bài viết và xóa comment)
  happyPosts: HappyPost[];
  addHappyPost: (post: Omit<HappyPost, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>) => void;
  updateHappyPost: (id: string, updatedData: Partial<HappyPost>) => void;
  deleteHappyPost: (id: string) => void;
  deletePostComment: (postId: string, commentId: string) => void;
  toggleLikePost: (postId: string, userId: string) => void;
  addPostComment: (postId: string, author: string, text: string) => void;
  postMonthlyBirthdayWishes: (
    targetMonth?: number,
    force?: boolean
  ) => { posted: boolean; count: number; month: number; message: string };

  // Timetable (Sáng 4 tiết, Chiều 3 tiết, hỗ trợ thêm/bớt tiết)
  timetable: TimetableEntry[];
  updateTimetable: (newTimetable: TimetableEntry[]) => void;
  updatePeriod: (
    day: string,
    periodNumber: number,
    data: Partial<TimetablePeriod>,
    session?: 'morning' | 'afternoon'
  ) => void;
  addPeriod: (
    day: string,
    session: 'morning' | 'afternoon',
    data: { subject: string; teacher: string; room: string; time?: string }
  ) => void;
  deletePeriod: (
    day: string,
    session: 'morning' | 'afternoon',
    periodNumber: number
  ) => void;
  resetTimetable: () => void;

  // Phân lịch trực nhật 4 Tổ (Lớp phó Lao động & GVCN quản lý)
  dutySchedule: DutyScheduleItem[];
  updateDutySchedule: (newSchedule: DutyScheduleItem[]) => void;
  updateDutyItem: (id: string, itemData: Partial<DutyScheduleItem>) => void;
  addDutyItem: (itemData: Omit<DutyScheduleItem, 'id'>) => void;
  deleteDutyItem: (id: string) => void;
  resetDutySchedule: () => void;
  resetDutyScheduleForNewWeek: (targetWeek?: number) => void;

  // App & GVCN Class Configuration
  appConfig: ClassAppConfig;
  updateAppConfig: (config: Partial<ClassAppConfig>) => void;
  resetAppConfig: () => void;
  isAppConfigModalOpen: boolean;
  setIsAppConfigModalOpen: (open: boolean) => void;

  // Weekly Discipline & Emulation (Mỗi học sinh mỗi tuần 100 điểm)
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
  setEmulationScoreAdjustment: (
    adjustment: Omit<EmulationScoreAdjustment, 'id' | 'createdAt'>
  ) => void;
  removeEmulationScoreAdjustment: (studentId: string, weekNumber: number) => void;
  keepEmulationAcrossWeeks: boolean;
  setKeepEmulationAcrossWeeks: (keep: boolean) => void;
  resetWeeklyEmulationScores: (week?: number) => void;
  getStudentWeeklyScore: (studentId: string, week?: number) => {
    initialPoints: number;
    deducted: number;
    bonus: number;
    autoScore: number;
    total: number;
    isAdjustedByTeacher: boolean;
    adjustment?: EmulationScoreAdjustment;
    violations: StudentDisciplineEntry[];
    bonuses: BonusPointEntry[];
    classification: 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu';
  };
  getWeeklyEmulationSummary: (week?: number) => WeeklyEmulationSummary;
  triggerAutoWeeklySummary: (week?: number) => WeeklyEmulationSummary;

  // Notifications alert count
  recentAlerts: string[];
  clearAlerts: () => void;

  // JSON Export & Import (Sao lưu & Xuất dữ liệu ra file JSON)
  isJsonModalOpen: boolean;
  setIsJsonModalOpen: (open: boolean) => void;
  getExportJsonPayload: (scope?: 'all' | 'students' | 'attendance_discipline') => Record<string, any>;
  downloadDataAsJson: (scope?: 'all' | 'students' | 'attendance_discipline') => string;
  importDataFromJson: (jsonString: string) => { success: boolean; message: string };
  resetToHardcodedDefaultData: () => void;

  // Cloud & Multi-User Real-Time Synchronization
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
  CUSTOM_ROLES: 'a7_custom_cadre_roles_v2026_10_25',
  GRADE_BATCHES: 'a7_grade_batches_v2026_10_25',
  ACTIVE_GRADE_BATCH: 'a7_active_grade_batch_v2026_10_25',
  VIEW_DEVICE_MODE: 'a7_view_device_mode_v1',
  UI_DENSITY: 'a7_ui_density_v1',
  LAST_ATTENDANCE_DATE: 'a7_last_attendance_auto_reset_date_v2',
  LAST_DUTY_WEEK: 'a7_last_duty_auto_reset_week_v2',
  KEEP_EMULATION_ACROSS_WEEKS: 'a7_keep_emulation_across_weeks_v1',
  EMULATION_RESET_BASELINE_WEEK: 'a7_emulation_reset_baseline_week_v1',
};

// Safe Storage Helpers to prevent crashes when localStorage/sessionStorage is blocked or corrupted
const safeGetLocal = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.warn('localStorage.getItem error:', e);
  }
  return null;
};

const safeSetLocal = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('localStorage.setItem error:', e);
  }
};

const safeRemoveLocal = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('localStorage.removeItem error:', e);
  }
};

const safeGetSession = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch (e) {
    console.warn('sessionStorage.getItem error:', e);
  }
  return null;
};

const safeSetSession = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('sessionStorage.setItem error:', e);
  }
};

const safeRemoveSession = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('sessionStorage.removeItem error:', e);
  }
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
  // Teacher Authentication state
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    return safeGetSession('a7_teacher_auth_v1') === 'true';
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);

  // Role
  const [role, setRoleState] = useState<Role>(() => {
    const savedRole = safeGetLocal(STORAGE_KEYS.ROLE) as Role | null;
    const isAuth = safeGetSession('a7_teacher_auth_v1') === 'true';
    if (savedRole === 'teacher' && !isAuth) {
      return 'student'; // Require password before accessing teacher role
    }
    if (savedRole === 'teacher' || savedRole === 'student' || savedRole === 'parent') {
      return savedRole;
    }
    return 'student';
  });

  // Active student id for student/parent view
  const [activeStudentId, setActiveStudentIdState] = useState<string>(() => {
    return safeGetLocal(STORAGE_KEYS.ACTIVE_STUDENT) || 'hs-27'; // Default Huỳnh Thị Ái Ly
  });

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

  // Default cadre roles map for 12A7 officers
  const DEFAULT_CADRE_ROLES: Record<string, StudentCadreRole> = {
    'hs-27': 'Lớp trưởng',       // Huỳnh Thị Ái Ly
    'hs-1': 'Lớp phó học tập',     // Vũ Trịnh Bảo An
    'hs-35': 'Lớp phó kỉ luật',    // Đặng Đình Phúc
    'hs-42': 'Bí thư',            // Nguyễn Ngọc Bích Trâm
    'hs-21': 'Lớp phó lao động',   // Trần Anh Khoa
    'hs-20': 'Tổ trưởng',         // Nguyễn Hoàng Khang (Tổ 1)
    'hs-13': 'Tổ trưởng',         // Lê Quang Hải (Tổ 2)
    'hs-31': 'Tổ trưởng',         // Phạm Nhật Minh (Tổ 3)
    'hs-46': 'Tổ trưởng',         // Võ Hoàng Tuấn (Tổ 4)
  };

  // Students - Hardcoded 50 students from default JSON dataset
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return (INITIAL_STUDENTS || []).map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES));
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  // Current student object
  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Attendance by dates (Strictly Monday - Friday, no Saturday/Sunday)
  const rawTodayStr = new Date().toISOString().split('T')[0];
  const todayStr = normalizeToSchoolDay(rawTodayStr).date;
  const realCalendarWeek = getWeekIndexFromDate(todayStr);

  // Weekly Discipline & Emulation State
  // Automatically advance to the current calendar week when a new week starts
  const [currentWeek, setCurrentWeekState] = useState<number>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.CURRENT_WEEK);
    const num = saved ? Number(saved) : NaN;
    if (!isNaN(num) && num >= realCalendarWeek) {
      return num;
    }
    return realCalendarWeek || INITIAL_CURRENT_WEEK;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.CURRENT_WEEK, String(currentWeek));
  }, [currentWeek]);

  // Emulation non-auto-reset mode:
  // By default true ("App không tự reset lại điểm thi đua khi bắt đầu tuần mới")
  const [keepEmulationAcrossWeeks, setKeepEmulationAcrossWeeksState] = useState<boolean>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.KEEP_EMULATION_ACROSS_WEEKS);
    if (saved === 'false') return false;
    return true;
  });

  const setKeepEmulationAcrossWeeks = (keep: boolean) => {
    setKeepEmulationAcrossWeeksState(keep);
    safeSetLocal(STORAGE_KEYS.KEEP_EMULATION_ACROSS_WEEKS, String(keep));
  };

  const [emulationResetBaselineWeek, setEmulationResetBaselineWeekState] = useState<number>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.EMULATION_RESET_BASELINE_WEEK);
    const num = saved ? Number(saved) : NaN;
    return !isNaN(num) && num > 0 ? num : 1;
  });

  const setEmulationResetBaselineWeek = (weekNum: number) => {
    setEmulationResetBaselineWeekState(weekNum);
    safeSetLocal(STORAGE_KEYS.EMULATION_RESET_BASELINE_WEEK, String(weekNum));
  };

  const [disciplineEntries, setDisciplineEntries] = useState<StudentDisciplineEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.DISCIPLINE_ENTRIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DISCIPLINE_ENTRIES;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.DISCIPLINE_ENTRIES, JSON.stringify(disciplineEntries));
  }, [disciplineEntries]);

  const [bonusEntries, setBonusEntries] = useState<BonusPointEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.BONUS_ENTRIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BONUS_ENTRIES;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.BONUS_ENTRIES, JSON.stringify(bonusEntries));
  }, [bonusEntries]);

  const [emulationScoreAdjustments, setEmulationScoreAdjustments] = useState<
    EmulationScoreAdjustment[]
  >(() => {
    const saved = safeGetLocal(STORAGE_KEYS.EMULATION_ADJUSTMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EMULATION_ADJUSTMENTS;
  });

  useEffect(() => {
    safeSetLocal(
      STORAGE_KEYS.EMULATION_ADJUSTMENTS,
      JSON.stringify(emulationScoreAdjustments)
    );
  }, [emulationScoreAdjustments]);

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

  // Helper to build a fresh 100% present attendance sheet for any new school day
  const createFreshDailyAttendance = useCallback(
    (dateStr: string, studentList?: Student[]): DailyAttendance => {
      const list = studentList && studentList.length > 0 ? studentList : INITIAL_STUDENTS;
      const freshRecords: Record<string, AttendanceStatus> = {};
      list.forEach((s) => {
        freshRecords[s.id] = 'present';
      });
      return {
        date: dateStr,
        records: freshRecords,
        note: '',
        checkedBy: 'Hệ thống Tự động (Đã reset ngày mới - 100% Có mặt)',
      };
    },
    []
  );

  // Sanitize any stale attendance map where a date > 2026-10-23 accidentally copied INITIAL_ATTENDANCE from 2026-10-23
  const sanitizeAttendanceDaysMap = useCallback(
    (rawMap: Record<string, DailyAttendance>, targetToday: string): Record<string, DailyAttendance> => {
      const cleaned: Record<string, DailyAttendance> = {};
      const oct23Note = INITIAL_ATTENDANCE.note;
      for (const [dt, dayObj] of Object.entries(rawMap || {})) {
        if (!dayObj || typeof dayObj !== 'object') continue;
        const isStaleOct23Clone =
          dt !== '2026-10-23' &&
          dayObj.note === oct23Note &&
          dayObj.records?.['hs-21'] === 'late' &&
          dayObj.records?.['hs-29'] === 'excused';
        if (isStaleOct23Clone) {
          cleaned[dt] = createFreshDailyAttendance(dt);
        } else {
          cleaned[dt] = dayObj;
        }
      }
      if (!cleaned[targetToday]) {
        cleaned[targetToday] = createFreshDailyAttendance(targetToday);
      }
      return cleaned;
    },
    [createFreshDailyAttendance]
  );

  const [allAttendanceDays, setAllAttendanceDays] = useState<Record<string, DailyAttendance>>(() => {
    const lastResetDate = safeGetLocal(STORAGE_KEYS.LAST_ATTENDANCE_DATE);
    const saved = safeGetLocal(STORAGE_KEYS.ATTENDANCE_DAYS);
    let initialMap: Record<string, DailyAttendance> = { ...INITIAL_ALL_ATTENDANCE_DAYS };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
          initialMap = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const sanitized = sanitizeAttendanceDaysMap(initialMap, todayStr);
    // When entering a new day that hasn't been auto-reset yet, ensure todayStr starts fresh 100% present
    if (lastResetDate !== todayStr) {
      safeSetLocal(STORAGE_KEYS.LAST_ATTENDANCE_DATE, todayStr);
      if (!INITIAL_ALL_ATTENDANCE_DAYS[todayStr]) {
        sanitized[todayStr] = createFreshDailyAttendance(todayStr);
      }
    }
    return sanitized;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.ATTENDANCE_DAYS, JSON.stringify(allAttendanceDays));
  }, [allAttendanceDays]);

  // Live watcher: Automatically reset attendance when the clock crosses into a new school day
  useEffect(() => {
    const checkDayTransition = () => {
      const currentRaw = new Date().toISOString().split('T')[0];
      const currentNormDate = normalizeToSchoolDay(currentRaw).date;
      const lastReset = safeGetLocal(STORAGE_KEYS.LAST_ATTENDANCE_DATE);
      if (lastReset !== currentNormDate) {
        safeSetLocal(STORAGE_KEYS.LAST_ATTENDANCE_DATE, currentNormDate);
        setAllAttendanceDays((prev) => ({
          ...prev,
          [currentNormDate]: createFreshDailyAttendance(currentNormDate, students),
        }));
        setSelectedAttendanceDateState(currentNormDate);
        const newWeekIdx = getWeekIndexFromDate(currentNormDate);
        if (newWeekIdx !== currentWeek) {
          setCurrentWeekState(newWeekIdx);
        }
      }
    };
    const interval = window.setInterval(checkDayTransition, 30000);
    return () => window.clearInterval(interval);
  }, [createFreshDailyAttendance, students, currentWeek]);

  const rawCurrentDay = allAttendanceDays?.[selectedAttendanceDate];
  const fallbackFreshDay = createFreshDailyAttendance(selectedAttendanceDate, students);
  const currentDateAttendance: DailyAttendance = {
    date: rawCurrentDay?.date || selectedAttendanceDate,
    records:
      rawCurrentDay?.records &&
      typeof rawCurrentDay.records === 'object' &&
      Object.keys(rawCurrentDay.records).length > 0
        ? rawCurrentDay.records
        : fallbackFreshDay.records,
    note: rawCurrentDay?.note ?? '',
    checkedBy: rawCurrentDay?.checkedBy || fallbackFreshDay.checkedBy,
  };

  // Supplementary Attendance list state
  const [supplementaryAttendanceList, setSupplementaryAttendanceList] = useState<SupplementaryAttendanceEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.SUPPLEMENTARY_ATTENDANCE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUPPLEMENTARY_ATTENDANCE;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.SUPPLEMENTARY_ATTENDANCE, JSON.stringify(supplementaryAttendanceList));
  }, [supplementaryAttendanceList]);

  // System Notifications (Auto-summary after Friday & Supplementary attendance)
  const [recentAlerts, setRecentAlerts] = useState<string[]>([
    `Hệ thống tự động: Sau ngày Thứ 6, hệ thống đã tự động khóa sổ điểm danh tuần (${getWeekRangeByIndex(INITIAL_CURRENT_WEEK).rangeLabel}) và hoàn tất tổng kết điểm thi đua cho 50 học sinh lớp 12A7.`,
  ]);

  const clearAlerts = () => setRecentAlerts([]);

  // Helper: Automatically synchronize attendance status with linked Discipline Violation (Điều 1: Đi trễ -5đ, Điều 8: Vắng có phép -5đ, Điều 9: Vắng không phép -20đ)
  const syncDisciplineViolationFromAttendance = (
    studentId: string,
    status: AttendanceStatus,
    dateToUse: string,
    opts?: {
      ruleNumber?: number;
      pointsDeducted?: number;
      note?: string;
      recordedBy?: string;
    }
  ) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return;

    const targetWeek = getWeekIndexFromDate(dateToUse);
    const linkedId = `att-disc-${dateToUse}-${studentId}`;
    const attendanceRuleNumbers = [1, 8, 9];

    if (status === 'present') {
      // Remove any attendance-linked violation for this student on this date
      setDisciplineEntries((prev) =>
        prev.filter(
          (d) =>
            d.id !== linkedId &&
            !(
              d.studentId === studentId &&
              d.date === dateToUse &&
              attendanceRuleNumbers.includes(d.ruleNumber)
            )
        )
      );
      return;
    }

    const defaultRuleNum = status === 'late' ? 1 : status === 'excused' ? 8 : 9;
    const ruleNum = opts?.ruleNumber || defaultRuleNum;
    const ruleObj = VIOLATIONS_CATALOG.find((r) => r.stt === ruleNum);
    const points =
      opts?.pointsDeducted !== undefined
        ? opts.pointsDeducted
        : ruleObj?.pointsDeducted ?? (status === 'unexcused' ? 20 : 5);
    const defaultNote =
      status === 'late'
        ? 'Đi học trễ (Tự động liên kết từ Điểm danh)'
        : status === 'excused'
        ? 'Vắng có phép 1 buổi (Tự động liên kết từ Điểm danh)'
        : 'Vắng không phép 1 buổi (Tự động liên kết từ Điểm danh)';
    const recorder =
      opts?.recordedBy ||
      (role === 'teacher'
        ? 'Thầy Trương Xuân Hòa (GVCN)'
        : currentStudent?.name
        ? `${currentStudent.name} (${currentStudent.classRole || 'Ban cán sự'})`
        : 'Hệ thống Điểm danh 12A7');

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
      const filtered = prev.filter(
        (d) =>
          d.id !== linkedId &&
          !(
            d.studentId === studentId &&
            d.date === dateToUse &&
            attendanceRuleNumbers.includes(d.ruleNumber)
          )
      );
      return [newViolationEntry, ...filtered];
    });
  };

  const updateAttendanceStatus = (
    studentId: string,
    status: AttendanceStatus,
    targetDate?: string,
    violationOpts?: {
      ruleNumber?: number;
      pointsDeducted?: number;
      note?: string;
      recordedBy?: string;
      skipViolationSync?: boolean;
    }
  ) => {
    const rawDate = targetDate || selectedAttendanceDate || todayStr;
    const norm = normalizeToSchoolDay(rawDate);
    const dateToUse = norm.date;

    setAllAttendanceDays((prev) => {
      const targetDay = prev[dateToUse] || { date: dateToUse, records: {}, note: '' };
      const updatedRecords = { ...targetDay.records, [studentId]: status };
      return {
        ...prev,
        [dateToUse]: {
          ...targetDay,
          records: updatedRecords,
        },
      };
    });

    // Automatically link & sync with Discipline Violations
    if (!violationOpts?.skipViolationSync) {
      syncDisciplineViolationFromAttendance(studentId, status, dateToUse, violationOpts);
    }

    // Auto-update student attendance summary stats
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

    // If attendance is updated on Friday (Thứ 6), auto-update the weekly emulation summary alert
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
    students.forEach((s) => {
      allPresentRecords[s.id] = 'present';
    });

    setAllAttendanceDays((prev) => {
      const targetDay = prev[dateToUse] || { date: dateToUse, records: {}, note: '' };
      return {
        ...prev,
        [dateToUse]: {
          ...targetDay,
          records: allPresentRecords,
        },
      };
    });

    // Clear all attendance-linked violations on this date
    setDisciplineEntries((prev) =>
      prev.filter(
        (d) =>
          !(
            d.date === dateToUse &&
            (d.id.startsWith(`att-disc-${dateToUse}-`) || [1, 8, 9].includes(d.ruleNumber))
          )
      )
    );
  };

  const resetDateAttendance = (targetDate?: string) => {
    const rawDate = targetDate || selectedAttendanceDate || todayStr;
    const norm = normalizeToSchoolDay(rawDate);
    const dateToUse = norm.date;
    const freshDay = createFreshDailyAttendance(dateToUse, students);

    setAllAttendanceDays((prev) => ({
      ...prev,
      [dateToUse]: freshDay,
    }));

    setDisciplineEntries((prev) =>
      prev.filter(
        (d) =>
          !(
            d.date === dateToUse &&
            (d.id.startsWith(`att-disc-${dateToUse}-`) || [1, 8, 9].includes(d.ruleNumber))
          )
      )
    );
  };

  const saveAttendanceNote = (note: string, targetDate?: string) => {
    const dateToUse = targetDate || selectedAttendanceDate || todayStr;
    setAllAttendanceDays((prev) => {
      const targetDay = prev[dateToUse] || { date: dateToUse, records: {}, note: '' };
      return {
        ...prev,
        [dateToUse]: { ...targetDay, note },
      };
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

    // Automatically synchronize with allAttendanceDays for that date
    setAllAttendanceDays((prev) => {
      const day = prev[normDate] || { date: normDate, records: {}, note: '' };
      return {
        ...prev,
        [normDate]: {
          ...day,
          records: {
            ...day.records,
            [entryData.studentId]: entryData.newStatus,
          },
        },
      };
    });

    // Automatically update linked Discipline Violation for that date & student
    syncDisciplineViolationFromAttendance(entryData.studentId, entryData.newStatus, normDate, {
      note: `Điểm danh bổ sung: ${entryData.reason}${entryData.note ? ` (${entryData.note})` : ''}`,
      recordedBy: entryData.recordedBy,
    });

    // Auto-alert
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
    setAllAttendanceDays((prev) => ({
      ...prev,
      [date]: attendance,
    }));
  };

  const scanQRAttendance = (codeOrId: string) => {
    const trimmed = codeOrId.trim().toUpperCase();
    const stu = students.find((s) => s.code.toUpperCase() === trimmed || s.id.toUpperCase() === trimmed || s.name.toUpperCase().includes(trimmed));
    if (!stu) {
      return { success: false, message: `Không tìm thấy học sinh với mã "${codeOrId}" trong danh sách 12A7!` };
    }
    updateAttendanceStatus(stu.id, 'present');
    return { success: true, message: `Điểm danh thành công cho học sinh ${stu.name} (${stu.code})!`, studentName: stu.name };
  };

  // Student actions
  const addStudent = (studentData: Omit<Student, 'id' | 'stt'>) => {
    const newStt = students.length + 1;
    const newStudent: Student = {
      ...studentData,
      id: `hs-${Date.now()}`,
      stt: newStt,
      code: `12A7-${newStt.toString().padStart(2, '0')}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const getStudentById = (id: string) => {
    return students.find((s) => s.id === id);
  };

  const assignStudentCadreRole = (studentId: string, cadreRole: StudentCadreRole) => {
    const singletonRoles: StudentCadreRole[] = [
      'Lớp trưởng',
      'Lớp phó học tập',
      'Lớp phó kỉ luật',
      'Lớp phó lao động',
      'Bí thư',
    ];
    const targetStu = students.find((s) => s.id === studentId);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return { ...s, classRole: cadreRole };
        }
        // If assigning a unique class officer role, demote previous holder to 'Học sinh'
        if (singletonRoles.includes(cadreRole) && s.classRole === cadreRole) {
          return { ...s, classRole: 'Học sinh' };
        }
        return s;
      })
    );

    if (cadreRole === 'Lớp phó lao động' && targetStu) {
      setDutySchedule((prev) =>
        prev.map((item) => ({
          ...item,
          assignedBy: `${targetStu.name} (Lớp phó Lao động)`,
        }))
      );
    }
  };

  // Student Privacy PIN unlock state (sessionStorage based)
  const [unlockedStudents, setUnlockedStudents] = useState<Record<string, boolean>>(() => {
    try {
      const saved = safeGetSession('a7_unlocked_students_v1');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  const isStudentUnlocked = (studentId: string): boolean => {
    // If authenticated teacher, always bypass
    if (role === 'teacher' && isTeacherAuthenticated) return true;
    const stu = students.find((s) => s.id === studentId);
    // If student has no PIN set, unlocked by default
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
    if (cleaned.length < 4) {
      return { success: false, message: 'Mật khẩu / Mã PIN bảo mật phải có ít nhất 4 ký tự.' };
    }
    const isTeacher = role === 'teacher' && isTeacherAuthenticated;
    if (!isTeacher && stu.pinCode && stu.pinCode.trim() !== '') {
      if (!oldPin || oldPin.trim() !== stu.pinCode.trim()) {
        return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
      }
    }
    const updated = { ...stu, pinCode: cleaned };
    updateStudent(updated);
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
      if (!currentPin || currentPin.trim() !== stu.pinCode.trim()) {
        return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
      }
    }
    const updated = { ...stu, pinCode: undefined };
    updateStudent(updated);
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
    const updated = { ...stu, pinCode: updatedPin };
    updateStudent(updated);
    setUnlockedStudents((prev) => {
      const next = { ...prev, [studentId]: true };
      safeSetSession('a7_unlocked_students_v1', JSON.stringify(next));
      return next;
    });
    if (updatedPin) {
      return {
        success: true,
        message: `Thầy Trương Xuân Hòa đã đặt lại mật khẩu (Mã PIN) của em ${stu.name} thành "${updatedPin}".`,
      };
    }
    return {
      success: true,
      message: `Thầy Trương Xuân Hòa đã gỡ khóa và đặt lại mật khẩu cho em ${stu.name}.`,
    };
  };

  const resetAllStudentPinsByTeacher = (newDefaultPin?: string) => {
    const updatedPin = newDefaultPin && newDefaultPin.trim() !== '' ? newDefaultPin.trim() : undefined;
    setStudents((prev) => prev.map((s) => ({ ...s, pinCode: updatedPin })));
    const allUnlocked: Record<string, boolean> = {};
    students.forEach((s) => {
      allUnlocked[s.id] = true;
    });
    setUnlockedStudents(allUnlocked);
    safeSetSession('a7_unlocked_students_v1', JSON.stringify(allUnlocked));
    if (updatedPin) {
      return {
        success: true,
        message: `Đã đặt lại mật khẩu (Mã PIN) mặc định "${updatedPin}" cho toàn bộ ${students.length} học sinh 12A7!`,
      };
    }
    return {
      success: true,
      message: `Đã gỡ mật khẩu và mở khóa tự do cho toàn bộ ${students.length} học sinh 12A7!`,
    };
  };

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.ASSIGNMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ASSIGNMENTS;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      submissions: {},
    };
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const submitAssignment = (assignmentId: string, studentId: string, content: string, attachments?: string[]) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return;

    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === assignmentId) {
          const subs = { ...asg.submissions };
          subs[studentId] = {
            studentId,
            studentName: stu.name,
            submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            content,
            attachments: attachments || ['bai_nop_' + stu.code + '.pdf'],
            status: 'submitted',
          };
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
          return {
            ...asg,
            submissions: { ...asg.submissions, [studentId]: sub },
          };
        }
        return asg;
      })
    );
  };

  // Grades updating
  const updateSubjectScore = (
    studentId: string,
    subjectKey: keyof Student['scores'],
    field: 'regular' | 'midterm' | 'final',
    value: number | number[]
  ) => {
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id === studentId) {
          const subject = { ...stu.scores[subjectKey] };
          if (field === 'regular') {
            subject.regular = Array.isArray(value) ? value : [value];
          } else if (field === 'midterm') {
            subject.midterm = typeof value === 'number' ? value : value[0] || 0;
          } else if (field === 'final') {
            subject.final = typeof value === 'number' ? value : value[0] || 0;
          }
          // Compute subject average: (regular_avg + midterm*2 + final*3) / (regular_count + 5)
          const regAvg = subject.regular.length > 0 ? subject.regular.reduce((a, b) => a + b, 0) / subject.regular.length : 0;
          subject.avg = Number(((regAvg + subject.midterm * 2 + subject.final * 3) / 6).toFixed(1));

          const newScores = { ...stu.scores, [subjectKey]: subject };

          // Compute overall GPA across all subjects
          const allAvgs = Object.values(newScores).map((s) => s.avg);
          const newGpa = Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2));

          // Classification logic:
          // Xuất sắc: GPA >= 9.0 and all >= 8.0, Conduct Tốt
          // Giỏi: GPA >= 8.0 and all >= 6.5, Conduct Tốt
          // Khá: GPA >= 6.5 and all >= 5.0, Conduct Khá/Tốt
          // Đạt: GPA >= 5.0 and all >= 3.5
          let classification: Student['currentClassification'] = 'Đạt';
          const minScore = Math.min(...allAvgs);
          if (newGpa >= 9.0 && minScore >= 8.0 && stu.currentConduct === 'Tốt') {
            classification = 'Xuất sắc';
          } else if (newGpa >= 8.0 && minScore >= 6.5 && stu.currentConduct === 'Tốt') {
            classification = 'Giỏi';
          } else if (newGpa >= 6.5 && minScore >= 5.0) {
            classification = 'Khá';
          } else if (newGpa >= 5.0) {
            classification = 'Đạt';
          } else {
            classification = 'Chưa đạt';
          }

          return {
            ...stu,
            scores: newScores,
            currentGpa: newGpa,
            currentClassification: classification,
          };
        }
        return stu;
      })
    );
  };

  const updateConduct = (studentId: string, conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt') => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return { ...s, currentConduct: conduct };
        }
        return s;
      })
    );
  };

  const importExcelScores = (
    records: Array<{
      studentId: string;
      scores: Partial<Record<keyof Student['scores'], number | { avg?: number; regular?: number[]; midterm?: number; final?: number }>>;
      conduct?: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
    }>
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
              newScores[subKey] = {
                ...newScores[subKey],
                avg: Number(val.toFixed(1)),
                midterm: Number(val.toFixed(1)),
                final: Number(val.toFixed(1)),
              };
            } else if (val && typeof val === 'object') {
              const currentSub = newScores[subKey];
              const regular = val.regular || currentSub.regular;
              const midterm = typeof val.midterm === 'number' ? val.midterm : currentSub.midterm;
              const final = typeof val.final === 'number' ? val.final : currentSub.final;
              const regAvg = regular.length > 0 ? regular.reduce((a, b) => a + b, 0) / regular.length : 0;
              const calculatedAvg =
                typeof val.avg === 'number'
                  ? val.avg
                  : Number(((regAvg + midterm * 2 + final * 3) / 6).toFixed(1));

              newScores[subKey] = {
                ...currentSub,
                regular,
                midterm,
                final,
                avg: calculatedAvg,
              };
            }
          }
        }

        const newConduct = match.conduct || stu.currentConduct;
        const allAvgs = Object.values(newScores).map((s) => s.avg);
        const newGpa = Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2));

        let classification: Student['currentClassification'] = 'Đạt';
        const minScore = Math.min(...allAvgs);
        if (newGpa >= 9.0 && minScore >= 8.0 && newConduct === 'Tốt') {
          classification = 'Xuất sắc';
        } else if (newGpa >= 8.0 && minScore >= 6.5 && newConduct === 'Tốt') {
          classification = 'Giỏi';
        } else if (newGpa >= 6.5 && minScore >= 5.0) {
          classification = 'Khá';
        } else if (newGpa >= 5.0) {
          classification = 'Đạt';
        } else {
          classification = 'Chưa đạt';
        }

        return {
          ...stu,
          scores: newScores,
          currentConduct: newConduct,
          currentGpa: newGpa,
          currentClassification: classification,
        };
      })
    );

    return {
      successCount: count,
      message: `Đã cập nhật thành công bảng điểm cho ${count} học sinh.`,
    };
  };

  // Custom Cadre Roles (GVCN có thể thêm vai trò cho HS)
  const DEFAULT_CUSTOM_ROLES = [
    'Cán sự môn Hóa học',
    'Cán sự môn Toán',
    'Cán sự môn Tiếng Anh',
    'Thủ quỹ lớp',
    'Đội Văn nghệ & Truyền thông',
    'Phụ trách Thiết bị & CNTT',
  ];

  const [customCadreRoles, setCustomCadreRoles] = useState<string[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.CUSTOM_ROLES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CUSTOM_ROLES;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.CUSTOM_ROLES, JSON.stringify(customCadreRoles));
  }, [customCadreRoles]);

  const addCustomCadreRole = (roleName: string): { success: boolean; message: string } => {
    const trimmed = (roleName || '').trim();
    if (!trimmed) {
      return { success: false, message: 'Vui lòng nhập tên vai trò hợp lệ.' };
    }
    const baseRoles = [
      'Lớp trưởng',
      'Lớp phó học tập',
      'Lớp phó kỉ luật',
      'Bí thư',
      'Lớp phó lao động',
      'Tổ trưởng',
      'Học sinh',
    ];
    const allExisting = [...baseRoles, ...customCadreRoles];
    if (allExisting.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: `Vai trò "${trimmed}" đã tồn tại trong danh sách.` };
    }
    setCustomCadreRoles((prev) => [...prev, trimmed]);
    return { success: true, message: `Đã thêm vai trò mới: "${trimmed}"!` };
  };

  const removeCustomCadreRole = (roleName: string) => {
    setCustomCadreRoles((prev) => prev.filter((r) => r !== roleName));
    setStudents((prev) =>
      prev.map((s) => (s.classRole === roleName ? { ...s, classRole: 'Học sinh' } : s))
    );
  };

  // UI Display & Device Optimization Mode (Tùy chỉnh giao diện Máy tính / Điện thoại)
  const [viewDeviceMode, setViewDeviceModeState] = useState<ViewDeviceMode>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.VIEW_DEVICE_MODE) as ViewDeviceMode | null;
    if (saved === 'auto' || saved === 'desktop' || saved === 'mobile') return saved;
    return 'auto';
  });

  const setViewDeviceMode = (mode: ViewDeviceMode) => {
    setViewDeviceModeState(mode);
    safeSetLocal(STORAGE_KEYS.VIEW_DEVICE_MODE, mode);
  };

  const [uiDensity, setUiDensityState] = useState<UIDensityMode>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.UI_DENSITY) as UIDensityMode | null;
    if (saved === 'comfortable' || saved === 'compact') return saved;
    return 'comfortable';
  });

  const setUiDensity = (density: UIDensityMode) => {
    setUiDensityState(density);
    safeSetLocal(STORAGE_KEYS.UI_DENSITY, density);
  };

  // Multi-Batch Grade Management (Nhập điểm mới theo từng đợt & Xóa bảng điểm)
  const buildBatchRecordsFromStudents = (stuList: Student[], scaleFactor = 1): GradeBatch['records'] => {
    const records: GradeBatch['records'] = {};
    for (const s of stuList) {
      const subMap: Partial<Record<keyof Student['scores'], number>> = {};
      (Object.keys(s.scores) as Array<keyof Student['scores']>).forEach((k) => {
        const rawAvg = s.scores[k]?.avg ?? 8.0;
        const val =
          scaleFactor === 1
            ? rawAvg
            : Math.min(10, Math.max(0, Number((rawAvg * scaleFactor).toFixed(1))));
        subMap[k] = val;
      });
      records[s.id] = {
        scores: subMap,
        conduct: s.currentConduct || 'Tốt',
      };
    }
    return records;
  };

  const INITIAL_GRADE_BATCHES: GradeBatch[] = [
    {
      id: 'batch-hk1-d1',
      name: 'Đợt 1: Khảo sát & Giữa Học kỳ I',
      semester: 'HK1',
      createdAt: '2026-10-05',
      note: 'Bảng điểm khảo sát đầu năm và kiểm tra giữa kỳ I lớp 12A7',
      records: buildBatchRecordsFromStudents(
        (INITIAL_STUDENTS || []).map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES)),
        0.96
      ),
    },
    {
      id: 'batch-hk1-current',
      name: 'Đợt 2: Bảng điểm Tổng hợp HK1 (Hiện tại)',
      semester: 'HK1',
      createdAt: '2026-10-25',
      note: 'Bảng điểm tổng hợp chính thức 10 môn học kỳ I năm học 2026 - 2027',
      records: buildBatchRecordsFromStudents(
        (INITIAL_STUDENTS || []).map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES)),
        1
      ),
    },
  ];

  const [gradeBatches, setGradeBatches] = useState<GradeBatch[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.GRADE_BATCHES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_GRADE_BATCHES;
  });

  const [activeGradeBatchId, setActiveGradeBatchIdState] = useState<string>(() => {
    return safeGetLocal(STORAGE_KEYS.ACTIVE_GRADE_BATCH) || 'batch-hk1-current';
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.GRADE_BATCHES, JSON.stringify(gradeBatches));
  }, [gradeBatches]);

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.ACTIVE_GRADE_BATCH, activeGradeBatchId);
  }, [activeGradeBatchId]);

  // Keep active GradeBatch records synchronized whenever `students` scores change
  useEffect(() => {
    setGradeBatches((prev) => {
      const exists = prev.some((b) => b.id === activeGradeBatchId);
      if (!exists) return prev;
      return prev.map((b) => {
        if (b.id !== activeGradeBatchId) return b;
        return {
          ...b,
          updatedAt: new Date().toISOString().split('T')[0],
          records: buildBatchRecordsFromStudents(students, 1),
        };
      });
    });
  }, [students, activeGradeBatchId]);

  const applyBatchRecordsToStudents = (batch: GradeBatch) => {
    setStudents((prev) =>
      prev.map((stu) => {
        const rec = batch.records?.[stu.id];
        if (!rec) return stu;
        const newScores = { ...stu.scores };
        (Object.keys(newScores) as Array<keyof Student['scores']>).forEach((subKey) => {
          const val = rec.scores?.[subKey];
          if (typeof val === 'number') {
            newScores[subKey] = {
              ...newScores[subKey],
              regular: [val, val],
              midterm: val,
              final: val,
              avg: Number(val.toFixed(1)),
            };
          }
        });
        const newConduct = rec.conduct || stu.currentConduct;
        const allAvgs = Object.values(newScores).map((s) => s.avg);
        const newGpa = Number((allAvgs.reduce((a, b) => a + b, 0) / (allAvgs.length || 1)).toFixed(2));
        const minScore = Math.min(...allAvgs);
        let classification: Student['currentClassification'] = 'Đạt';
        if (newGpa >= 9.0 && minScore >= 8.0 && newConduct === 'Tốt') {
          classification = 'Xuất sắc';
        } else if (newGpa >= 8.0 && minScore >= 6.5 && newConduct === 'Tốt') {
          classification = 'Giỏi';
        } else if (newGpa >= 6.5 && minScore >= 5.0) {
          classification = 'Khá';
        } else if (newGpa >= 5.0) {
          classification = 'Đạt';
        } else {
          classification = 'Chưa đạt';
        }
        return {
          ...stu,
          scores: newScores,
          currentConduct: newConduct,
          currentGpa: newGpa,
          currentClassification: classification,
        };
      })
    );
  };

  const setActiveGradeBatchId = (batchId: string) => {
    const target = gradeBatches.find((b) => b.id === batchId);
    if (!target) return;
    setActiveGradeBatchIdState(batchId);
    applyBatchRecordsToStudents(target);
  };

  const createGradeBatch = (
    name: string,
    semester: GradeBatch['semester'],
    copyFromCurrent: boolean = false,
    note?: string
  ): GradeBatch => {
    const blankStudents = students.map((s) => {
      if (copyFromCurrent) return s;
      const zeroScores = { ...s.scores };
      (Object.keys(zeroScores) as Array<keyof Student['scores']>).forEach((k) => {
        zeroScores[k] = {
          ...zeroScores[k],
          regular: [0, 0],
          midterm: 0,
          final: 0,
          avg: 0,
        };
      });
      return {
        ...s,
        scores: zeroScores,
        currentGpa: 0,
      };
    });

    const newBatch: GradeBatch = {
      id: `batch-${Date.now()}`,
      name: name.trim() || `Đợt nhập điểm mới (${new Date().toLocaleDateString('vi-VN')})`,
      semester,
      createdAt: new Date().toISOString().split('T')[0],
      note: note || (copyFromCurrent ? 'Sao chép từ đợt điểm trước' : 'Bảng điểm mới khởi tạo'),
      records: buildBatchRecordsFromStudents(blankStudents, 1),
    };

    setGradeBatches((prev) => [...prev, newBatch]);
    setActiveGradeBatchIdState(newBatch.id);
    applyBatchRecordsToStudents(newBatch);
    return newBatch;
  };

  const deleteGradeBatch = (batchId: string): { success: boolean; message: string } => {
    if (gradeBatches.length <= 1) {
      clearAllGrades();
      return {
        success: true,
        message: 'Đã xóa sạch dữ liệu điểm trong đợt hiện tại về 0.',
      };
    }
    const target = gradeBatches.find((b) => b.id === batchId);
    const remaining = gradeBatches.filter((b) => b.id !== batchId);
    setGradeBatches(remaining);
    if (activeGradeBatchId === batchId && remaining.length > 0) {
      const nextBatch = remaining[remaining.length - 1];
      setActiveGradeBatchIdState(nextBatch.id);
      applyBatchRecordsToStudents(nextBatch);
    }
    return {
      success: true,
      message: `Đã xóa đợt điểm "${target?.name || batchId}" thành công!`,
    };
  };

  const clearAllGrades = (subjectKey?: keyof Student['scores']): { success: boolean; message: string } => {
    setStudents((prev) =>
      prev.map((stu) => {
        const newScores = { ...stu.scores };
        if (subjectKey) {
          newScores[subjectKey] = {
            ...newScores[subjectKey],
            regular: [0, 0],
            midterm: 0,
            final: 0,
            avg: 0,
          };
        } else {
          (Object.keys(newScores) as Array<keyof Student['scores']>).forEach((k) => {
            newScores[k] = {
              ...newScores[k],
              regular: [0, 0],
              midterm: 0,
              final: 0,
              avg: 0,
            };
          });
        }
        const allAvgs = Object.values(newScores).map((s) => s.avg);
        const newGpa = Number((allAvgs.reduce((a, b) => a + b, 0) / (allAvgs.length || 1)).toFixed(2));
        return {
          ...stu,
          scores: newScores,
          currentGpa: newGpa,
          currentClassification: newGpa >= 5.0 ? stu.currentClassification : 'Chưa đạt',
        };
      })
    );

    return {
      success: true,
      message: subjectKey
        ? `Đã xóa toàn bộ cột điểm môn ${subjectKey.toUpperCase()} của 50 học sinh về 0.`
        : 'Đã xóa toàn bộ bảng điểm 10 môn của lớp 12A7 về 0 (Trống).',
    };
  };

  const clearStudentGrades = (studentId: string) => {
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id !== studentId) return stu;
        const newScores = { ...stu.scores };
        (Object.keys(newScores) as Array<keyof Student['scores']>).forEach((k) => {
          newScores[k] = {
            ...newScores[k],
            regular: [0, 0],
            midterm: 0,
            final: 0,
            avg: 0,
          };
        });
        return {
          ...stu,
          scores: newScores,
          currentGpa: 0,
          currentClassification: 'Chưa đạt',
        };
      })
    );
  };

  const restoreDefaultGrades = () => {
    const defaultStuMap = new Map(
      (INITIAL_STUDENTS || [])
        .map((s, idx) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES))
        .map((s) => [s.id, s])
    );
    setStudents((prev) =>
      prev.map((stu) => {
        const def = defaultStuMap.get(stu.id);
        if (!def) return stu;
        return {
          ...stu,
          scores: def.scores,
          currentGpa: def.currentGpa,
          currentConduct: def.currentConduct,
          currentClassification: def.currentClassification,
        };
      })
    );
  };

  // Evaluations
  const [evaluations, setEvaluations] = useState<EvaluationComment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.EVALUATIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EVALUATIONS;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  const addEvaluation = (evalData: Omit<EvaluationComment, 'id' | 'createdAt'>) => {
    const newEval: EvaluationComment = {
      ...evalData,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setEvaluations((prev) => [newEval, ...prev]);
  };

  const updateEvaluation = (updated: EvaluationComment) => {
    setEvaluations((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.ANNOUNCEMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAnnouncement = (id: string, updatedData: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...updatedData,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : a
      )
    );
  };

  // Chat messages
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.MESSAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MESSAGES;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (studentId: string, text: string, fileName?: string) => {
    const currentList = messages[studentId] || [];
    const sender = role === 'teacher' ? 'teacher' : 'parent';
    const senderName =
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa (GVCN)'
        : (currentStudent?.primaryParentName || 'Phụ huynh học sinh');

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      studentId,
      sender,
      senderName,
      text,
      fileName,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [studentId]: [...currentList, newMsg],
    }));
  };

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.APPOINTMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // Happy Posts
  const [happyPosts, setHappyPosts] = useState<HappyPost[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.HAPPY_POSTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({
            ...p,
            likedBy: Array.isArray(p?.likedBy) ? p.likedBy : [],
            comments: Array.isArray(p?.comments) ? p.comments : [],
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return (INITIAL_HAPPY_POSTS || []).map((p: any) => ({
      ...p,
      likedBy: Array.isArray(p?.likedBy) ? p.likedBy : [],
      comments: Array.isArray(p?.comments) ? p.comments : [],
    }));
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.HAPPY_POSTS, JSON.stringify(happyPosts));
  }, [happyPosts]);

  const addHappyPost = (postData: Omit<HappyPost, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>) => {
    const newPost: HappyPost = {
      ...postData,
      id: `post-${Date.now()}`,
      likes: 1,
      likedBy: [activeStudentId],
      comments: [],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setHappyPosts((prev) => [newPost, ...prev]);
  };

  const toggleLikePost = (postId: string, userId: string) => {
    setHappyPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const likedByList = Array.isArray(p.likedBy) ? p.likedBy : [];
          const already = likedByList.includes(userId);
          const updatedLikedBy = already ? likedByList.filter((id) => id !== userId) : [...likedByList, userId];
          return {
            ...p,
            likes: updatedLikedBy.length,
            likedBy: updatedLikedBy,
          };
        }
        return p;
      })
    );
  };

  const addPostComment = (postId: string, author: string, text: string) => {
    setHappyPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newC = {
            id: `c-${Date.now()}`,
            author,
            text,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };
          const existingComments = Array.isArray(p.comments) ? p.comments : [];
          return {
            ...p,
            comments: [...existingComments, newC],
          };
        }
        return p;
      })
    );
  };

  const updateHappyPost = (id: string, updatedData: Partial<HappyPost>) => {
    setHappyPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updatedData,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : p
      )
    );
  };

  const deleteHappyPost = (id: string) => {
    setHappyPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const deletePostComment = (postId: string, commentId: string) => {
    setHappyPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (Array.isArray(p.comments) ? p.comments : []).filter((c) => c.id !== commentId),
            }
          : p
      )
    );
  };

  // Automatic Monthly Birthday Wishes (Tự động đăng bài chúc sinh nhật các bạn sinh trong tháng vào đầu tháng)
  const postMonthlyBirthdayWishes = useCallback(
    (
      targetMonth?: number,
      force: boolean = false
    ): { posted: boolean; count: number; month: number; message: string } => {
      const now = new Date();
      const monthToUse = targetMonth && targetMonth >= 1 && targetMonth <= 12 ? targetMonth : now.getMonth() + 1;
      const yearToUse = now.getFullYear();
      const monthKey = `${yearToUse}-${String(monthToUse).padStart(2, '0')}`;

      const birthdayStudents = students
        .map((s) => {
          const parsed = parseStudentBirthday(s.birthday);
          return { student: s, parsed };
        })
        .filter((item) => item.parsed && item.parsed.month === monthToUse)
        .sort((a, b) => (a.parsed?.day || 1) - (b.parsed?.day || 1));

      if (birthdayStudents.length === 0) {
        return {
          posted: false,
          count: 0,
          month: monthToUse,
          message: `Trong tháng ${monthToUse} không có học sinh nào của lớp 12A7 có ngày sinh nhật.`,
        };
      }

      const alreadyPosted = happyPosts.some(
        (p) =>
          (p.isAutoBirthday && p.birthdayMonth === monthKey) ||
          (p.category === 'birthday' && p.title.includes(`Tháng ${monthToUse}`))
      );

      if (alreadyPosted && !force) {
        return {
          posted: false,
          count: birthdayStudents.length,
          month: monthToUse,
          message: `Bài chúc mừng sinh nhật Tháng ${monthToUse} cho ${birthdayStudents.length} bạn đã được đăng trên Góc Hạnh Phúc.`,
        };
      }

      const studentLines = birthdayStudents
        .map(
          (item, idx) =>
            `${idx + 1}. 🎂 ${item.student.name} (Tổ ${item.student.group} - Sinh ngày ${String(
              item.parsed?.day
            ).padStart(2, '0')}/${String(monthToUse).padStart(2, '0')})`
        )
        .join('\n');

      const namesShort = birthdayStudents.map((i) => i.student.name).join(', ');
      const postTitle = `🎉 Chúc Mừng Sinh Nhật ${birthdayStudents.length} Thành Viên Tháng ${monthToUse} Đại Gia Đình 12A7!`;
      const postContent = `Chào đón những ngày đầu Tháng ${monthToUse} rực rỡ! Tập thể lớp 12A7 và Thầy chủ nhiệm Trương Xuân Hòa gửi lời chúc mừng sinh nhật nồng nhiệt nhất đến ${birthdayStudents.length} thành viên có ngày sinh trong tháng ${monthToUse}:\n\n${studentLines}\n\n🌟 Chúc các bạn tuổi 18 luôn tràn đầy năng lượng, giữ vững nụ cười hạnh phúc, học tập bứt phá và đạt kết quả cao nhất trong kỳ thi Tốt nghiệp THPT & Đại học 2027 ("Dream Big And Dare To Fail")! 🥳💖`;

      const autoPost: HappyPost = {
        id: `bday-month-${monthKey}-${Date.now()}`,
        category: 'birthday',
        title: postTitle,
        content: postContent,
        authorName: 'Hệ thống Tự động 12A7 & Thầy Trương Xuân Hòa (GVCN)',
        authorRole: 'teacher',
        likes: 12,
        likedBy: ['hs-27', 'hs-1', 'hs-3'],
        comments: [
          {
            id: `c-bday-${Date.now()}`,
            author: 'Huỳnh Thị Ái Ly (Lớp trưởng)',
            text: `Thay mặt cả lớp 12A7 chúc mừng sinh nhật các bạn tháng ${monthToUse}: ${namesShort}! Chúc các bạn tuổi mới đậu NV1 Đại học 100% nhé! 🎂🎉`,
            time: '07:30',
          },
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
        createdAt: `01/${String(monthToUse).padStart(2, '0')}/${yearToUse} 07:00`,
        isAutoBirthday: true,
        birthdayMonth: monthKey,
      };

      setHappyPosts((prev) => {
        const filtered = force
          ? prev.filter((p) => !(p.isAutoBirthday && p.birthdayMonth === monthKey))
          : prev;
        return [autoPost, ...filtered];
      });

      setRecentAlerts((prev) => [
        `🎂 Tự động đầu tháng: Hệ thống đã đăng bài chúc mừng sinh nhật Tháng ${monthToUse} cho ${birthdayStudents.length} học sinh lớp 12A7 tại Góc Hạnh Phúc!`,
        ...prev,
      ]);

      return {
        posted: true,
        count: birthdayStudents.length,
        month: monthToUse,
        message: `Đã đăng bài chúc mừng sinh nhật Tháng ${monthToUse} cho ${birthdayStudents.length} học sinh lên Góc Hạnh Phúc!`,
      };
    },
    [students, happyPosts]
  );

  // Automatically check and post monthly birthday wishes at the start of the month (or once per month)
  const hasCheckedBirthdayRef = useRef(false);
  useEffect(() => {
    if (hasCheckedBirthdayRef.current || students.length === 0) return;
    hasCheckedBirthdayRef.current = true;
    const currentMonth = new Date().getMonth() + 1;
    postMonthlyBirthdayWishes(currentMonth, false);
  }, [students, postMonthlyBirthdayWishes]);

  // Official Class Period Times (per school schedule image: Sáng 07:20 - 11:10, Chiều 13:10 - 16:00)
  const OFFICIAL_MORNING_TIMES = [
    '07:25 - 08:10',
    '08:15 - 09:00',
    '09:35 - 10:20',
    '10:25 - 11:10',
    '11:15 - 12:00',
  ];
  const OFFICIAL_AFTERNOON_TIMES = [
    '13:15 - 14:00',
    '14:05 - 14:50',
    '15:15 - 16:00',
    '16:05 - 16:50',
  ];
  const LEGACY_TIMETABLE_TIMES = new Set([
    '07:00 - 07:45',
    '07:50 - 08:35',
    '08:55 - 09:40',
    '09:45 - 10:30',
    '10:35 - 11:20',
    '11:25 - 12:10',
    '13:30 - 14:15',
    '14:20 - 15:05',
  ]);

  const normalizeTimetablePeriodTimes = useCallback((entries: TimetableEntry[]): TimetableEntry[] => {
    if (!Array.isArray(entries)) return INITIAL_TIMETABLE;
    return entries.map((d) => ({
      ...d,
      periods: (Array.isArray(d?.periods) ? d.periods : []).map((p) => {
        const sess = p?.session || 'morning';
        const pIdx = Math.max(0, (p?.period || 1) - 1);
        const standardTime =
          sess === 'morning'
            ? OFFICIAL_MORNING_TIMES[pIdx] || p.time
            : OFFICIAL_AFTERNOON_TIMES[pIdx] || p.time;
        const shouldUpgrade = !p?.time || LEGACY_TIMETABLE_TIMES.has(p.time.trim());
        return {
          ...p,
          session: sess,
          time: shouldUpgrade ? standardTime : p.time,
        };
      }),
    }));
  }, []);

  // Timetable state with persistence (Sáng 4 tiết, Chiều 3 tiết, thêm/bớt tiết)
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.TIMETABLE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAfternoon = parsed.some((d: any) =>
            Array.isArray(d?.periods) && d.periods.some((p: any) => p?.session === 'afternoon')
          );
          if (hasAfternoon) {
            return parsed.map((d: any) => ({
              ...d,
              periods: (Array.isArray(d?.periods) ? d.periods : []).map((p: any) => {
                const sess = p?.session || 'morning';
                const pIdx = Math.max(0, (p?.period || 1) - 1);
                const standardTime =
                  sess === 'morning'
                    ? OFFICIAL_MORNING_TIMES[pIdx] || p.time
                    : OFFICIAL_AFTERNOON_TIMES[pIdx] || p.time;
                const shouldUpgrade = !p?.time || LEGACY_TIMETABLE_TIMES.has(String(p.time).trim());
                return {
                  ...p,
                  session: sess,
                  time: shouldUpgrade ? standardTime : p.time,
                };
              }),
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TIMETABLE;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  }, [timetable]);

  const updateTimetable = (newTimetable: TimetableEntry[]) => {
    setTimetable(newTimetable);
  };

  const updatePeriod = (
    day: string,
    periodNumber: number,
    data: Partial<TimetablePeriod>,
    session?: 'morning' | 'afternoon'
  ) => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const updatedPeriods = (d.periods || []).map((p) => {
            const matchesSession = !session || (p.session || 'morning') === session;
            if (p.period === periodNumber && matchesSession) {
              return { ...p, ...data };
            }
            return p;
          });
          return { ...d, periods: updatedPeriods };
        }
        return d;
      })
    );
  };

  const addPeriod = (
    day: string,
    session: 'morning' | 'afternoon',
    data: { subject: string; teacher: string; room: string; time?: string }
  ) => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const periodsList = Array.isArray(d.periods) ? d.periods : [];
          const sessionPeriods = periodsList.filter(
            (p) => (p.session || 'morning') === session
          );
          const newPeriodNum = sessionPeriods.length + 1;
          const defaultTime =
            session === 'morning'
              ? OFFICIAL_MORNING_TIMES[newPeriodNum - 1] || `Tiết ${newPeriodNum} sáng`
              : OFFICIAL_AFTERNOON_TIMES[newPeriodNum - 1] || `Tiết ${newPeriodNum} chiều`;

          const newPeriod: TimetablePeriod = {
            period: newPeriodNum,
            session,
            time: data.time || defaultTime,
            subject: data.subject || 'Môn học mới',
            teacher: data.teacher || 'Giáo viên phụ trách',
            room: data.room || 'P.12A7',
          };
          return { ...d, periods: [...periodsList, newPeriod] };
        }
        return d;
      })
    );
  };

  const deletePeriod = (
    day: string,
    session: 'morning' | 'afternoon',
    periodNumber: number
  ) => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          let removed = false;
          const filtered = (d.periods || []).filter((p) => {
            const pSession = p.session || 'morning';
            if (pSession === session && p.period === periodNumber && !removed) {
              removed = true;
              return false;
            }
            return true;
          });

          // Re-index periods in that session sequentially
          let morningIndex = 1;
          let afternoonIndex = 1;
          const reindexed = filtered.map((p) => {
            const pSession = p.session || 'morning';
            if (pSession === 'morning') {
              return { ...p, period: morningIndex++ };
            } else {
              return { ...p, period: afternoonIndex++ };
            }
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

  // Helper to reset all duty schedule items for a new week (status: 'pending', score: 10, checklist: all false)
  const buildFreshWeeklyDutySchedule = useCallback(
    (sourceItems: DutyScheduleItem[], weekNum: number): DutyScheduleItem[] => {
      const baseList =
        Array.isArray(sourceItems) && sourceItems.length > 0
          ? sourceItems
          : INITIAL_DUTY_SCHEDULE;
      const range = getWeekRangeByIndex(weekNum);
      return baseList.map((item) => ({
        ...item,
        weekNumber: weekNum,
        status: 'pending',
        score: 10,
        note: `Lịch trực nhật tuần mới (${range.rangeLabel}) — Tự động reset đầu tuần.`,
        checklist: (Array.isArray(item.checklist) ? item.checklist : []).map((task) => ({
          ...task,
          done: false,
        })),
      }));
    },
    []
  );

  // Phân lịch trực nhật 4 Tổ (Lớp phó Lao động & GVCN) - Tự động reset khi qua tuần mới
  const [dutySchedule, setDutySchedule] = useState<DutyScheduleItem[]>(() => {
    const lastDutyWeek = Number(safeGetLocal(STORAGE_KEYS.LAST_DUTY_WEEK) || '0');
    const saved = safeGetLocal(STORAGE_KEYS.DUTY_SCHEDULE);
    let parsedList: DutyScheduleItem[] = INITIAL_DUTY_SCHEDULE;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedList = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const needsWeeklyReset =
      lastDutyWeek !== realCalendarWeek ||
      parsedList.some((item) => item.weekNumber !== realCalendarWeek);
    if (needsWeeklyReset) {
      safeSetLocal(STORAGE_KEYS.LAST_DUTY_WEEK, String(realCalendarWeek));
      return buildFreshWeeklyDutySchedule(parsedList, realCalendarWeek);
    }
    return parsedList;
  });

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.DUTY_SCHEDULE, JSON.stringify(dutySchedule));
  }, [dutySchedule]);

  // Automatically reset dutySchedule whenever realCalendarWeek advances to a new week
  useEffect(() => {
    const lastDutyWeek = Number(safeGetLocal(STORAGE_KEYS.LAST_DUTY_WEEK) || '0');
    if (lastDutyWeek !== realCalendarWeek) {
      safeSetLocal(STORAGE_KEYS.LAST_DUTY_WEEK, String(realCalendarWeek));
      setDutySchedule((prev) => buildFreshWeeklyDutySchedule(prev, realCalendarWeek));
      const range = getWeekRangeByIndex(realCalendarWeek);
      setRecentAlerts((prev) => [
        `🧹 Bắt đầu tuần mới (${range.rangeLabel}): Hệ thống đã tự động reset Trực nhật & Vệ sinh của 4 Tổ về trạng thái "Chưa trực" (0/4 công việc).`,
        ...prev.slice(0, 8),
      ]);
    }
  }, [realCalendarWeek, buildFreshWeeklyDutySchedule]);

  const updateDutySchedule = (newSchedule: DutyScheduleItem[]) => {
    setDutySchedule(newSchedule);
  };

  const updateDutyItem = (id: string, itemData: Partial<DutyScheduleItem>) => {
    setDutySchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...itemData, weekNumber: currentWeek } : item))
    );
  };

  const addDutyItem = (itemData: Omit<DutyScheduleItem, 'id'>) => {
    const newItem: DutyScheduleItem = {
      ...itemData,
      weekNumber: currentWeek,
      id: `duty-${Date.now()}`,
    };
    setDutySchedule((prev) => [...prev, newItem]);
  };

  const deleteDutyItem = (id: string) => {
    setDutySchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const resetDutyScheduleForNewWeek = (targetWeek?: number) => {
    const wk = targetWeek || currentWeek || realCalendarWeek;
    safeSetLocal(STORAGE_KEYS.LAST_DUTY_WEEK, String(wk));
    setDutySchedule((prev) => buildFreshWeeklyDutySchedule(prev, wk));
  };

  const resetDutySchedule = () => {
    const fresh = buildFreshWeeklyDutySchedule(INITIAL_DUTY_SCHEDULE, currentWeek || realCalendarWeek);
    setDutySchedule(fresh);
    safeSetLocal(STORAGE_KEYS.DUTY_SCHEDULE, JSON.stringify(fresh));
  };

  // App & Teacher Configuration State with persistence
  const [appConfig, setAppConfig] = useState<ClassAppConfig>(() => {
    const saved = safeGetLocal(STORAGE_KEYS.APP_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return {
            ...INITIAL_APP_CONFIG,
            ...parsed,
            teacherName: formatTeacherDisplayName(parsed.teacherName || INITIAL_APP_CONFIG.teacherName),
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      ...INITIAL_APP_CONFIG,
      teacherName: formatTeacherDisplayName(INITIAL_APP_CONFIG.teacherName),
    };
  });

  const [isAppConfigModalOpen, setIsAppConfigModalOpen] = useState(false);

  useEffect(() => {
    safeSetLocal(STORAGE_KEYS.APP_CONFIG, JSON.stringify(appConfig));
  }, [appConfig]);

  const updateAppConfig = (config: Partial<ClassAppConfig>) => {
    setAppConfig((prev) => {
      const merged = { ...prev, ...config };
      return {
        ...merged,
        teacherName: formatTeacherDisplayName(merged.teacherName),
      };
    });
  };

  const resetAppConfig = () => {
    setAppConfig(INITIAL_APP_CONFIG);
    safeRemoveLocal(STORAGE_KEYS.APP_CONFIG);
  };

  const addDisciplineEntry = (entryData: Omit<StudentDisciplineEntry, 'id' | 'createdAt'>) => {
    const normDate = normalizeToSchoolDay(entryData.date || todayStr).date;
    const computedWeek = entryData.date ? getWeekIndexFromDate(normDate) : entryData.weekNumber;
    const newEntry: StudentDisciplineEntry = {
      ...entryData,
      date: normDate,
      weekNumber: computedWeek,
      id: `disc-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setDisciplineEntries((prev) => [newEntry, ...prev]);

    // Reverse-link to Daily Attendance if rule is Đi trễ (1), Vắng có phép (8), or Vắng không phép (9)
    if (entryData.ruleNumber === 1 || entryData.ruleNumber === 8 || entryData.ruleNumber === 9) {
      const mappedStatus: AttendanceStatus =
        entryData.ruleNumber === 1 ? 'late' : entryData.ruleNumber === 8 ? 'excused' : 'unexcused';
      setAllAttendanceDays((prev) => {
        const day = prev[normDate] || { date: normDate, records: {}, note: '' };
        return {
          ...prev,
          [normDate]: {
            ...day,
            records: {
              ...day.records,
              [entryData.studentId]: mappedStatus,
            },
          },
        };
      });
    }
  };

  const updateDisciplineEntry = (
    id: string,
    updated: Partial<StudentDisciplineEntry>
  ) => {
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
        return {
          ...prev,
          [normDate]: {
            ...day,
            records: {
              ...day.records,
              [target.studentId]: 'present',
            },
          },
        };
      });
    }
  };

  const addBonusPointEntry = (bonusData: Omit<BonusPointEntry, 'id' | 'createdAt'>) => {
    const normDate = normalizeToSchoolDay(bonusData.date || todayStr).date;
    const computedWeek = bonusData.date ? getWeekIndexFromDate(normDate) : bonusData.weekNumber;
    const newBonus: BonusPointEntry = {
      ...bonusData,
      date: normDate,
      weekNumber: computedWeek,
      id: `bon-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setBonusEntries((prev) => [newBonus, ...prev]);
  };

  const updateBonusPointEntry = (
    id: string,
    updated: Partial<BonusPointEntry>
  ) => {
    setBonusEntries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
  };

  const deleteBonusPointEntry = (id: string) => {
    setBonusEntries((prev) => prev.filter((b) => b.id !== id));
  };

  const setEmulationScoreAdjustment = (
    adjustmentData: Omit<EmulationScoreAdjustment, 'id' | 'createdAt'>
  ) => {
    const newEntry: EmulationScoreAdjustment = {
      ...adjustmentData,
      id: `adj-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setEmulationScoreAdjustments((prev) => {
      const filtered = prev.filter(
        (a) =>
          !(
            a.studentId === adjustmentData.studentId &&
            a.weekNumber === adjustmentData.weekNumber
          )
      );
      return [newEntry, ...filtered];
    });
  };

  const removeEmulationScoreAdjustment = (studentId: string, weekNumber: number) => {
    setEmulationScoreAdjustments((prev) =>
      prev.filter(
        (a) => !(a.studentId === studentId && a.weekNumber === weekNumber)
      )
    );
  };

  const resetWeeklyEmulationScores = (week?: number) => {
    const targetWeek = week !== undefined ? week : currentWeek;
    // Remove violations, bonuses, and manual adjustments in targetWeek (or advance baseline week so previous weeks don't carry over)
    setEmulationResetBaselineWeek(targetWeek);
    setDisciplineEntries((prev) =>
      prev.filter((d) => d.weekNumber !== targetWeek && !isDateInWeek(d.date, targetWeek))
    );
    setBonusEntries((prev) =>
      prev.filter((b) => b.weekNumber !== targetWeek && !isDateInWeek(b.date, targetWeek))
    );
    setEmulationScoreAdjustments((prev) =>
      prev.filter((a) => a.weekNumber !== targetWeek)
    );
    const range = getWeekRangeByIndex(targetWeek);
    setRecentAlerts((prev) => [
      `🔄 Đã reset điểm thi đua (${range.rangeLabel}) của toàn bộ 50 học sinh lớp 12A7 về 100 điểm chuẩn!`,
      ...prev.slice(0, 8),
    ]);
  };

  const getStudentWeeklyScore = (studentId: string, week?: number) => {
    const targetWeek = week !== undefined ? week : currentWeek;
    const student = students.find((s) => s.id === studentId);

    const matchesWeekScope = (entryWeek: number, entryDate: string) => {
      const effectiveWeek = entryWeek || getWeekIndexFromDate(entryDate);
      if (keepEmulationAcrossWeeks) {
        // Carry over / keep emulation points across weeks without auto-resetting on a new week
        return effectiveWeek >= emulationResetBaselineWeek && effectiveWeek <= targetWeek;
      }
      return effectiveWeek === targetWeek || isDateInWeek(entryDate, targetWeek);
    };

    const violations = disciplineEntries.filter(
      (d) => d.studentId === studentId && matchesWeekScope(d.weekNumber, d.date)
    );
    const bonuses = bonusEntries.filter(
      (b) =>
        (b.studentId === studentId || (!b.studentId && b.group === student?.group)) &&
        matchesWeekScope(b.weekNumber, b.date)
    );

    const initialPoints = 100;
    const deducted = violations.reduce((sum, v) => sum + v.pointsDeducted, 0);
    const bonus = bonuses.reduce((sum, b) => sum + b.pointsAdded, 0);
    const autoScore = Math.max(0, initialPoints - deducted + bonus);

    const adjustment = keepEmulationAcrossWeeks
      ? emulationScoreAdjustments
          .filter(
            (a) =>
              a.studentId === studentId &&
              a.weekNumber >= emulationResetBaselineWeek &&
              a.weekNumber <= targetWeek
          )
          .sort((a, b) => b.weekNumber - a.weekNumber)[0]
      : emulationScoreAdjustments.find(
          (a) => a.studentId === studentId && a.weekNumber === targetWeek
        );

    const total = adjustment !== undefined ? adjustment.adjustedScore : autoScore;

    let classification: 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu' = 'Xuất sắc';
    if (total >= 90) classification = 'Xuất sắc';
    else if (total >= 75) classification = 'Khá';
    else if (total >= 50) classification = 'Trung bình';
    else classification = 'Yếu';

    return {
      initialPoints,
      deducted,
      bonus,
      autoScore,
      total,
      isAdjustedByTeacher: !!adjustment,
      adjustment,
      violations,
      bonuses,
      classification,
    };
  };

  // Compute Automatic Weekly Emulation Summary (Tự động tổng kết thi đua từ Thứ 2 đến Thứ 6 hàng tuần)
  const getWeeklyEmulationSummary = (week?: number): WeeklyEmulationSummary => {
    const targetWeek = week !== undefined ? week : currentWeek;
    const weekRange = getWeekRangeByIndex(targetWeek);
    const fridayIso = weekRange.fridayDate;
    const dateRangeLabel = weekRange.rangeLabel; // "Từ ngày 26/10 đến 30/10"

    // Check if current date is after Friday or if Friday attendance is already logged
    const now = new Date();
    const todayDayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
    const [fy, fm, fd] = fridayIso.split('-').map(Number);
    const weekFriday = new Date(fy, fm - 1, fd, 23, 59, 59);
    const isWeekendOrPastFriday =
      targetWeek < currentWeek ||
      todayDayOfWeek === 6 ||
      todayDayOfWeek === 0 ||
      now > weekFriday ||
      !!allAttendanceDays[fridayIso];

    const allScores = students.map((stu) => ({
      student: stu,
      ...getStudentWeeklyScore(stu.id, targetWeek),
    }));

    const totalPoints = allScores.reduce((sum, item) => sum + item.total, 0);
    const classAvgScore =
      students.length > 0 ? Number((totalPoints / students.length).toFixed(1)) : 100;
    const perfectCount = allScores.filter((i) => i.total >= 100).length;
    const deductedCount = allScores.filter((i) => i.deducted > 0).length;

    const weekViolations = disciplineEntries.filter(
      (d) => d.weekNumber === targetWeek || isDateInWeek(d.date, targetWeek)
    );
    const weekBonuses = bonusEntries.filter(
      (b) => b.weekNumber === targetWeek || isDateInWeek(b.date, targetWeek)
    );

    // Group Rankings (Tổ 1..4)
    const rawGroups = [1, 2, 3, 4].map((g) => {
      const members = allScores.filter((i) => i.student.group === g);
      const avgScore =
        members.length > 0
          ? Number(
              (members.reduce((sum, m) => sum + m.total, 0) / members.length).toFixed(1)
            )
          : 100;
      const groupPerfect = members.filter((m) => m.total >= 100).length;
      const groupViolations = members.reduce((sum, m) => sum + m.violations.length, 0);
      return {
        group: g,
        avgScore,
        perfectCount: groupPerfect,
        totalCount: members.length,
        violationCount: groupViolations,
      };
    });

    const sortedGroups = [...rawGroups].sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      return a.violationCount - b.violationCount;
    });

    const flagTitles = [
      '🏆 Hạng Nhất - Cờ Đỏ Thi Đua Tuần',
      '🥈 Hạng Nhì - Tổ Tiên Tiến',
      '🥉 Hạng Ba - Tổ Nỗ Lực',
      '🌱 Hạng Tư - Cần Cố Gắng',
    ];

    const groupRankings = sortedGroups.map((g, idx) => ({
      ...g,
      rank: idx + 1,
      flagTitle: flagTitles[idx] || `Hạng ${idx + 1}`,
    }));

    const topStudents = [...allScores]
      .sort((a, b) => b.total - a.total || b.bonus - a.bonus)
      .slice(0, 10)
      .map((item) => ({
        student: item.student,
        total: item.total,
        bonus: item.bonus,
        deducted: item.deducted,
        classification: item.classification,
      }));

    const violatingStudents = allScores
      .filter((item) => item.deducted > 0)
      .sort((a, b) => b.deducted - a.deducted)
      .map((item) => ({
        student: item.student,
        total: item.total,
        deducted: item.deducted,
        violations: item.violations,
      }));

    return {
      weekNumber: targetWeek,
      dateRangeLabel,
      isAutoSummarized: isWeekendOrPastFriday,
      statusLabel: isWeekendOrPastFriday
        ? `Đã tự động tổng kết sau Thứ 6 (${weekRange.fridayShort})`
        : `Đang theo dõi (${weekRange.rangeLabel})`,
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

  // JSON Export & Import state and helpers
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  const getExportJsonPayload = (
    scope: 'all' | 'students' | 'attendance_discipline' = 'all'
  ): Record<string, any> => {
    const exportedAt = new Date().toISOString();
    const weeklySummary = getWeeklyEmulationSummary(currentWeek);

    if (scope === 'students') {
      return {
        meta: {
          title: `Dữ liệu Hồ sơ & Bảng điểm Tổng hợp 10 Môn - Lớp ${appConfig.className}`,
          schoolName: appConfig.schoolName,
          schoolYear: appConfig.schoolYear,
          homeroomTeacher: appConfig.teacherName,
          totalStudents: students.length,
          exportedAt,
          scope: 'students',
        },
        appConfig,
        students,
      };
    }

    if (scope === 'attendance_discipline') {
      return {
        meta: {
          title: `Dữ liệu Điểm danh (Thứ 2 - Thứ 6) & Thi đua Tuần - Lớp ${appConfig.className}`,
          schoolName: appConfig.schoolName,
          schoolYear: appConfig.schoolYear,
          homeroomTeacher: appConfig.teacherName,
          currentWeek,
          exportedAt,
          scope: 'attendance_discipline',
        },
        currentWeek,
        weeklyEmulationSummary: weeklySummary,
        allAttendanceDays,
        supplementaryAttendanceList,
        disciplineEntries,
        bonusEntries,
        emulationScoreAdjustments,
      };
    }

    return {
      meta: {
        title: `Toàn bộ Dữ liệu Hệ thống Quản lý Lớp ${appConfig.className}`,
        schoolName: appConfig.schoolName,
        schoolYear: appConfig.schoolYear,
        homeroomTeacher: appConfig.teacherName,
        totalStudents: students.length,
        currentWeek,
        exportedAt,
        version: '2.0',
        scope: 'all',
      },
      appConfig,
      currentWeek,
      weeklyEmulationSummary: weeklySummary,
      students,
      allAttendanceDays,
      supplementaryAttendanceList,
      disciplineEntries,
      bonusEntries,
      emulationScoreAdjustments,
      evaluations,
      announcements,
      timetable,
      dutySchedule,
      happyPosts,
      assignments,
    };
  };

  const downloadDataAsJson = (
    scope: 'all' | 'students' | 'attendance_discipline' = 'all'
  ): string => {
    const payload = getExportJsonPayload(scope);
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const dateTag = new Date().toISOString().split('T')[0];
    const fileName =
      scope === 'students'
        ? `Ho_So_Bang_Diem_50HS_12A7_${dateTag}.json`
        : scope === 'attendance_discipline'
        ? `Diem_Danh_Thi_Dua_12A7_Tuan_${currentWeek}_${dateTag}.json`
        : `Du_Lieu_Toan_Bo_Lop_12A7_THPT_Vinh_Loc_B_${dateTag}.json`;

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
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Nội dung file JSON không hợp lệ!' };
      }

      let restoredItems: string[] = [];

      if (parsed.appConfig && typeof parsed.appConfig === 'object') {
        setAppConfig((prev) => ({ ...prev, ...parsed.appConfig }));
        restoredItems.push('Cấu hình lớp');
      }
      if (Array.isArray(parsed.students) && parsed.students.length > 0) {
        setStudents(parsed.students.map((s: any, idx: number) => normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES)));
        restoredItems.push(`${parsed.students.length} Học sinh & Bảng điểm`);
      }
      if (parsed.allAttendanceDays && typeof parsed.allAttendanceDays === 'object') {
        setAllAttendanceDays(parsed.allAttendanceDays);
        restoredItems.push('Điểm danh');
      }
      if (Array.isArray(parsed.supplementaryAttendanceList)) {
        setSupplementaryAttendanceList(parsed.supplementaryAttendanceList);
      }
      if (Array.isArray(parsed.disciplineEntries)) {
        setDisciplineEntries(parsed.disciplineEntries);
        restoredItems.push('Thi đua tuần');
      }
      if (Array.isArray(parsed.bonusEntries)) {
        setBonusEntries(parsed.bonusEntries);
      }
      if (Array.isArray(parsed.emulationScoreAdjustments)) {
        setEmulationScoreAdjustments(parsed.emulationScoreAdjustments);
      }
      if (typeof parsed.currentWeek === 'number') {
        setCurrentWeek(parsed.currentWeek);
      }
      if (Array.isArray(parsed.evaluations)) {
        setEvaluations(parsed.evaluations);
        restoredItems.push('Nhận xét GVCN');
      }
      if (Array.isArray(parsed.announcements)) {
        setAnnouncements(parsed.announcements);
        restoredItems.push('Thông báo');
      }
      if (Array.isArray(parsed.timetable)) {
        setTimetable(parsed.timetable);
        restoredItems.push('Thời khóa biểu');
      }
      if (Array.isArray(parsed.dutySchedule)) {
        setDutySchedule(parsed.dutySchedule);
        restoredItems.push('Lịch trực nhật');
      }
      if (Array.isArray(parsed.happyPosts)) {
        setHappyPosts(parsed.happyPosts);
        restoredItems.push('Góc Hạnh Phúc');
      }

      if (restoredItems.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy trường dữ liệu hợp lệ (students, appConfig, allAttendanceDays...) trong file JSON.',
        };
      }

      return {
        success: true,
        message: `Đã nhập thành công dữ liệu từ JSON: ${restoredItems.join(', ')}!`,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Lỗi cú pháp JSON! Vui lòng kiểm tra lại định dạng file .json.',
      };
    }
  };

  const resetToHardcodedDefaultData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.ROLE && key !== STORAGE_KEYS.ACTIVE_STUDENT) {
        safeRemoveLocal(key);
      }
    });
    const defaultStudents = (INITIAL_STUDENTS || []).map((s, idx) =>
      normalizeStudentRecord(s, idx, DEFAULT_CADRE_ROLES)
    );
    const defaultAttendanceDays = {
      ...INITIAL_ALL_ATTENDANCE_DAYS,
      [todayStr]: INITIAL_ALL_ATTENDANCE_DAYS[todayStr] || {
        ...INITIAL_ATTENDANCE,
        date: todayStr,
      },
    };
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

    // Clear lastSyncedJsonRef so the reset data immediately syncs to server & cloud
    lastSyncedJsonRef.current = {};
  };

  // ============================================================================
  // CLOUD & MULTI-USER REAL-TIME SYNCHRONIZATION (Firestore + Shared Server API)
  // ============================================================================
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(null);
  const [firebaseUserName, setFirebaseUserName] = useState<string | null>(null);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState<boolean>(false);

  const lastSyncedJsonRef = useRef<Record<string, string>>({});
  const isInitialRemoteLoadedRef = useRef<boolean>(false);
  const lastServerTimestampRef = useRef<number>(0);

  const buildSectionPayload = useCallback(
    (sectionId: ClassroomSectionId): Record<string, any> => {
      switch (sectionId) {
        case 'config':
          return {
            appConfig,
            currentWeek,
            customCadreRoles,
            gradeBatches,
            activeGradeBatchId,
          };
        case 'students_g1':
          return { list: students.filter((s) => s.group === 1) };
        case 'students_g2':
          return { list: students.filter((s) => s.group === 2) };
        case 'students_g3':
          return { list: students.filter((s) => s.group === 3) };
        case 'students_g4':
          return {
            list: students.filter((s) => s.group !== 1 && s.group !== 2 && s.group !== 3),
          };
        case 'attendance':
          return { allAttendanceDays, supplementaryAttendanceList };
        case 'emulation':
          return { disciplineEntries, bonusEntries, emulationScoreAdjustments };
        case 'activities':
          return {
            evaluations,
            announcements,
            happyPosts,
            assignments,
            messages,
            appointments,
          };
        case 'schedule':
          return { timetable, dutySchedule };
      }
    },
    [
      appConfig,
      currentWeek,
      customCadreRoles,
      gradeBatches,
      activeGradeBatchId,
      students,
      allAttendanceDays,
      supplementaryAttendanceList,
      disciplineEntries,
      bonusEntries,
      emulationScoreAdjustments,
      evaluations,
      announcements,
      happyPosts,
      assignments,
      messages,
      appointments,
      timetable,
      dutySchedule,
    ]
  );

  // Initialize baseline hashes on first render so opening the app doesn't overwrite remote data before fetching
  if (Object.keys(lastSyncedJsonRef.current).length === 0) {
    for (const secId of ALL_SECTION_IDS) {
      lastSyncedJsonRef.current[secId] = JSON.stringify(
        sanitizePayloadForFirestore(buildSectionPayload(secId))
      );
    }
  }

  const applyRemoteSection = useCallback(
    (sectionId: ClassroomSectionId, rawPayload: Record<string, any>) => {
      if (!rawPayload || typeof rawPayload !== 'object') return;

      const incomingJson = JSON.stringify(sanitizePayloadForFirestore(rawPayload));
      if (lastSyncedJsonRef.current[sectionId] === incomingJson) {
        return; // Already up to date
      }

      if (sectionId === 'config') {
        const rawConfig =
          rawPayload.appConfig && typeof rawPayload.appConfig === 'object'
            ? { ...INITIAL_APP_CONFIG, ...rawPayload.appConfig }
            : INITIAL_APP_CONFIG;
        const nextAppConfig = {
          ...rawConfig,
          teacherName: formatTeacherDisplayName(rawConfig.teacherName),
        };
        const rawRemoteWeek =
          typeof rawPayload.currentWeek === 'number' && rawPayload.currentWeek > 0
            ? rawPayload.currentWeek
            : INITIAL_CURRENT_WEEK;
        // Always ensure currentWeek is at least the current real calendar week
        const nextWeek = Math.max(rawRemoteWeek, realCalendarWeek);
        const nextCustomRoles = Array.isArray(rawPayload.customCadreRoles)
          ? rawPayload.customCadreRoles
          : DEFAULT_CUSTOM_ROLES;
        const nextBatches =
          Array.isArray(rawPayload.gradeBatches) && rawPayload.gradeBatches.length > 0
            ? rawPayload.gradeBatches
            : INITIAL_GRADE_BATCHES;
        const nextActiveBatchId =
          typeof rawPayload.activeGradeBatchId === 'string' && rawPayload.activeGradeBatchId
            ? rawPayload.activeGradeBatchId
            : 'batch-hk1-current';
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(
          sanitizePayloadForFirestore({
            appConfig: nextAppConfig,
            currentWeek: nextWeek,
            customCadreRoles: nextCustomRoles,
            gradeBatches: nextBatches,
            activeGradeBatchId: nextActiveBatchId,
          })
        );
        setAppConfig(nextAppConfig);
        setCurrentWeekState(nextWeek);
        setCustomCadreRoles(nextCustomRoles);
        setGradeBatches(nextBatches);
        setActiveGradeBatchIdState(nextActiveBatchId);
        safeSetLocal(STORAGE_KEYS.CURRENT_WEEK, String(nextWeek));
      } else if (
        sectionId === 'students_g1' ||
        sectionId === 'students_g2' ||
        sectionId === 'students_g3' ||
        sectionId === 'students_g4'
      ) {
        if (Array.isArray(rawPayload.list)) {
          const targetGroup =
            sectionId === 'students_g1'
              ? 1
              : sectionId === 'students_g2'
              ? 2
              : sectionId === 'students_g3'
              ? 3
              : 4;
          const normalizedGroupList = rawPayload.list
            .map((s: any, idx: number) =>
              normalizeStudentRecord(
                s,
                typeof s?.stt === 'number' ? s.stt - 1 : idx,
                DEFAULT_CADRE_ROLES
              )
            )
            .sort((a: Student, b: Student) => a.stt - b.stt);
          lastSyncedJsonRef.current[sectionId] = JSON.stringify(
            sanitizePayloadForFirestore({ list: normalizedGroupList })
          );
          setStudents((prev) => {
            const others = prev.filter((st) =>
              targetGroup === 4
                ? st.group === 1 || st.group === 2 || st.group === 3
                : st.group !== targetGroup
            );
            return [...others, ...normalizedGroupList].sort((a, b) => a.stt - b.stt);
          });
        }
      } else if (sectionId === 'attendance') {
        const rawAttendanceDays =
          rawPayload.allAttendanceDays && typeof rawPayload.allAttendanceDays === 'object'
            ? rawPayload.allAttendanceDays
            : {};
        const nextAttendanceDays = sanitizeAttendanceDaysMap(rawAttendanceDays, todayStr);
        const nextSupp = Array.isArray(rawPayload.supplementaryAttendanceList)
          ? rawPayload.supplementaryAttendanceList
          : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(
          sanitizePayloadForFirestore({
            allAttendanceDays: nextAttendanceDays,
            supplementaryAttendanceList: nextSupp,
          })
        );
        setAllAttendanceDays(nextAttendanceDays);
        setSupplementaryAttendanceList(nextSupp);
      } else if (sectionId === 'emulation') {
        const nextDisc = Array.isArray(rawPayload.disciplineEntries)
          ? rawPayload.disciplineEntries
          : [];
        const nextBonus = Array.isArray(rawPayload.bonusEntries) ? rawPayload.bonusEntries : [];
        const nextAdj = Array.isArray(rawPayload.emulationScoreAdjustments)
          ? rawPayload.emulationScoreAdjustments
          : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(
          sanitizePayloadForFirestore({
            disciplineEntries: nextDisc,
            bonusEntries: nextBonus,
            emulationScoreAdjustments: nextAdj,
          })
        );
        setDisciplineEntries(nextDisc);
        setBonusEntries(nextBonus);
        setEmulationScoreAdjustments(nextAdj);
      } else if (sectionId === 'activities') {
        const nextEvals = Array.isArray(rawPayload.evaluations) ? rawPayload.evaluations : [];
        const nextAnn = Array.isArray(rawPayload.announcements) ? rawPayload.announcements : [];
        const nextHappy = Array.isArray(rawPayload.happyPosts) ? rawPayload.happyPosts : [];
        const nextAss = Array.isArray(rawPayload.assignments) ? rawPayload.assignments : [];
        const nextMsgs =
          rawPayload.messages && typeof rawPayload.messages === 'object'
            ? rawPayload.messages
            : {};
        const nextAppts = Array.isArray(rawPayload.appointments) ? rawPayload.appointments : [];
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(
          sanitizePayloadForFirestore({
            evaluations: nextEvals,
            announcements: nextAnn,
            happyPosts: nextHappy,
            assignments: nextAss,
            messages: nextMsgs,
            appointments: nextAppts,
          })
        );
        setEvaluations(nextEvals);
        setAnnouncements(nextAnn);
        setHappyPosts(nextHappy);
        setAssignments(nextAss);
        setMessages(nextMsgs);
        setAppointments(nextAppts);
      } else if (sectionId === 'schedule') {
        const rawTimetable = Array.isArray(rawPayload.timetable) ? rawPayload.timetable : [];
        const nextTimetable = normalizeTimetablePeriodTimes(rawTimetable);
        const rawDuty = Array.isArray(rawPayload.dutySchedule) ? rawPayload.dutySchedule : [];
        // If remote dutySchedule is from an older week, automatically reset it for the new week
        const isStaleDutyWeek =
          rawDuty.length > 0 && rawDuty.some((item: any) => item.weekNumber !== realCalendarWeek);
        const nextDuty = isStaleDutyWeek
          ? buildFreshWeeklyDutySchedule(rawDuty, realCalendarWeek)
          : rawDuty;
        lastSyncedJsonRef.current[sectionId] = JSON.stringify(
          sanitizePayloadForFirestore({
            timetable: nextTimetable,
            dutySchedule: nextDuty,
          })
        );
        setTimetable(nextTimetable);
        setDutySchedule(nextDuty);
      }

      setLastSyncedAt(
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      );
      setCloudSyncStatus('synced');
    },
    [normalizeTimetablePeriodTimes, realCalendarWeek, sanitizeAttendanceDaysMap, todayStr, buildFreshWeeklyDutySchedule]
  );

  const syncAllToCloudNow = useCallback(async () => {
    setCloudSyncStatus('syncing');
    try {
      for (const secId of ALL_SECTION_IDS) {
        const payload = buildSectionPayload(secId);
        const cleanJson = JSON.stringify(sanitizePayloadForFirestore(payload));
        lastSyncedJsonRef.current[secId] = cleanJson;
        const serverTs = await saveClassroomSection(secId, payload, role, appConfig);
        if (serverTs > lastServerTimestampRef.current) {
          lastServerTimestampRef.current = serverTs;
        }
      }
      setLastSyncedAt(
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      );
      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Manual cloud sync error:', err);
      setCloudSyncStatus('error');
    }
  }, [buildSectionPayload, role, appConfig]);

  // 1. Track Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUserEmail(user.email || null);
        setFirebaseUserName(user.displayName || user.email || 'Người dùng');
        setIsFirebaseAuthReady(true);
        try {
          await ensureMasterClassroomDoc({
            className: appConfig.className,
            schoolName: appConfig.schoolName,
            teacherName: appConfig.teacherName,
          });
        } catch (err) {
          console.warn('Master classroom init warning:', err);
        }
      } else {
        setFirebaseUserEmail(null);
        setFirebaseUserName(null);
        setIsFirebaseAuthReady(true);
      }
    });
    return () => unsubAuth();
  }, [appConfig.className, appConfig.schoolName, appConfig.teacherName]);

  // 2. Attach Firestore real-time listeners for all roles (GVCN, Học sinh, Phụ huynh)
  useEffect(() => {
    const unsubFirestore = subscribeToClassroomSections(
      (sectionId, payload) => {
        applyRemoteSection(sectionId, payload);
      },
      (status) => {
        setCloudSyncStatus(status);
      }
    );
    return () => unsubFirestore();
  }, [applyRemoteSection]);

  // 3. Real-time Server-Sent Events (SSE) + Polling & Visibility Refresh so ALL devices (GV, HS, PH) stay 100% in sync immediately
  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;

    const applyIncomingSectionsMap = (sectionsMap: Record<string, any>, updatedAt?: number) => {
      if (typeof updatedAt === 'number' && updatedAt > lastServerTimestampRef.current) {
        lastServerTimestampRef.current = updatedAt;
      }
      const keys = Object.keys(sectionsMap) as ClassroomSectionId[];
      for (const secId of keys) {
        const secObj = sectionsMap[secId];
        if (secObj && secObj.payload) {
          if (secObj.clientId !== CLIENT_INSTANCE_ID) {
            applyRemoteSection(secId, secObj.payload);
          }
        }
      }
    };

    const fetchServerSharedState = async (isInitial: boolean) => {
      try {
        const res = await fetch(
          `/api/shared-state?since=${isInitial ? 0 : lastServerTimestampRef.current}&_t=${Date.now()}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (data.hasUpdates && data.sections && typeof data.sections === 'object') {
          const sectionKeys = Object.keys(data.sections) as ClassroomSectionId[];
          if (sectionKeys.length > 0) {
            applyIncomingSectionsMap(data.sections, data.updatedAt);
            // If initial load and some sections are missing on server, seed the missing sections only
            if (isInitial) {
              for (const secId of ALL_SECTION_IDS) {
                if (!data.sections[secId]) {
                  const payload = buildSectionPayload(secId);
                  const serverTs = await saveClassroomSection(secId, payload, role, appConfig);
                  if (serverTs > lastServerTimestampRef.current) {
                    lastServerTimestampRef.current = serverTs;
                  }
                }
              }
            }
          } else if (isInitial) {
            // Seed server state on initial boot if server has no sections yet
            for (const secId of ALL_SECTION_IDS) {
              const payload = buildSectionPayload(secId);
              const serverTs = await saveClassroomSection(secId, payload, role, appConfig);
              if (serverTs > lastServerTimestampRef.current) {
                lastServerTimestampRef.current = serverTs;
              }
            }
          }
        }
        if (isInitial) {
          isInitialRemoteLoadedRef.current = true;
        }
      } catch (err) {
        if (isInitial) {
          isInitialRemoteLoadedRef.current = true;
        }
      }
    };

    // Initial full state fetch
    fetchServerSharedState(true);

    // Connect real-time SSE stream for instant cross-device updates between GV, HS, and PH
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource('/api/shared-state/stream');
        eventSource.onmessage = (evt) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(evt.data);
            if ((msg.type === 'init' || msg.type === 'update' || msg.type === 'batch_update') && msg.sections) {
              applyIncomingSectionsMap(msg.sections, msg.updatedAt);
              if (msg.type === 'init') {
                isInitialRemoteLoadedRef.current = true;
              }
            } else if (msg.type === 'section_update' && msg.sectionId && msg.payload) {
              if (typeof msg.updatedAt === 'number' && msg.updatedAt > lastServerTimestampRef.current) {
                lastServerTimestampRef.current = msg.updatedAt;
              }
              if (msg.clientId !== CLIENT_INSTANCE_ID) {
                applyRemoteSection(msg.sectionId as ClassroomSectionId, msg.payload);
              }
            }
          } catch (e) {
            // Ignore malformed SSE message
          }
        };
      } catch (e) {
        // Fallback to polling
      }
    }

    // Fast polling fallback (every 2 seconds) + focus/visibility listener for mobile browsers
    const intervalId = window.setInterval(() => {
      fetchServerSharedState(false);
    }, 2000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchServerSharedState(false);
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [applyRemoteSection]);

  // 4. Automatically push any modified section to Server Shared State & Cloud Firestore
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
            if (serverTs > lastServerTimestampRef.current) {
              lastServerTimestampRef.current = serverTs;
            }
            setLastSyncedAt(
              new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            );
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
    try {
      await signOutFirebaseUser();
    } catch (err) {
      console.warn('Google sign-out error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isTeacherAuthenticated,
        authenticateTeacher,
        logoutTeacher,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        requestTeacherAccess,
        activeStudentId,
        setActiveStudentId,
        currentStudent,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        assignStudentCadreRole,
        customCadreRoles,
        addCustomCadreRole,
        removeCustomCadreRole,
        viewDeviceMode,
        setViewDeviceMode,
        uiDensity,
        setUiDensity,
        currentDateAttendance,
        selectedAttendanceDate,
        setSelectedAttendanceDate,
        updateAttendanceStatus,
        markAllPresent,
        resetDateAttendance,
        saveAttendanceNote,
        allAttendanceDays,
        saveDateAttendance,
        scanQRAttendance,
        supplementaryAttendanceList,
        addSupplementaryAttendance,
        deleteSupplementaryAttendance,
        assignments,
        addAssignment,
        submitAssignment,
        gradeSubmission,
        updateSubjectScore,
        updateConduct,
        importExcelScores,
        gradeBatches,
        activeGradeBatchId,
        setActiveGradeBatchId,
        createGradeBatch,
        deleteGradeBatch,
        clearAllGrades,
        clearStudentGrades,
        restoreDefaultGrades,
        evaluations,
        addEvaluation,
        updateEvaluation,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        messages,
        sendMessage,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        happyPosts,
        addHappyPost,
        updateHappyPost,
        deleteHappyPost,
        deletePostComment,
        toggleLikePost,
        addPostComment,
        postMonthlyBirthdayWishes,
        timetable,
        updateTimetable,
        updatePeriod,
        addPeriod,
        deletePeriod,
        resetTimetable,
        dutySchedule,
        updateDutySchedule,
        updateDutyItem,
        addDutyItem,
        deleteDutyItem,
        resetDutySchedule,
        resetDutyScheduleForNewWeek,
        appConfig,
        updateAppConfig,
        resetAppConfig,
        isAppConfigModalOpen,
        setIsAppConfigModalOpen,
        currentWeek,
        setCurrentWeek,
        disciplineEntries,
        bonusEntries,
        emulationScoreAdjustments,
        addDisciplineEntry,
        updateDisciplineEntry,
        deleteDisciplineEntry,
        addBonusPointEntry,
        updateBonusPointEntry,
        deleteBonusPointEntry,
        setEmulationScoreAdjustment,
        removeEmulationScoreAdjustment,
        keepEmulationAcrossWeeks,
        setKeepEmulationAcrossWeeks,
        resetWeeklyEmulationScores,
        getStudentWeeklyScore,
        getWeeklyEmulationSummary,
        triggerAutoWeeklySummary,
        recentAlerts,
        clearAlerts,
        isStudentUnlocked,
        unlockStudent,
        lockStudent,
        setStudentPin,
        removeStudentPin,
        resetStudentPinByTeacher,
        resetAllStudentPinsByTeacher,
        isJsonModalOpen,
        setIsJsonModalOpen,
        getExportJsonPayload,
        downloadDataAsJson,
        importDataFromJson,
        resetToHardcodedDefaultData,
        cloudSyncStatus,
        lastSyncedAt,
        firebaseUserEmail,
        firebaseUserName,
        loginWithGoogleCloud,
        logoutGoogleCloud,
        syncAllToCloudNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
