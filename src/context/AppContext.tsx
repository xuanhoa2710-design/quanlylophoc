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

  // Grades & Excel Import
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
    }>
  ) => { successCount: number; message: string };

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
  addDisciplineEntry: (entry: Omit
