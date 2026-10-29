import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimetableEntry, TimetablePeriod, DutyScheduleItem } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Edit2,
  Plus,
  RotateCcw,
  Save,
  X,
  CheckCircle2,
  School,
  Sun,
  Sunset,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Info,
  Star,
  UserCheck,
  Check,
} from 'lucide-react';

export interface TeacherSubjectMapping {
  teacher: string;
  role: string;
  subjects: string[];
  avatarColor: string;
  room?: string;
}

export const CLASS_12A7_TEACHERS: TeacherSubjectMapping[] = [
  {
    teacher: 'Thầy Trương Xuân Hòa',
    role: 'Giáo viên Chủ nhiệm (GVCN)',
    subjects: ['Hóa học', 'HĐTN 1', 'HĐTN 2', 'HĐTN 3', 'SHDC', 'STEM'],
    avatarColor: 'bg-blue-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Thầy Hồ Quốc Thanh',
    role: 'Giáo viên bộ môn',
    subjects: ['Toán học'],
    avatarColor: 'bg-indigo-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Cô Đinh Thị Đào',
    role: 'Giáo viên bộ môn',
    subjects: ['Ngữ văn', 'GDĐP (Giáo dục địa phương)'],
    avatarColor: 'bg-rose-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Cô Ngô Thị Thảo',
    role: 'Giáo viên bộ môn',
    subjects: ['Tiếng Anh'],
    avatarColor: 'bg-emerald-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Thầy Nguyễn Văn Tèo',
    role: 'Giáo viên bộ môn',
    subjects: ['Vật lý'],
    avatarColor: 'bg-amber-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Thầy Trịnh Ngọc Thiện',
    role: 'Giáo viên bộ môn',
    subjects: ['Lịch sử'],
    avatarColor: 'bg-orange-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Cô Hồ Thị Vân Anh',
    role: 'Giáo viên bộ môn',
    subjects: ['GDKT-PL (Kinh tế & Pháp luật)'],
    avatarColor: 'bg-teal-600',
    room: 'P.12A7',
  },
  {
    teacher: 'Thầy Nguyễn Hữu Nhân',
    role: 'Giáo viên bộ môn',
    subjects: ['Giáo dục thể chất (GDTC)'],
    avatarColor: 'bg-cyan-600',
    room: 'Sân đa năng',
  },
  {
    teacher: 'Cô Đinh Thị Liên',
    role: 'Giáo viên bộ môn',
    subjects: ['Giáo dục Quốc phòng (GDQP)'],
    avatarColor: 'bg-green-700',
    room: 'Sân trường / P.12A7',
  },
  {
    teacher: 'Cô Tạ Thị Tình',
    role: 'Giáo viên bộ môn',
    subjects: ['Tin học'],
    avatarColor: 'bg-purple-600',
    room: 'Phòng Tin học',
  },
  {
    teacher: 'Giáo viên Bản ngữ',
    role: 'Giáo viên phối hợp liên kết',
    subjects: ['Tiếng Anh bản ngữ'],
    avatarColor: 'bg-pink-600',
    room: 'P.12A7',
  },
];

export const getTeacherForSubject = (subjectName: string): string => {
  const s = subjectName.toLowerCase().trim();
  if (!s) return '';
  if (s.includes('hóa')) return 'Thầy Trương Xuân Hòa';
  if (s.includes('hđtn') || s.includes('tnhn') || s.includes('trải nghiệm') || s.includes('shdc') || s.includes('chào cờ') || s.includes('sinh hoạt')) {
    return 'Thầy Trương Xuân Hòa (GVCN)';
  }
  if (s.includes('stem')) return 'Thầy Trương Xuân Hòa & Tổ STEM';
  if (s.includes('bản ngữ')) return 'Giáo viên Bản ngữ';
  if (s.includes('anh') || s.includes('tiếng anh')) return 'Cô Ngô Thị Thảo';
  if (s.includes('toán')) return 'Thầy Hồ Quốc Thanh';
  if (s.includes('văn') || s.includes('gdđp') || s.includes('địa phương')) return 'Cô Đinh Thị Đào';
  if (s.includes('lý') || s.includes('vật lý') || s.includes('vật lí')) return 'Thầy Nguyễn Văn Tèo';
  if (s.includes('sử') || s.includes('lịch sử')) return 'Thầy Trịnh Ngọc Thiện';
  if (s.includes('ktpl') || s.includes('kinh tế') || s.includes('pháp luật')) return 'Cô Hồ Thị Vân Anh';
  if (s.includes('thể chất') || s.includes('gdtc') || s.includes('thể dục')) return 'Thầy Nguyễn Hữu Nhân';
  if (s.includes('quốc phòng') || s.includes('gdqp')) return 'Cô Đinh Thị Liên';
  if (s.includes('tin') || s.includes('tin học')) return 'Cô Tạ Thị Tình';
  return '';
};

const COMMON_SUBJECTS = [
  'SHDC (Chào cờ & Sinh hoạt dưới cờ)',
  'HĐTN 1 (Hoạt động trải nghiệm)',
  'HĐTN 2 (Hoạt động trải nghiệm)',
  'HĐTN 3 (Sinh hoạt lớp & HĐTN)',
  'Hóa học',
  'Ngữ văn',
  'GDĐP (Giáo dục địa phương)',
  'Toán học',
  'Tiếng Anh',
  'Vật lý',
  'Lịch sử',
  'GDKT-PL (Kinh tế & Pháp luật)',
  'Tin học',
  'Giáo dục thể chất (GDTC)',
  'Giáo dục Quốc phòng (GDQP)',
  'STEM',
  'Tiếng Anh bản ngữ',
];

const DEFAULT_DUTY_SCHEDULE = [
  { group: 'Tổ 1', day: 'Thứ Hai', task: 'Kê bàn ghế chào cờ, lau bảng, đổ rác đầu tuần' },
  { group: 'Tổ 2', day: 'Thứ Ba & Thứ Năm', task: 'Vệ sinh phòng học, chuẩn bị khăn lau bảng, phấn/bút viết' },
  { group: 'Tổ 3', day: 'Thứ Tư', task: 'Kiểm tra quạt đèn, tưới cây xanh hành lang lớp' },
  { group: 'Tổ 4', day: 'Thứ Sáu', task: 'Tổng vệ sinh cuối tuần, khóa cửa sổ và kiểm kê thiết bị lớp' },
];

const STANDARD_TIMES = {
  morning: [
    '07:25 - 08:10',
    '08:15 - 09:00',
    '09:35 - 10:20',
    '10:25 - 11:10',
    '11:15 - 12:00',
    '12:05 - 12:50',
  ],
  afternoon: [
    '13:15 - 14:00',
    '14:05 - 14:50',
    '15:15 - 16:00',
    '16:05 - 16:50',
    '16:55 - 17:40',
  ],
};

export const TimetableView: React.FC = () => {
  const {
    role,
    setRole,
    isTeacherAuthenticated,
    students,
    currentStudent,
    setActiveStudentId,
    timetable,
    updatePeriod,
    addPeriod,
    deletePeriod,
    updateTimetable,
    resetTimetable,
    appConfig,
    dutySchedule,
    updateDutySchedule,
    updateDutyItem,
    addDutyItem,
    deleteDutyItem,
    resetDutySchedule,
  } = useApp();

  const isTeacher = role === 'teacher' && isTeacherAuthenticated;
  const laborCadreStudent =
    (students || []).find((s) => s.classRole === 'Lớp phó lao động') ||
    (students || []).find((s) => s.id === 'hs-17') ||
    (students || []).find((s) => s.id === 'hs-21') ||
    students?.[0];
  const isLaborCadre =
    currentStudent?.classRole === 'Lớp phó lao động' ||
    (laborCadreStudent && currentStudent?.id === laborCadreStudent.id);
  const canManageDuty = isTeacher || isLaborCadre;

  const [selectedDay, setSelectedDay] = useState<string>('Thứ Hai');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'duty'>('day');

  // Duty Schedule modals & edit state
  const [isEditDutyModalOpen, setIsEditDutyModalOpen] = useState(false);
  const [isAddDutyModalOpen, setIsAddDutyModalOpen] = useState(false);
  const [editingDutyItem, setEditingDutyItem] = useState<DutyScheduleItem | null>(null);
  const [evaluatingDutyItem, setEvaluatingDutyItem] = useState<DutyScheduleItem | null>(null);
  const [tempDuty, setTempDuty] = useState<DutyScheduleItem[]>([]);

  // New Duty Form state
  const [newDutyForm, setNewDutyForm] = useState<{
    group: string;
    day: string;
    task: string;
    leaderName: string;
    score: number;
    status: 'pending' | 'in_progress' | 'completed';
    note: string;
  }>({
    group: 'Tổ 1',
    day: 'Thứ Hai',
    task: 'Kê bàn ghế chào cờ, lau bảng sạch trước 6h45, kiểm tra khăn lau phấn, đổ rác',
    leaderName: 'Nguyễn Hoàng Khang (Tổ trưởng)',
    score: 10,
    status: 'pending',
    note: 'Lớp phó lao động kiểm tra đầu giờ và sau giờ tan học.',
  });

  // Modals state
  const [isEditDayModalOpen, setIsEditDayModalOpen] = useState(false);
  const [isAddPeriodModalOpen, setIsAddPeriodModalOpen] = useState(false);
  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [editDay, setEditDay] = useState<string>('Thứ Hai');
  const [tempDayPeriods, setTempDayPeriods] = useState<TimetablePeriod[]>([]);

  // Quick Single Period Edit
  const [editingPeriodData, setEditingPeriodData] = useState<{
    day: string;
    session: 'morning' | 'afternoon';
    period: number;
    subject: string;
    teacher: string;
    room: string;
    time: string;
  } | null>(null);

  // New Period Form state
  const [newPeriodForm, setNewPeriodForm] = useState<{
    day: string;
    session: 'morning' | 'afternoon';
    subject: string;
    teacher: string;
    room: string;
    time: string;
  }>({
    day: 'Thứ Hai',
    session: 'morning',
    subject: '',
    teacher: appConfig.teacherName,
    room: appConfig.roomNumber,
    time: '',
  });

  // Confirm delete modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    day: string;
    session: 'morning' | 'afternoon';
    period: number;
    subject: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Full Day Edit Modal
  const handleOpenEditDay = (day: string) => {
    setEditDay(day);
    const dayData = timetable.find((t) => t.day === day);
    if (dayData) {
      setTempDayPeriods(JSON.parse(JSON.stringify(dayData.periods)));
    } else {
      setTempDayPeriods([]);
    }
    setIsEditDayModalOpen(true);
  };

  // Open Add Period Modal for a specific session
  const handleOpenAddPeriod = (day: string, session: 'morning' | 'afternoon') => {
    const dayData = (timetable || []).find((t) => t.day === day);
    const existing = dayData
      ? (dayData.periods || []).filter((p) => (p.session || 'morning') === session)
      : [];
    const nextPeriodNum = existing.length + 1;
    const defaultTime =
      session === 'morning'
        ? STANDARD_TIMES.morning[nextPeriodNum - 1] || `Tiết ${nextPeriodNum} sáng`
        : STANDARD_TIMES.afternoon[nextPeriodNum - 1] || `Tiết ${nextPeriodNum} chiều`;

    setNewPeriodForm({
      day,
      session,
      subject: '',
      teacher: session === 'morning' && nextPeriodNum === 1 && day === 'Thứ Hai' ? `${appConfig.teacherName} (GVCN)` : appConfig.teacherName,
      room: appConfig.roomNumber,
      time: defaultTime,
    });
    setIsAddPeriodModalOpen(true);
  };

  // Handle Save New Period
  const handleSaveNewPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodForm.subject.trim()) {
      alert('Vui lòng nhập tên môn học!');
      return;
    }

    const finalTeacher =
      newPeriodForm.teacher.trim() ||
      getTeacherForSubject(newPeriodForm.subject.trim()) ||
      appConfig.teacherName;

    addPeriod(newPeriodForm.day, newPeriodForm.session, {
      subject: newPeriodForm.subject.trim(),
      teacher: finalTeacher,
      room: newPeriodForm.room.trim() || appConfig.roomNumber,
      time: newPeriodForm.time.trim(),
    });

    setIsAddPeriodModalOpen(false);
    showToast(`Đã thêm tiết mới vào Buổi ${newPeriodForm.session === 'morning' ? 'Sáng' : 'Chiều'} (${newPeriodForm.day})!`);
  };

  // Handle Save Edit Day Modal (including additions/removals made inside the modal)
  const handleSaveDayPeriods = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = timetable.map((t) => {
      if (t.day === editDay) {
        return { ...t, periods: tempDayPeriods };
      }
      return t;
    });
    updateTimetable(updated);
    setIsEditDayModalOpen(false);
    showToast(`Đã lưu thời khóa biểu ${editDay} thành công!`);
  };

  // Add a period row inside the Edit Day Modal
  const handleAddPeriodInsideModal = (session: 'morning' | 'afternoon') => {
    const sessionPeriods = tempDayPeriods.filter((p) => (p.session || 'morning') === session);
    const nextNum = sessionPeriods.length + 1;
    const defaultTime =
      session === 'morning'
        ? STANDARD_TIMES.morning[nextNum - 1] || `Tiết ${nextNum} sáng`
        : STANDARD_TIMES.afternoon[nextNum - 1] || `Tiết ${nextNum} chiều`;

    const newPeriod: TimetablePeriod = {
      period: nextNum,
      session,
      time: defaultTime,
      subject: 'Môn học mới',
      teacher: appConfig.teacherName,
      room: appConfig.roomNumber,
    };

    setTempDayPeriods([...tempDayPeriods, newPeriod]);
  };

  // Remove a period row inside the Edit Day Modal
  const handleRemovePeriodInsideModal = (session: 'morning' | 'afternoon', periodNumber: number) => {
    let removed = false;
    const filtered = tempDayPeriods.filter((p) => {
      const pSession = p.session || 'morning';
      if (pSession === session && p.period === periodNumber && !removed) {
        removed = true;
        return false;
      }
      return true;
    });

    // Re-index
    let mCount = 1;
    let aCount = 1;
    const reindexed = filtered.map((p) => {
      const pSession = p.session || 'morning';
      if (pSession === 'morning') {
        return { ...p, period: mCount++ };
      } else {
        return { ...p, period: aCount++ };
      }
    });

    setTempDayPeriods(reindexed);
  };

  // Confirm delete single period from card
  const handleConfirmDeletePeriod = () => {
    if (!deleteConfirmTarget) return;
    deletePeriod(
      deleteConfirmTarget.day,
      deleteConfirmTarget.session,
      deleteConfirmTarget.period
    );
    showToast(
      `Đã bớt Tiết ${deleteConfirmTarget.period} ${
        deleteConfirmTarget.session === 'morning' ? 'sáng' : 'chiều'
      } (${deleteConfirmTarget.day})!`
    );
    setDeleteConfirmTarget(null);
  };

  // Save single period quick edit
  const handleSaveSinglePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriodData) return;
    updatePeriod(
      editingPeriodData.day,
      editingPeriodData.period,
      {
        subject: editingPeriodData.subject,
        teacher: editingPeriodData.teacher,
        room: editingPeriodData.room,
        time: editingPeriodData.time,
      },
      editingPeriodData.session
    );
    setEditingPeriodData(null);
    showToast(
      `Đã cập nhật Tiết ${editingPeriodData.period} ${
        editingPeriodData.session === 'morning' ? 'sáng' : 'chiều'
      } (${editingPeriodData.day})!`
    );
  };

  // Delete from single period modal
  const handleDeleteFromSingleModal = () => {
    if (!editingPeriodData) return;
    deletePeriod(
      editingPeriodData.day,
      editingPeriodData.session,
      editingPeriodData.period
    );
    showToast(
      `Đã bớt Tiết ${editingPeriodData.period} ${
        editingPeriodData.session === 'morning' ? 'sáng' : 'chiều'
      } (${editingPeriodData.day})!`
    );
    setEditingPeriodData(null);
  };

  // Open Edit All Duty Schedule modal
  const handleOpenEditAllDuty = () => {
    setTempDuty(JSON.parse(JSON.stringify(dutySchedule)));
    setIsEditDutyModalOpen(true);
  };

  // Save All Duty Schedule
  const handleSaveAllDuty = (e: React.FormEvent) => {
    e.preventDefault();
    updateDutySchedule(tempDuty);
    setIsEditDutyModalOpen(false);
    showToast('Đã lưu phân công trực nhật của Lớp phó Lao động!');
  };

  // Save single duty edit
  const handleSaveSingleDutyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDutyItem) return;
    updateDutyItem(editingDutyItem.id, editingDutyItem);
    setEditingDutyItem(null);
    showToast(`Đã cập nhật ca trực nhật của ${editingDutyItem.group}!`);
  };

  // Save Evaluation & Score
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingDutyItem) return;
    updateDutyItem(evaluatingDutyItem.id, {
      score: evaluatingDutyItem.score,
      status: evaluatingDutyItem.status,
      note: evaluatingDutyItem.note,
    });
    setEvaluatingDutyItem(null);
    showToast(`Đã lưu chấm điểm & đánh giá của Lớp phó Lao động cho ${evaluatingDutyItem.group}!`);
  };

  // Create new duty assignment
  const handleCreateNewDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedBy = isLaborCadre
      ? `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`
      : isTeacher
      ? 'Thầy Trương Xuân Hòa (GVCN)'
      : 'Ban Cán Sự 12A7';

    addDutyItem({
      group: newDutyForm.group,
      day: newDutyForm.day,
      task: newDutyForm.task,
      leaderName: newDutyForm.leaderName,
      assignedBy,
      score: newDutyForm.score,
      status: newDutyForm.status,
      note: newDutyForm.note,
    });
    setIsAddDutyModalOpen(false);
    showToast(`Đã phân công ca trực nhật mới cho ${newDutyForm.group}!`);
  };

  // Delete duty assignment
  const handleDeleteDuty = (id: string, groupName: string) => {
    deleteDutyItem(id);
    showToast(`Đã xóa ca trực nhật của ${groupName}!`);
  };

  // Switch quickly to Labor Cadre
  const handleSwitchToLaborCadre = () => {
    if (laborCadreStudent) {
      setActiveStudentId(laborCadreStudent.id);
    }
    setRole('student');
    showToast(`Đã chuyển sang vai trò: ${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} - Lớp phó Lao động!`);
  };

  // Reset to default
  const handleResetToDefault = () => {
    resetTimetable();
    resetDutySchedule();
    setShowConfirmReset(false);
    setIsEditDayModalOpen(false);
    setIsEditDutyModalOpen(false);
    showToast('Đã khôi phục thời khóa biểu chuẩn Sáng 4 tiết, Chiều 3 tiết & lịch trực nhật!');
  };

  // Periods for current selected day
  const currentDayData = timetable.find((t) => t.day === selectedDay) || {
    day: selectedDay,
    periods: [],
  };

  const morningPeriods = currentDayData.periods
    .filter((p) => (p.session || 'morning') === 'morning')
    .sort((a, b) => a.period - b.period);

  const afternoonPeriods = currentDayData.periods
    .filter((p) => (p.session || 'morning') === 'afternoon')
    .sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-bold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Thời khóa biểu {appConfig.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  Sáng 4 tiết • Chiều 3 tiết
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{appConfig.schoolName}</span>
                <span>•</span>
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500 inline" /> Sáng (07:20 - 11:10)
                </span>
                <span>•</span>
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-blue-500 inline" /> Chiều (13:10 - 16:00)
                </span>
                <span>•</span>
                <span>Phòng học: {appConfig.roomNumber}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle View Mode */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Chi tiết ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Bảng cả tuần
            </button>
            {role !== 'parent' && (
              <button
                onClick={() => setViewMode('duty')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'duty'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Trực nhật 4 Tổ
              </button>
            )}
          </div>

          <button
            onClick={() => setShowTeachersModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Xem danh sách 10 Giáo viên bộ môn Lớp 12A7"
          >
            <Users className="w-3.5 h-3.5 text-purple-600" /> GV Bộ Môn (10 Thầy Cô)
          </button>

          {isTeacher && (
            <>
              <button
                onClick={() => handleOpenAddPeriod(selectedDay, 'morning')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                title="Thêm tiết mới vào thời khóa biểu"
              >
                <Plus className="w-4 h-4" /> Thêm tiết học
              </button>
              <button
                onClick={() => handleOpenEditDay(selectedDay)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4" /> Sửa {selectedDay}
              </button>
              <button
                onClick={() => {
                  setTempDuty(dutySchedule);
                  setIsEditDutyModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sửa trực nhật
              </button>
            </>
          )}
        </div>
      </div>

      {/* Official Timetable Notification Banner (Từ 19/10/2026) */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50/70 border border-blue-200/80 rounded-2xl p-3 sm:p-4 text-xs shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-2xs">
            TKB HK1 2026 - 2027
          </span>
          <span className="font-bold text-slate-800">
            Áp dụng từ: <span className="text-blue-700 font-black">19/10/2026</span> • Trường THPT Vĩnh Lộc B • GVCN: <span className="text-slate-900 font-extrabold">Thầy Trương Xuân Hòa</span>
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-500 font-semibold shrink-0">Phân công GV:</span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium whitespace-nowrap">
            Toán: <strong>Thầy Thanh</strong>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium whitespace-nowrap">
            Văn: <strong>Cô Đào</strong>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium whitespace-nowrap">
            Anh: <strong>Cô Thảo</strong>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium whitespace-nowrap">
            Lý: <strong>Thầy Tèo</strong>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium whitespace-nowrap">
            Hóa: <strong>Thầy Hòa</strong>
          </span>
          <button
            onClick={() => setShowTeachersModal(true)}
            className="text-purple-700 font-bold hover:underline shrink-0 ml-1 px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
          >
            Chi tiết 10 GV &raquo;
          </button>
        </div>
      </div>

      {/* KHUNG THỜI GIAN HỌC CHUẨN (SÁNG & CHIỀU) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              Khung Thời Gian Học Chính Thức ({appConfig.schoolName})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Mỗi tiết 45 phút • Nghỉ chuyển tiết 5 phút
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Khung giờ Buổi Sáng */}
          <div className="rounded-2xl bg-gradient-to-br from-cyan-50/70 via-sky-50/50 to-amber-50/40 border border-sky-200/80 p-3.5">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-sky-200/60">
              <span className="font-black text-sky-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <Sun className="w-4 h-4 text-amber-500" /> BUỔI SÁNG (07:20 - 11:10)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                Tập trung: 07:20
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đầu giờ</div>
                <div className="font-black text-slate-800">07:20 • Tập trung</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Tiết 1 Sáng</div>
                <div className="font-black text-slate-900">07:25 - 08:10</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Tiết 2 Sáng</div>
                <div className="font-black text-slate-900">08:15 - 09:00</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <div className="text-[10px] font-extrabold text-emerald-700 uppercase">Ra chơi sáng (30p)</div>
                <div className="font-black text-emerald-900">09:00 - 09:30</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Tiết 3 Sáng</div>
                <div className="font-black text-slate-900">09:35 - 10:20</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Tiết 4 (Tan học)</div>
                <div className="font-black text-slate-900">10:25 - 11:10</div>
              </div>
            </div>
          </div>

          {/* Khung giờ Buổi Chiều */}
          <div className="rounded-2xl bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-blue-50/40 border border-orange-200/80 p-3.5">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-orange-200/60">
              <span className="font-black text-orange-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <Sunset className="w-4 h-4 text-orange-600" /> BUỔI CHIỀU (13:10 - 16:00)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 font-extrabold text-[10px]">
                Giờ tập trung: 13:10
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-white border border-orange-100 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đầu giờ chiều</div>
                <div className="font-black text-slate-800">13:10 • Tập trung</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100 shadow-2xs">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Tiết 1 Chiều</div>
                <div className="font-black text-slate-900">13:15 - 14:00</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100 shadow-2xs">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Tiết 2 Chiều</div>
                <div className="font-black text-slate-900">14:05 - 14:50</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <div className="text-[10px] font-extrabold text-emerald-700 uppercase">Ra chơi chiều (20p)</div>
                <div className="font-black text-emerald-900">14:50 - 15:10</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100 shadow-2xs sm:col-span-2">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Tiết 3 Chiều (Kết thúc buổi chiều)</div>
                <div className="font-black text-slate-900">15:15 - 16:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DAY VIEW MODE */}
      {viewMode === 'day' && (
        <>
          {/* Day Selector Navigation */}
          <div className="flex items-center justify-between gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5">
              {(timetable || []).map((t) => {
                const isSelected = selectedDay === t.day;
                const mLen = (t.periods || []).filter((p) => (p.session || 'morning') === 'morning').length;
                const aLen = (t.periods || []).filter((p) => (p.session || 'morning') === 'afternoon').length;
                return (
                  <button
                    key={t.day}
                    onClick={() => setSelectedDay(t.day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-slate-700 border border-transparent'
                    }`}
                  >
                    <span>{t.day}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {mLen + aLen} tiết
                    </span>
                  </button>
                );
              })}
            </div>

            {isTeacher && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenAddPeriod(selectedDay, 'morning')}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm tiết
                </button>
                <button
                  onClick={() => handleOpenEditDay(selectedDay)}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa ngày này
                </button>
              </div>
            )}
          </div>

          {/* Day Content Sections (Buổi Sáng & Buổi Chiều) */}
          <div className="space-y-6">
            {/* 1. BUỔI SÁNG (Mặc định 4 tiết) */}
            <div className="bg-white rounded-3xl border border-amber-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-amber-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900">
                        BUỔI SÁNG: {selectedDay}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px]">
                        {morningPeriods.length} tiết
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-amber-700">Khung giờ: 07:20 - 11:10</span>
                      <span>•</span>
                      <span>07:20 Tập trung</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">Ra chơi: 09:00 - 09:30</span>
                    </p>
                  </div>
                </div>

                {isTeacher && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddPeriod(selectedDay, 'morning')}
                      className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm tiết sáng
                    </button>
                  </div>
                )}
              </div>

              {morningPeriods.length === 0 ? (
                <div className="p-8 text-center bg-amber-50/30 rounded-2xl border border-dashed border-amber-200">
                  <Sun className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-slate-600">Không có tiết học buổi sáng</p>
                  {isTeacher && (
                    <button
                      onClick={() => handleOpenAddPeriod(selectedDay, 'morning')}
                      className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                    >
                      + Thêm tiết sáng cho {selectedDay}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {morningPeriods.map((p) => {
                    const isMorningAssembly =
                      p.subject.includes('Chào cờ') || p.subject.includes('SHDC');
                    const isHomeroom =
                      p.subject.includes('SHL') || p.subject.includes('Sinh hoạt');

                    return (
                      <div
                        key={`m-${p.period}`}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group relative ${
                          isMorningAssembly
                            ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 border-amber-300 shadow-2xs'
                            : isHomeroom
                            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                                isMorningAssembly
                                  ? 'bg-amber-600 text-white'
                                  : isHomeroom
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {p.period}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {p.time || STANDARD_TIMES.morning[p.period - 1] || `Tiết ${p.period}`}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-black text-sm text-slate-900 mb-1 leading-snug">
                            {p.subject}
                          </h4>

                          <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mb-2">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{p.teacher}</span>
                          </div>
                        </div>

                        <div>
                          <div className="pt-2.5 border-t border-slate-200 mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1 truncate font-medium">
                              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                              <span className="truncate">{p.room}</span>
                            </span>

                            {isTeacher && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setEditingPeriodData({
                                      day: selectedDay,
                                      session: 'morning',
                                      period: p.period,
                                      subject: p.subject,
                                      teacher: p.teacher,
                                      room: p.room,
                                      time: p.time || STANDARD_TIMES.morning[p.period - 1] || '',
                                    })
                                  }
                                  className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition-colors"
                                  title="Chỉnh sửa tiết học này"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmTarget({
                                      day: selectedDay,
                                      session: 'morning',
                                      period: p.period,
                                      subject: p.subject,
                                    })
                                  }
                                  className="p-1 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 shadow-2xs transition-colors"
                                  title="Bớt / Xóa tiết học này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. BUỔI CHIỀU (Mặc định 3 tiết) */}
            <div className="bg-white rounded-3xl border border-blue-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-blue-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Sunset className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900">
                        BUỔI CHIỀU: {selectedDay}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[11px]">
                        {afternoonPeriods.length} tiết
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-blue-700">Khung giờ: 13:10 - 16:00</span>
                      <span>•</span>
                      <span>13:10 Giờ tập trung</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">Ra chơi: 14:50 - 15:10</span>
                    </p>
                  </div>
                </div>

                {isTeacher && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddPeriod(selectedDay, 'afternoon')}
                      className="text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm tiết chiều
                    </button>
                  </div>
                )}
              </div>

              {afternoonPeriods.length === 0 ? (
                <div className="p-8 text-center bg-blue-50/30 rounded-2xl border border-dashed border-blue-200">
                  <Sunset className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-slate-600">Không có tiết học buổi chiều</p>
                  {isTeacher && (
                    <button
                      onClick={() => handleOpenAddPeriod(selectedDay, 'afternoon')}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                    >
                      + Thêm tiết chiều cho {selectedDay}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {afternoonPeriods.map((p) => {
                    const isHomeroom =
                      p.subject.includes('SHL') || p.subject.includes('Sinh hoạt');

                    return (
                      <div
                        key={`a-${p.period}`}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group relative ${
                          isHomeroom
                            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                                isHomeroom
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {p.period}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {p.time || STANDARD_TIMES.afternoon[p.period - 1] || `Tiết ${p.period} chiều`}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-black text-sm text-slate-900 mb-1 leading-snug">
                            {p.subject}
                          </h4>

                          <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mb-2">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{p.teacher}</span>
                          </div>
                        </div>

                        <div>
                          <div className="pt-2.5 border-t border-slate-200 mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1 truncate font-medium">
                              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                              <span className="truncate">{p.room}</span>
                            </span>

                            {isTeacher && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setEditingPeriodData({
                                      day: selectedDay,
                                      session: 'afternoon',
                                      period: p.period,
                                      subject: p.subject,
                                      teacher: p.teacher,
                                      room: p.room,
                                      time: p.time || STANDARD_TIMES.afternoon[p.period - 1] || '',
                                    })
                                  }
                                  className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition-colors"
                                  title="Chỉnh sửa tiết học này"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmTarget({
                                      day: selectedDay,
                                      session: 'afternoon',
                                      period: p.period,
                                      subject: p.subject,
                                    })
                                  }
                                  className="p-1 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 shadow-2xs transition-colors"
                                  title="Bớt / Xóa tiết học này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* WEEKLY OVERVIEW TABLE MODE */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <span>Bảng Tổng Hợp Thời Khóa Biểu Cả Tuần</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  Sáng 4 tiết • Chiều 3 tiết
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Áp dụng cho lớp {appConfig.className} - Năm học 2026 - 2027
              </p>
            </div>

            {isTeacher && (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục TKB gốc
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-3.5 w-32 border-r border-slate-200 text-center">Buổi / Tiết</th>
                  {(timetable || []).map((t) => (
                    <th key={t.day} className="p-3.5 border-r border-slate-200 min-w-[160px] text-center">
                      <div className="font-black text-slate-900">{t.day}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {(t.periods || []).filter((p) => (p.session || 'morning') === 'morning').length} sáng •{' '}
                        {(t.periods || []).filter((p) => (p.session || 'morning') === 'afternoon').length} chiều
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Header Buổi Sáng */}
                <tr className="bg-amber-100/70 border-b border-amber-200 text-amber-950 font-black">
                  <td colSpan={timetable.length + 1} className="py-2 px-3.5 text-xs uppercase tracking-wide flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>BUỔI SÁNG (07:20 Tập trung • 07:25 - 11:10 • Ra chơi: 09:00 - 09:30)</span>
                  </td>
                </tr>

                {/* Tiết Sáng 1, 2, 3, 4, ... */}
                {[1, 2, 3, 4].map((periodNum) => (
                  <tr key={`m-row-${periodNum}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-3 border-r border-slate-200 bg-amber-50/30 text-center font-bold">
                      <div className="text-amber-900 font-black">Tiết {periodNum}</div>
                      <div className="text-[10px] text-slate-400">{STANDARD_TIMES.morning[periodNum - 1]}</div>
                    </td>
                    {timetable.map((t) => {
                      const p = t.periods.find(
                        (item) => (item.session || 'morning') === 'morning' && item.period === periodNum
                      );
                      if (!p) {
                        return (
                          <td key={`${t.day}-m-${periodNum}`} className="p-3 border-r border-slate-200 text-center text-slate-300 italic">
                            -
                          </td>
                        );
                      }
                      return (
                        <td key={`${t.day}-m-${periodNum}`} className="p-3 border-r border-slate-200">
                          <div className="font-extrabold text-slate-900 text-xs">{p.subject}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{p.teacher}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.room}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Header Buổi Chiều */}
                <tr className="bg-blue-100/70 border-b border-blue-200 text-blue-950 font-black">
                  <td colSpan={timetable.length + 1} className="py-2 px-3.5 text-xs uppercase tracking-wide flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-blue-600" />
                    <span>BUỔI CHIỀU (13:10 Tập trung • 13:15 - 16:00 • Ra chơi: 14:50 - 15:10)</span>
                  </td>
                </tr>

                {/* Tiết Chiều 1, 2, 3, ... */}
                {[1, 2, 3].map((periodNum) => (
                  <tr key={`a-row-${periodNum}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-3 border-r border-slate-200 bg-blue-50/30 text-center font-bold">
                      <div className="text-blue-900 font-black">Tiết {periodNum} chiều</div>
                      <div className="text-[10px] text-slate-400">{STANDARD_TIMES.afternoon[periodNum - 1]}</div>
                    </td>
                    {timetable.map((t) => {
                      const p = t.periods.find(
                        (item) => (item.session || 'morning') === 'afternoon' && item.period === periodNum
                      );
                      if (!p) {
                        return (
                          <td key={`${t.day}-a-${periodNum}`} className="p-3 border-r border-slate-200 text-center text-slate-300 italic">
                            -
                          </td>
                        );
                      }
                      return (
                        <td key={`${t.day}-a-${periodNum}`} className="p-3 border-r border-slate-200">
                          <div className="font-extrabold text-slate-900 text-xs">{p.subject}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{p.teacher}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.room}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Duty Schedule Table (Phân công trực nhật & Đánh giá của Lớp phó Lao động) */}
      <div className={`bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs ${viewMode === 'duty' ? 'ring-2 ring-emerald-400/30' : ''}`}>
        {viewMode === 'duty' && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-[11px] font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" /> CÔNG TÁC LAO ĐỘNG & VỆ SINH LỚP 12A7
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Bảng Phân Công & Chấm Điểm Trực Nhật 4 Tổ
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
                  Chỉ đạo: <strong>Thầy Trương Xuân Hòa (GVCN)</strong> • Trực tiếp phân công & ghi sổ theo dõi: <strong>{laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)</strong>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center w-full md:w-auto">
                <div className="bg-white/15 backdrop-blur-xs p-3 rounded-xl border border-white/20">
                  <div className="text-xl font-black text-white">{dutySchedule.length}</div>
                  <div className="text-[10px] text-emerald-100 font-semibold uppercase">Ca trực nhật</div>
                </div>
                <div className="bg-white/15 backdrop-blur-xs p-3 rounded-xl border border-white/20">
                  <div className="text-xl font-black text-yellow-300">
                    {dutySchedule.filter((d) => d.status === 'completed').length}
                  </div>
                  <div className="text-[10px] text-emerald-100 font-semibold uppercase">Đã hoàn thành</div>
                </div>
                <div className="bg-white/15 backdrop-blur-xs p-3 rounded-xl border border-white/20">
                  <div className="text-xl font-black text-emerald-200">
                    {(
                      dutySchedule.reduce((sum, d) => sum + (d.score !== undefined ? d.score : 10), 0) /
                      (dutySchedule.length || 1)
                    ).toFixed(1)}
                  </div>
                  <div className="text-[10px] text-emerald-100 font-semibold uppercase">Điểm TB / 10</div>
                </div>
              </div>
            </div>

            {/* Quy chuẩn vệ sinh 12A7 */}
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="block text-white">Đầu giờ (Trước 7h20)</strong>
                  <span className="text-emerald-100 text-[10px]">Lau bảng sạch, giặt giẻ lau phấn, kê ngay ngắn bàn giáo viên.</span>
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="block text-white">Sau giờ giải lao & tiết 4 (11h10)</strong>
                  <span className="text-emerald-100 text-[10px]">Đổ rác lớp, kiểm tra hộc bàn không để sót rác đồ ăn, hộp sữa.</span>
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-slate-900 font-bold flex items-center gap-center text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="block text-white">Cuối buổi chiều (16h00)</strong>
                  <span className="text-emerald-100 text-[10px]">Quét sạch sàn lớp, kê thẳng tắp bàn ghế 5 dãy, tắt quạt đèn.</span>
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="block text-white">Chấm điểm thi đua</strong>
                  <span className="text-emerald-100 text-[10px]">Lớp phó Lao động ghi điểm sổ thi đua tuần, cộng/trừ điểm tổ.</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-emerald-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Phân Công Trực Nhật & Vệ Sinh Lớp {appConfig.className}
                </h3>
                {isLaborCadre ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                    🌱 QUYỀN LỚP PHÓ LAO ĐỘNG ({laborCadreStudent?.name || 'Đặng Nguyễn Kha'})
                  </span>
                ) : isTeacher ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-300">
                    👑 QUYỀN GVCN (Thầy Trương Xuân Hòa)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    Phụ trách: {laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó LĐ)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi vệ sinh phòng học trước 7h20 và sau tiết 3 chiều (16h00) • Chấm điểm thi đua trực nhật 4 Tổ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageDuty ? (
              <>
                <button
                  onClick={() => setIsAddDutyModalOpen(true)}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Phân công ca trực mới
                </button>
                <button
                  onClick={handleOpenEditAllDuty}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa lịch 4 Tổ
                </button>
              </>
            ) : (
              <button
                onClick={handleSwitchToLaborCadre}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                title="Đăng nhập với vai trò Lớp phó Lao động để phân công lịch trực nhật"
              >
                <UserCheck className="w-4 h-4" /> Đổi sang Lớp phó Lao động ({laborCadreStudent?.name || 'Đặng Nguyễn Kha'})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {dutySchedule.map((duty: DutyScheduleItem) => {
            const isCompleted = duty.status === 'completed';
            const isInProgress = duty.status === 'in_progress';

            return (
              <div
                key={duty.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-2xs ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-emerald-200'
                    : isInProgress
                    ? 'bg-gradient-to-br from-amber-50/70 to-orange-50/40 border-amber-200'
                    : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                      />
                      {duty.group}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                      {duty.day}
                    </span>
                  </div>

                  {duty.leaderName && (
                    <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{duty.leaderName}</span>
                    </div>
                  )}

                  <p className="text-slate-800 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-black/5 text-[11px]">
                    {duty.task}
                  </p>

                  {/* Rating & Evaluation Note */}
                  <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">Chấm điểm trực nhật:</span>
                      <span className="font-black text-xs text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {duty.score !== undefined ? `${duty.score}/10` : '10/10'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span
                        className={`font-bold ${
                          isCompleted
                            ? 'text-emerald-700'
                            : isInProgress
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {isCompleted
                          ? '✓ Đã hoàn thành'
                          : isInProgress
                          ? '⌛ Đang trực nhật'
                          : '📋 Đã phân công'}
                      </span>
                    </div>

                    {duty.note && (
                      <p className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-100">
                        "{duty.note}"
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Phân công: <span className="font-semibold text-slate-600">{duty.assignedBy || 'Trần Anh Khoa (Lớp phó LĐ)'}</span>
                  </div>
                </div>

                {canManageDuty && (
                  <div className="pt-2.5 border-t border-slate-200 mt-3 flex items-center justify-between gap-1">
                    <button
                      onClick={() => setEvaluatingDutyItem(duty)}
                      className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Chấm điểm và nhận xét vệ sinh cho tổ này"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Đánh giá
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingDutyItem(duty)}
                        className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        title="Chỉnh sửa ca trực nhật"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteDuty(duty.id, duty.group)}
                        className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition-colors"
                        title="Xóa ca trực nhật"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW PERIOD (+ Thêm tiết vào TKB) */}
      {/* ========================================================================= */}
      {isAddPeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Thêm Tiết Học Mới</h3>
                  <p className="text-xs text-emerald-100">
                    Bổ sung thêm số tiết vào thời khóa biểu {newPeriodForm.day}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPeriodModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPeriod} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày trong tuần:</label>
                  <select
                    value={newPeriodForm.day}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, day: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                  >
                    {timetable.map((t) => (
                      <option key={t.day} value={t.day}>
                        {t.day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Buổi học:</label>
                  <select
                    value={newPeriodForm.session}
                    onChange={(e) => {
                      const newSession = e.target.value as 'morning' | 'afternoon';
                      const dayData = (timetable || []).find((t) => t.day === newPeriodForm.day);
                      const count = dayData
                        ? (dayData.periods || []).filter((p) => (p.session || 'morning') === newSession).length
                        : 0;
                      const nextNum = count + 1;
                      const defaultTime =
                        newSession === 'morning'
                          ? STANDARD_TIMES.morning[nextNum - 1] || `Tiết ${nextNum} sáng`
                          : STANDARD_TIMES.afternoon[nextNum - 1] || `Tiết ${nextNum} chiều`;

                      setNewPeriodForm({
                        ...newPeriodForm,
                        session: newSession,
                        time: defaultTime,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                  >
                    <option value="morning">☀️ Buổi Sáng</option>
                    <option value="afternoon">🌇 Buổi Chiều</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khung giờ tiết học:</label>
                <input
                  type="text"
                  value={newPeriodForm.time}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, time: e.target.value })}
                  placeholder="Ví dụ: 07:00 - 07:45 hoặc 10:35 - 11:20..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Môn học <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  list="common-subjects-new"
                  value={newPeriodForm.subject}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, subject: e.target.value })}
                  placeholder="Chọn hoặc nhập tên môn học..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  required
                />
                <datalist id="common-subjects-new">
                  {COMMON_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giáo viên giảng dạy:</label>
                <input
                  type="text"
                  value={newPeriodForm.teacher}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, teacher: e.target.value })}
                  placeholder="Thầy/Cô..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phòng học:</label>
                <input
                  type="text"
                  value={newPeriodForm.room}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, room: e.target.value })}
                  placeholder="P.12A7 / Phòng máy / Sân đa năng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPeriodModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Thêm vào TKB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT FULL DAY PERIODS (Chỉnh sửa & Thêm/Bớt tiết cả ngày) */}
      {/* ========================================================================= */}
      {isEditDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Chỉnh Sửa Toàn Bộ TKB: {editDay}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Sửa thông tin, thêm hoặc bớt tiết cho cả Buổi Sáng và Buổi Chiều
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditDayModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDayPeriods} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
              {/* SECTION SÁNG TRONG MODAL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <span className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Buổi Sáng ({tempDayPeriods.filter((p) => (p.session || 'morning') === 'morning').length} tiết)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddPeriodInsideModal('morning')}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Thêm 1 tiết sáng
                  </button>
                </div>

                {tempDayPeriods
                  .filter((p) => (p.session || 'morning') === 'morning')
                  .map((period, idx) => {
                    const globalIdx = tempDayPeriods.findIndex(
                      (p) => (p.session || 'morning') === 'morning' && p.period === period.period
                    );

                    return (
                      <div
                        key={`modal-m-${period.period}`}
                        className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
                          <span className="font-extrabold text-amber-900 text-xs flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                              {period.period}
                            </span>
                            Tiết {period.period} Sáng
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemovePeriodInsideModal('morning', period.period)}
                            className="text-red-600 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 transition-colors"
                            title="Bớt tiết này"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Bớt tiết này
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Môn học:</label>
                            <input
                              type="text"
                              list="common-subjects-day-edit"
                              value={period.subject}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], subject: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Giáo viên:</label>
                            <input
                              type="text"
                              value={period.teacher}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], teacher: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Phòng học:</label>
                            <input
                              type="text"
                              value={period.room}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], room: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Giờ học:</label>
                            <input
                              type="text"
                              value={period.time || STANDARD_TIMES.morning[period.period - 1] || ''}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], time: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* SECTION CHIỀU TRONG MODAL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <span className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-blue-500" />
                    Buổi Chiều ({tempDayPeriods.filter((p) => (p.session || 'morning') === 'afternoon').length} tiết)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddPeriodInsideModal('afternoon')}
                    className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Thêm 1 tiết chiều
                  </button>
                </div>

                {tempDayPeriods
                  .filter((p) => (p.session || 'morning') === 'afternoon')
                  .map((period, idx) => {
                    const globalIdx = tempDayPeriods.findIndex(
                      (p) => (p.session || 'morning') === 'afternoon' && p.period === period.period
                    );

                    return (
                      <div
                        key={`modal-a-${period.period}`}
                        className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                          <span className="font-extrabold text-blue-900 text-xs flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                              {period.period}
                            </span>
                            Tiết {period.period} Chiều
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemovePeriodInsideModal('afternoon', period.period)}
                            className="text-red-600 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 transition-colors"
                            title="Bớt tiết này"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Bớt tiết này
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Môn học:</label>
                            <input
                              type="text"
                              list="common-subjects-day-edit"
                              value={period.subject}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], subject: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Giáo viên:</label>
                            <input
                              type="text"
                              value={period.teacher}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], teacher: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Phòng học:</label>
                            <input
                              type="text"
                              value={period.room}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], room: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Giờ học:</label>
                            <input
                              type="text"
                              value={period.time || STANDARD_TIMES.afternoon[period.period - 1] || ''}
                              onChange={(e) => {
                                const updated = [...tempDayPeriods];
                                updated[globalIdx] = { ...updated[globalIdx], time: e.target.value };
                                setTempDayPeriods(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <datalist id="common-subjects-day-edit">
                {COMMON_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>

              {/* Reset to Default Confirmation */}
              {showConfirmReset && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <p className="font-bold">
                    Bạn có chắc muốn khôi phục toàn bộ Thời khóa biểu cả tuần về cấu hình chuẩn (Sáng 4 tiết, Chiều 3 tiết)?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Đồng ý khôi phục
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Khôi phục TKB gốc
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditDayModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Lưu Thời Khóa Biểu
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK EDIT SINGLE PERIOD */}
      {/* ========================================================================= */}
      {editingPeriodData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setEditingPeriodData(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Chỉnh Sửa Tiết {editingPeriodData.period} ({editingPeriodData.session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều'})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ngày {editingPeriodData.day} • {appConfig.className}
            </p>

            <form onSubmit={handleSaveSinglePeriod} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
                <input
                  type="text"
                  list="common-subjects-single"
                  value={editingPeriodData.subject}
                  onChange={(e) =>
                    setEditingPeriodData({ ...editingPeriodData, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  required
                />
                <datalist id="common-subjects-single">
                  {COMMON_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giáo viên phụ trách:</label>
                <input
                  type="text"
                  value={editingPeriodData.teacher}
                  onChange={(e) =>
                    setEditingPeriodData({ ...editingPeriodData, teacher: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phòng học:</label>
                <input
                  type="text"
                  value={editingPeriodData.room}
                  onChange={(e) =>
                    setEditingPeriodData({ ...editingPeriodData, room: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khung giờ:</label>
                <input
                  type="text"
                  value={editingPeriodData.time}
                  onChange={(e) =>
                    setEditingPeriodData({ ...editingPeriodData, time: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-700"
                  placeholder="07:00 - 07:45..."
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDeleteFromSingleModal}
                  className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold border border-red-200 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bớt tiết này
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPeriodData(null)}
                    className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Cập nhật
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM DELETE / BỚT TIẾT */}
      {/* ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Bớt Tiết {deleteConfirmTarget.period} ({deleteConfirmTarget.session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều'})?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bạn có chắc muốn bớt tiết <strong>{deleteConfirmTarget.subject}</strong> trong TKB ngày {deleteConfirmTarget.day}? Các tiết sau sẽ được tự động dồn và đánh số lại.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeletePeriod}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Đồng ý bớt tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT ALL DUTY SCHEDULE (Sửa lịch 4 Tổ) */}
      {/* ========================================================================= */}
      {isEditDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Phân Công Trực Nhật & Vệ Sinh Cả 4 Tổ
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thực hiện bởi Lớp phó Lao động (Trần Anh Khoa) & GVCN
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditDutyModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllDuty} className="space-y-4 text-xs overflow-y-auto">
              {tempDuty.map((duty, idx) => (
                <div key={duty.id || idx} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tổ phụ trách:</label>
                      <input
                        type="text"
                        value={duty.group}
                        onChange={(e) => {
                          const updated = [...tempDuty];
                          updated[idx] = { ...updated[idx], group: e.target.value };
                          setTempDuty(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white font-bold text-emerald-950"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Ngày phân công:</label>
                      <input
                        type="text"
                        value={duty.day}
                        onChange={(e) => {
                          const updated = [...tempDuty];
                          updated[idx] = { ...updated[idx], day: e.target.value };
                          setTempDuty(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white font-semibold text-slate-800"
                        placeholder="Thứ Hai..."
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tổ trưởng phụ trách:</label>
                      <input
                        type="text"
                        value={duty.leaderName || ''}
                        onChange={(e) => {
                          const updated = [...tempDuty];
                          updated[idx] = { ...updated[idx], leaderName: e.target.value };
                          setTempDuty(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white font-semibold text-slate-800"
                        placeholder="Tên tổ trưởng..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nhiệm vụ trực nhật chi tiết:</label>
                    <textarea
                      rows={2}
                      value={duty.task}
                      onChange={(e) => {
                        const updated = [...tempDuty];
                        updated[idx] = { ...updated[idx], task: e.target.value };
                        setTempDuty(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-slate-800 leading-relaxed"
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditDutyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> Lưu Lịch Trực Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT SINGLE DUTY ITEM */}
      {/* ========================================================================= */}
      {editingDutyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Sửa Ca Trực Nhật: {editingDutyItem.group}
                </h3>
              </div>
              <button
                onClick={() => setEditingDutyItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleDutyEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổ trực nhật:</label>
                  <input
                    type="text"
                    value={editingDutyItem.group}
                    onChange={(e) => setEditingDutyItem({ ...editingDutyItem, group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày phân công:</label>
                  <input
                    type="text"
                    value={editingDutyItem.day}
                    onChange={(e) => setEditingDutyItem({ ...editingDutyItem, day: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tổ trưởng phụ trách:</label>
                <input
                  type="text"
                  value={editingDutyItem.leaderName || ''}
                  onChange={(e) => setEditingDutyItem({ ...editingDutyItem, leaderName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Hoàng Khang (Tổ trưởng)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nhiệm vụ trực nhật chi tiết:</label>
                <textarea
                  rows={3}
                  value={editingDutyItem.task}
                  onChange={(e) => setEditingDutyItem({ ...editingDutyItem, task: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái hoàn thành:</label>
                  <select
                    value={editingDutyItem.status || 'pending'}
                    onChange={(e) => setEditingDutyItem({ ...editingDutyItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                  >
                    <option value="pending">📋 Chuẩn bị trực nhật</option>
                    <option value="in_progress">⌛ Đang thực hiện</option>
                    <option value="completed">✓ Đã hoàn thành tốt</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm đánh giá (0-10):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={editingDutyItem.score !== undefined ? editingDutyItem.score : 10}
                    onChange={(e) => setEditingDutyItem({ ...editingDutyItem, score: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nhận xét của Lớp phó Lao động:</label>
                <input
                  type="text"
                  value={editingDutyItem.note || ''}
                  onChange={(e) => setEditingDutyItem({ ...editingDutyItem, note: e.target.value })}
                  placeholder="Ví dụ: Lau bảng sạch sẽ, đổ rác đúng giờ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDutyItem(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> Lưu Ca Trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ADD NEW DUTY SCHEDULE (Phân công ca trực mới) */}
      {/* ========================================================================= */}
      {isAddDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 -mx-6 -mt-6 p-5 text-white flex items-center justify-between rounded-t-3xl mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Phân Công Ca Trực Nhật Mới
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Lớp phó Lao động (Trần Anh Khoa) giao nhiệm vụ cho Tổ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDutyModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDuty} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổ trực nhật:</label>
                  <select
                    value={newDutyForm.group}
                    onChange={(e) => {
                      const grp = e.target.value;
                      let leader = 'Nguyễn Hoàng Khang (Tổ trưởng)';
                      if (grp === 'Tổ 2') leader = 'Lê Quang Hải (Tổ trưởng)';
                      else if (grp === 'Tổ 3') leader = 'Phạm Nhật Minh (Tổ trưởng)';
                      else if (grp === 'Tổ 4') leader = 'Võ Hoàng Tuấn (Tổ trưởng)';
                      setNewDutyForm({ ...newDutyForm, group: grp, leaderName: leader });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                  >
                    <option value="Tổ 1">Tổ 1</option>
                    <option value="Tổ 2">Tổ 2</option>
                    <option value="Tổ 3">Tổ 3</option>
                    <option value="Tổ 4">Tổ 4</option>
                    <option value="Cả Lớp">Cả Lớp (Tổng vệ sinh)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày phân công:</label>
                  <input
                    type="text"
                    value={newDutyForm.day}
                    onChange={(e) => setNewDutyForm({ ...newDutyForm, day: e.target.value })}
                    placeholder="Ví dụ: Thứ Hai, Thứ Bảy..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tổ trưởng phụ trách:</label>
                <input
                  type="text"
                  value={newDutyForm.leaderName}
                  onChange={(e) => setNewDutyForm({ ...newDutyForm, leaderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nhiệm vụ phân công chi tiết:</label>
                <textarea
                  rows={3}
                  value={newDutyForm.task}
                  onChange={(e) => setNewDutyForm({ ...newDutyForm, task: e.target.value })}
                  placeholder="Ghi rõ: Kê bàn ghế, lau bảng trước 6h45, kiểm tra quạt đèn, đổ rác sau tiết 3 chiều..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lời dặn của Lớp phó Lao động:</label>
                <input
                  type="text"
                  value={newDutyForm.note}
                  onChange={(e) => setNewDutyForm({ ...newDutyForm, note: e.target.value })}
                  placeholder="Ví dụ: Đề nghị các bạn có mặt đúng giờ để kiểm tra..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDutyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Phân Công Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: EVALUATE & SCORE DUTY (Chấm điểm trực nhật) */}
      {/* ========================================================================= */}
      {evaluatingDutyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 -mx-6 -mt-6 p-5 text-white flex items-center justify-between rounded-t-3xl mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-white text-white" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Đánh Giá & Chấm Điểm Vệ Sinh: {evaluatingDutyItem.group}
                  </h3>
                  <p className="text-xs text-amber-100">
                    Trần Anh Khoa - Lớp phó Lao động ghi sổ thi đua
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvaluatingDutyItem(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
                  <span>{evaluatingDutyItem.group} ({evaluatingDutyItem.day})</span>
                  <span>Tổ trưởng: {evaluatingDutyItem.leaderName}</span>
                </div>
                <p className="text-[11px] text-slate-600 italic">{evaluatingDutyItem.task}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Điểm trực nhật (Thang điểm 10):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={evaluatingDutyItem.score !== undefined ? evaluatingDutyItem.score : 10}
                    onChange={(e) =>
                      setEvaluatingDutyItem({
                        ...evaluatingDutyItem,
                        score: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 accent-amber-500"
                  />
                  <span className="w-12 text-center py-1 bg-amber-100 text-amber-900 font-black rounded-lg text-sm border border-amber-300">
                    {evaluatingDutyItem.score !== undefined ? evaluatingDutyItem.score : 10}đ
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng thái hoàn thành:</label>
                <select
                  value={evaluatingDutyItem.status || 'completed'}
                  onChange={(e) =>
                    setEvaluatingDutyItem({
                      ...evaluatingDutyItem,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                >
                  <option value="completed">✓ Đạt chuẩn - Hoàn thành rất tốt</option>
                  <option value="in_progress">⌛ Đang kiểm tra / Cần bổ sung</option>
                  <option value="pending">⚠️ Chưa đạt - Cần nhắc nhở vệ sinh lại</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nhận xét chi tiết của Lớp phó Lao động:
                </label>
                <textarea
                  rows={3}
                  value={evaluatingDutyItem.note || ''}
                  onChange={(e) =>
                    setEvaluatingDutyItem({ ...evaluatingDutyItem, note: e.target.value })
                  }
                  placeholder="Ghi nhận xét: Bảng sạch, hộc bàn không rác, quạt đèn đã tắt, bàn ghế kê ngay ngắn..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingDutyItem(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Lưu Điểm & Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER ASSIGNMENTS LIST (12A7 - HK1 NH 2026-2027) */}
      {showTeachersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Danh Sách Giáo Viên Giảng Dạy Lớp 12A7
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trường THPT Vĩnh Lộc B • TKB HK1 Năm học 2026 - 2027 (Áp dụng từ 19/10/2026)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTeachersModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLASS_12A7_TEACHERS.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all flex items-start gap-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${t.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {t.teacher.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-900 text-sm truncate">
                          {t.teacher}
                        </span>
                        {t.teacher.includes('GVCN') || t.teacher.includes('Trương Xuân Hòa') ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black shrink-0">
                            GVCN
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.role}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.subjects.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-[10px]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Phân công chuẩn theo Thời khóa biểu THPT Vĩnh Lộc B
              </span>
              <button
                type="button"
                onClick={() => setShowTeachersModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
