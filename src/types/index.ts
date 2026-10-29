export type Role = 'teacher' | 'student' | 'parent';

export type StudentCadreRole =
  | 'Lớp trưởng'
  | 'Lớp phó học tập'
  | 'Lớp phó kỉ luật'
  | 'Bí thư'
  | 'Lớp phó lao động'
  | 'Tổ trưởng'
  | 'Học sinh';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface Student {
  id: string;
  stt: number;
  code: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  birthday: string;
  birthPlace: string;
  ethnicity: string;
  religion: string;
  address: string;
  phone: string;
  email: string;
  avatar: string;
  group: number; // Tổ 1, 2, 3, 4
  classRole?: StudentCadreRole; // Vai trò: Lớp trưởng, Lớp phó học tập, Lớp phó kỉ luật, Bí thư, Lớp phó lao động, Tổ trưởng, Học sinh
  pinCode?: string; // Mật khẩu / Mã PIN bảo vệ hồ sơ & lịch sử câu hỏi Gia sư AI
  
  // Parents info
  parentFatherName: string;
  parentFatherPhone: string;
  parentFatherJob: string;
  parentMotherName: string;
  parentMotherPhone: string;
  parentMotherJob: string;
  primaryParentName: string;
  primaryParentPhone: string;
  familyCondition: string;
  livingWith: string;
  birthOrder: string;

  // Academic & High School Exam
  examSubject1: string; // Môn thi 1 (Lý, Hóa, Sử)
  examSubject2: string; // Môn thi 2 (Hóa, Anh, Sử)
  dreamCareer: string;
  strengths: string;
  weaknesses: string;
  hobbies: string;
  wishedTeacher: string;
  wishedClassmates: string;
  pastRoles: string[];
  awards: string[];
  disciplines: string[];

  // Grade 11 Baseline
  gpaPrevYear: number;
  conductPrevYear: string;
  academicRankPrevYear: string;
  titlePrevYear: string;

  // Grade 12 Current Scores
  scores: {
    van: SubjectScore;
    toan: SubjectScore;
    anh: SubjectScore;
    ly: SubjectScore;
    hoa: SubjectScore;
    su: SubjectScore;
    gdktpl: SubjectScore;
    tin: SubjectScore;
    gddp: SubjectScore;
    gdqp: SubjectScore;
  };
  currentGpa: number;
  currentConduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
  currentClassification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt';
  
  // Stats
  attendanceStats: {
    present: number;
    excused: number;
    unexcused: number;
    late: number;
    rate: number;
  };
  activityPoints: number;
}

export interface SubjectScore {
  subjectName: string;
  regular: number[];
  midterm: number;
  final: number;
  avg: number;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // studentId -> status
  note?: string;
  checkedBy?: string;
}

export interface SupplementaryAttendanceEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  group: number;
  date: string; // YYYY-MM-DD
  session?: 'morning' | 'afternoon' | 'all_day';
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string; // Lý do điểm danh bổ sung
  note?: string; // Ghi chú chi tiết
  recordedBy: string; // 'Thầy Trương Xuân Hòa (GVCN)' | 'Lớp trưởng'
  createdAt: string; // YYYY-MM-DD HH:mm
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  targetGroup: 'all' | 'Tổ 1' | 'Tổ 2' | 'Tổ 3' | 'Tổ 4';
  attachments: {
    name: string;
    type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'link';
    size?: string;
    url?: string;
  }[];
  createdAt: string;
  submissions: Record<
    string,
    {
      studentId: string;
      studentName: string;
      submittedAt: string;
      content: string;
      attachments?: string[];
      grade?: number;
      feedback?: string;
      status: 'submitted' | 'graded';
    }
  >;
}

export interface EvaluationComment {
  id: string;
  studentId: string;
  studentName: string;
  period: 'Tuần' | 'Tháng' | 'Học kỳ I' | 'Học kỳ II';
  periodLabel: string;
  academic: string;
  awareness: string;
  skills: string;
  attitude: string;
  strengths: string;
  improvements: string;
  teacherNote: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  type: 'class' | 'urgent' | 'exam' | 'parent_meeting' | 'activity' | 'daily_homework' | 'cadre';
  targetAudience?: 'all' | 'cadre' | 'students' | 'parents';
  content: string;
  author: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
}

export interface ClassAppConfig {
  className: string;
  schoolName: string;
  schoolYear: string;
  roomNumber: string;
  slogan: string;
  motto: string;
  targetGoal: string;
  teacherName: string;
  teacherTitle: string;
  teacherSubject: string;
  teacherPhone: string;
  teacherEmail: string;
  teacherZalo: string;
  teacherAvatar: string;
  teacherMessage: string;
}

export interface ChatMessage {
  id: string;
  studentId: string;
  sender: 'teacher' | 'parent';
  senderName: string;
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  parentName: string;
  studentName: string;
  date: string;
  time: string;
  purpose: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export interface HappyPost {
  id: string;
  category: 'good_deed' | 'gratitude' | 'birthday' | 'spotlight' | 'memory' | 'album';
  title: string;
  content: string;
  authorName: string;
  authorRole: 'teacher' | 'student' | 'parent';
  likes: number;
  likedBy: string[];
  comments: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DutyScheduleItem {
  id: string;
  group: string; // 'Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Cả Lớp'
  day: string; // 'Thứ Hai', 'Thứ Ba', 'Thứ Ba & Thứ Năm', ...
  task: string;
  leaderName?: string; // Tên tổ trưởng phụ trách
  assignedBy?: string; // 'Trần Anh Khoa (Lớp phó Lao động)'
  status?: 'pending' | 'in_progress' | 'completed';
  score?: number; // Điểm trực nhật (0 - 10)
  note?: string; // Đánh giá của Lớp phó lao động
  date?: string;
  assignedMembers?: string[]; // Danh sách thành viên cụ thể trong tổ được phân công nhiệm vụ
  shift?: 'morning' | 'afternoon' | 'all_day'; // Ca sáng trước 6h45 / Ca chiều sau tiết 3 / Cả ngày
  weekNumber?: number; // Tuần học (ví dụ: tuần 6)
  criteriaScores?: {
    boardAndDesk: number; // Lau bảng & bàn GV (tối đa 2.0đ)
    floorClean: number; // Sàn lớp sạch sẽ (tối đa 3.0đ)
    desksOrder: number; // Hộc bàn & sắp xếp bàn ghế (tối đa 2.0đ)
    trashDisposal: number; // Đổ rác đúng nơi quy định (tối đa 1.5đ)
    powerAndWindows: number; // Tắt quạt đèn & đóng cửa sổ (tối đa 1.5đ)
  };
  checklist?: {
    id: string;
    label: string;
    done: boolean;
  }[];
}

export interface TimetablePeriod {
  id?: string;
  period: number; // 1, 2, 3, 4, ...
  session?: 'morning' | 'afternoon'; // 'morning' = Buổi sáng, 'afternoon' = Buổi chiều
  time?: string; // e.g. 07:00 - 07:45
  subject: string;
  teacher: string;
  room: string;
}

export interface TimetableEntry {
  day: string; // 'Thứ Hai', 'Thứ Ba', ...
  periods: TimetablePeriod[];
}

export interface StudentDisciplineEntry {
  id: string;
  studentId: string;
  studentName: string;
  group: number;
  weekNumber: number; // e.g. 1, 2, ... 6
  date: string; // YYYY-MM-DD
  ruleNumber: number;
  violationText: string;
  level: 'Mức độ I' | 'Mức độ II' | 'Mức độ III';
  pointsDeducted: number;
  note?: string;
  recordedBy: string; // 'Thầy Trương Xuân Hòa (GVCN)' | 'Lớp phó Kỉ luật' | 'Tổ trưởng'
  createdAt: string;
}

export interface BonusPointEntry {
  id: string;
  studentId?: string; // If undefined, applies to group
  studentName?: string;
  group?: number;
  weekNumber: number;
  date: string;
  reason: string;
  pointsAdded: number;
  recordedBy: string;
  createdAt: string;
}

export interface EmulationScoreAdjustment {
  id: string;
  studentId: string;
  studentName: string;
  group: number;
  weekNumber: number;
  adjustedScore: number; // Điểm GVCN sửa (0 - 120)
  autoCalculatedScore: number; // Điểm tính toán gốc từ hệ thống
  reason: string; // Lý do sửa điểm
  adjustedBy: string; // Người sửa (Thầy Trương Xuân Hòa - GVCN)
  createdAt: string;
}

