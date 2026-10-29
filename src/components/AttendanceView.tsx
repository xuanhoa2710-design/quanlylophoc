import React, { useState, useMemo } from 'react';
import {
  useApp,
  normalizeToSchoolDay,
  getWeekSchoolDays,
  getWeekRangeByIndex,
  getWeekIndexFromDate,
  getAllSchoolWeeks,
} from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { VIOLATIONS_CATALOG } from '../data/violationsCatalog';
import {
  CalendarCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Download,
  Calendar,
  PlusCircle,
  FileText,
  Trash2,
  ArrowRight,
  ClipboardList,
  Sparkles,
  RefreshCw,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Link2,
  Phone,
} from 'lucide-react';
import { AccessGuard } from './AccessGuard';
import { getCadreRoleBadge } from './StudentManagement';

const PRESET_REASONS = [
  'Đơn xin phép phụ huynh (ốm đau, khám bệnh)',
  'Đi trễ do hỏng xe / kẹt xe (đã báo GVCN)',
  'Tham gia bồi dưỡng Đội tuyển HSG cấp trường',
  'Tập dượt văn nghệ / Công tác Đoàn thanh niên',
  'Gia đình có việc riêng (phụ huynh gọi điện xin trước)',
  'Xác minh đính chính lại với Sao đỏ / Giám thị',
];

export const AttendanceView: React.FC = () => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    currentStudent,
    currentDateAttendance,
    selectedAttendanceDate,
    setSelectedAttendanceDate,
    updateAttendanceStatus,
    markAllPresent,
    saveAttendanceNote,
    scanQRAttendance,
    supplementaryAttendanceList,
    addSupplementaryAttendance,
    deleteSupplementaryAttendance,
    currentWeek,
    setCurrentWeek,
    disciplineEntries,
    addDisciplineEntry,
    deleteDisciplineEntry,
    getStudentWeeklyScore,
    getWeeklyEmulationSummary,
    triggerAutoWeeklySummary,
  } = useApp();

  if (role === 'teacher' && !isTeacherAuthenticated) {
    return <AccessGuard requiredRole="teacher" pageTitle="Điểm danh & Chuyên cần 12A7" />;
  }

  // Active view tab: 'daily' | 'supplementary'
  const [activeTab, setActiveTab] = useState<'daily' | 'supplementary'>('daily');

  // Filter & Search
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | AttendanceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [suppSearchTerm, setSuppSearchTerm] = useState('');
  const [suppStatusFilter, setSuppStatusFilter] = useState<'all' | AttendanceStatus>('all');

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  // Linked Violation Customization Modal State
  const [violationModalStudentId, setViolationModalStudentId] = useState<string | null>(null);
  const [violationModalStatus, setViolationModalStatus] = useState<AttendanceStatus>('late');
  const [selectedRuleNumber, setSelectedRuleNumber] = useState<number>(1);
  const [customViolationNote, setCustomViolationNote] = useState<string>('');
  const [customViolationPoints, setCustomViolationPoints] = useState<number>(5);

  // Supplementary Attendance Modal State
  const [showSupplementaryModal, setShowSupplementaryModal] = useState(false);
  const [suppStudentId, setSuppStudentId] = useState<string>('');
  const [suppDate, setSuppDate] = useState<string>(selectedAttendanceDate);
  const [suppSession, setSuppSession] = useState<'morning' | 'afternoon' | 'all_day'>('all_day');
  const [suppPreviousStatus, setSuppPreviousStatus] = useState<AttendanceStatus>('unexcused');
  const [suppNewStatus, setSuppNewStatus] = useState<AttendanceStatus>('excused');
  const [suppReason, setSuppReason] = useState<string>('');
  const [suppNote, setSuppNote] = useState<string>('');
  const [suppRecordedBy, setSuppRecordedBy] = useState<string>('Thầy Trương Xuân Hòa (GVCN)');
  const [suppSuccessMsg, setSuppSuccessMsg] = useState<string | null>(null);

  // Note for selected date
  const [noteText, setNoteText] = useState(currentDateAttendance.note || '');
  const [weekendWarning, setWeekendWarning] = useState<string | null>(null);

  const selectedDayInfo = normalizeToSchoolDay(selectedAttendanceDate);
  const weekSchoolDays = getWeekSchoolDays(selectedAttendanceDate);
  const currentWeekRange = getWeekRangeByIndex(currentWeek);
  const allSchoolWeeks = useMemo(() => getAllSchoolWeeks(35), []);
  const weeklySummary = getWeeklyEmulationSummary(currentWeek);

  const canEditAttendance =
    role === 'teacher' ||
    (role === 'student' &&
      currentStudent?.classRole &&
      currentStudent.classRole !== 'Học sinh');

  const handleDateChange = (rawDate: string) => {
    if (!rawDate) return;
    const norm = normalizeToSchoolDay(rawDate);
    if (norm.wasWeekend) {
      setWeekendWarning(
        `Lưu ý: Không điểm danh Thứ 7 và Chủ nhật. Hệ thống đã chuyển về ${norm.dayLabel} (${norm.date}).`
      );
      setTimeout(() => setWeekendWarning(null), 5000);
    } else {
      setWeekendWarning(null);
    }
    setSelectedAttendanceDate(norm.date);
    const targetWeekIdx = getWeekIndexFromDate(norm.date);
    if (targetWeekIdx !== currentWeek) {
      setCurrentWeek(targetWeekIdx);
    }
  };

  const handleSelectWeekRange = (weekIdx: number) => {
    const safeWeek = Math.max(1, Math.min(35, weekIdx));
    setCurrentWeek(safeWeek);
    const range = getWeekRangeByIndex(safeWeek);
    setSelectedAttendanceDate(range.mondayIso);
  };

  // Keep noteText synced when date changes
  React.useEffect(() => {
    setNoteText(currentDateAttendance.note || '');
  }, [selectedAttendanceDate, currentDateAttendance.note]);

  // Map linked violations on the selected date by studentId
  const violationsOnSelectedDateByStudent = useMemo(() => {
    const map: Record<string, typeof disciplineEntries> = {};
    (disciplineEntries || []).forEach((entry) => {
      if (entry.date === selectedAttendanceDate) {
        if (!map[entry.studentId]) map[entry.studentId] = [];
        map[entry.studentId].push(entry);
      }
    });
    return map;
  }, [disciplineEntries, selectedAttendanceDate]);

  // Daily Stats calculation for selected date
  const totalStudents = students.length;
  const records = currentDateAttendance.records || {};
  const presentCount = students.filter((s) => (records[s.id] || 'present') === 'present').length;
  const lateCount = Object.values(records).filter((s) => s === 'late').length;
  const excusedCount = Object.values(records).filter((s) => s === 'excused').length;
  const unexcusedCount = Object.values(records).filter((s) => s === 'unexcused').length;
  const rate =
    totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 100;

  // Filter students for Daily table
  const filteredStudents = useMemo(() => {
    if (role === 'parent') {
      return students.filter((s) => s.id === (currentStudent?.id || 'hs-27'));
    }
    return students.filter((s) => {
      const stuStatus = records[s.id] || 'present';
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = filterGroup === 'all' || s.group === filterGroup;
      const matchStatus = filterStatus === 'all' || stuStatus === filterStatus;
      return matchSearch && matchGroup && matchStatus;
    });
  }, [students, role, currentStudent, searchTerm, filterGroup, filterStatus, records]);

  // Filter supplementary records
  const filteredSupplementaryList = useMemo(() => {
    return supplementaryAttendanceList.filter((item) => {
      if (role === 'parent') {
        if (item.studentId !== (currentStudent?.id || 'hs-27')) return false;
      }
      const matchSearch =
        item.studentName.toLowerCase().includes(suppSearchTerm.toLowerCase()) ||
        item.studentCode.toLowerCase().includes(suppSearchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(suppSearchTerm.toLowerCase()) ||
        item.date.includes(suppSearchTerm);
      const matchStatus = suppStatusFilter === 'all' || item.newStatus === suppStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [supplementaryAttendanceList, role, currentStudent, suppSearchTerm, suppStatusFilter]);

  // Supplementary Stats
  const suppExcusedCount = supplementaryAttendanceList.filter(
    (i) => i.newStatus === 'excused'
  ).length;
  const suppPresentCount = supplementaryAttendanceList.filter(
    (i) => i.newStatus === 'present'
  ).length;
  const suppLateCount = supplementaryAttendanceList.filter((i) => i.newStatus === 'late').length;

  // Open Linked Violation Modal
  const handleOpenViolationLinkModal = (stuId: string) => {
    const curStatus = records[stuId] || 'present';
    setViolationModalStudentId(stuId);
    const nextStatus = curStatus === 'present' ? 'late' : curStatus;
    setViolationModalStatus(nextStatus);

    if (nextStatus === 'late') {
      setSelectedRuleNumber(1);
      setCustomViolationPoints(5);
      setCustomViolationNote('Đi học trễ (Ghi nhận khi điểm danh)');
    } else if (nextStatus === 'excused') {
      setSelectedRuleNumber(8);
      setCustomViolationPoints(5);
      setCustomViolationNote('Vắng học có phép (Đơn xin phép phụ huynh)');
    } else if (nextStatus === 'unexcused') {
      setSelectedRuleNumber(9);
      setCustomViolationPoints(20);
      setCustomViolationNote('Vắng học không phép');
    } else {
      setSelectedRuleNumber(15);
      setCustomViolationPoints(10);
      setCustomViolationNote('');
    }
  };

  const handleRuleSelectionChange = (ruleNum: number) => {
    setSelectedRuleNumber(ruleNum);
    const found = VIOLATIONS_CATALOG.find((v) => v.stt === ruleNum);
    if (found) {
      setCustomViolationPoints(found.pointsDeducted);
      setCustomViolationNote(found.title);
      if (ruleNum === 1 || ruleNum === 5) {
        setViolationModalStatus('late');
      } else if (ruleNum === 8) {
        setViolationModalStatus('excused');
      } else if (ruleNum === 9 || ruleNum === 10) {
        setViolationModalStatus('unexcused');
      }
    }
  };

  const handleSaveLinkedViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!violationModalStudentId) return;
    const stu = students.find((s) => s.id === violationModalStudentId);
    if (!stu) return;
    const rule = VIOLATIONS_CATALOG.find((v) => v.stt === selectedRuleNumber);
    const recorderName =
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa (GVCN)'
        : currentStudent?.name
        ? `${currentStudent.name} (${currentStudent.classRole || 'Ban cán sự'})`
        : 'Ban cán sự 12A7';

    const positivePoints = Math.abs(customViolationPoints || rule?.pointsDeducted || 5);

    if (violationModalStatus !== 'present') {
      updateAttendanceStatus(violationModalStudentId, violationModalStatus, selectedAttendanceDate, {
        ruleNumber: rule?.stt || selectedRuleNumber,
        note: customViolationNote.trim() || rule?.title,
        pointsDeducted: positivePoints,
        recordedBy: recorderName,
      });
    } else {
      // Student is present in class, but committed another rule violation (e.g. uniform, talking)
      updateAttendanceStatus(violationModalStudentId, 'present', selectedAttendanceDate);
      addDisciplineEntry({
        studentId: stu.id,
        studentName: stu.name,
        group: stu.group,
        ruleNumber: rule?.stt || selectedRuleNumber,
        violationText: customViolationNote.trim() || rule?.title || 'Vi phạm nội quy',
        level: rule?.level || 'Mức độ I',
        pointsDeducted: positivePoints,
        note: customViolationNote.trim() || 'Ghi nhận trực tiếp từ Sổ Điểm Danh',
        recordedBy: recorderName,
        date: selectedAttendanceDate,
        weekNumber: getWeekIndexFromDate(selectedAttendanceDate),
      });
    }
    setViolationModalStudentId(null);
  };

  // Open Supplementary modal
  const handleOpenSupplementaryModal = (stuId?: string) => {
    const targetId = stuId || (students[0]?.id ?? '');
    setSuppStudentId(targetId);
    setSuppDate(selectedAttendanceDate);
    setSuppSession('all_day');

    const prev = records[targetId] || 'unexcused';
    setSuppPreviousStatus(prev);
    setSuppNewStatus(prev === 'unexcused' ? 'excused' : 'present');
    setSuppReason('');
    setSuppNote('');
    setSuppRecordedBy(
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa (GVCN)'
        : currentStudent?.name
        ? `${currentStudent.name} (${currentStudent.classRole || 'Học sinh'})`
        : 'Ban cán sự 12A7'
    );
    setSuppSuccessMsg(null);
    setShowSupplementaryModal(true);
  };

  const handleModalStudentChange = (id: string) => {
    setSuppStudentId(id);
    const prev = (currentDateAttendance.records && currentDateAttendance.records[id]) || 'unexcused';
    setSuppPreviousStatus(prev);
    if (prev === 'unexcused') setSuppNewStatus('excused');
  };

  const handleSaveSupplementary = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === suppStudentId);
    if (!stu) return;

    if (!suppReason.trim()) {
      return;
    }

    addSupplementaryAttendance({
      studentId: stu.id,
      studentName: stu.name,
      studentCode: stu.code,
      group: stu.group,
      date: suppDate,
      session: suppSession,
      previousStatus: suppPreviousStatus,
      newStatus: suppNewStatus,
      reason: suppReason.trim(),
      note: suppNote.trim(),
      recordedBy: suppRecordedBy,
    });

    setSuppSuccessMsg(
      `Đã lưu điểm danh bổ sung & tự động đồng bộ điểm thi đua cho em ${stu.name} (${stu.code})!`
    );
    setTimeout(() => {
      setShowSupplementaryModal(false);
      setSuppSuccessMsg(null);
    }, 1100);
  };

  const handleMarkAllPresent = () => {
    markAllPresent(selectedAttendanceDate);
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;
    const res = scanQRAttendance(qrCodeInput);
    setScanResult(res);
    setQrCodeInput('');
  };

  const handleExportDailyReport = () => {
    const rows = [
      [
        'STT',
        'Mã HS',
        'Họ và tên',
        'Tổ',
        'Chức vụ',
        'Trạng thái điểm danh',
        'Lỗi vi phạm liên kết trong ngày',
        'Điểm thi đua tuần',
        'SĐT Phụ huynh',
        'Ngày',
      ],
      ...students.map((s) => {
        const st = records[s.id] || 'present';
        const label = getStatusLabel(st);
        const dayViolations = (violationsOnSelectedDateByStudent[s.id] || [])
          .map((v) => `[Điều ${v.ruleNumber}] ${v.violationText} (-${v.pointsDeducted}đ)`)
          .join('; ');
        const weekScore = getStudentWeeklyScore(s.id, currentWeek).total;
        return [
          s.stt,
          s.code,
          `"${s.name}"`,
          s.group,
          `"${s.classRole || 'Học sinh'}"`,
          `"${label}"`,
          `"${dayViolations || 'Không có'}"`,
          `${weekScore}đ`,
          s.primaryParentPhone,
          selectedAttendanceDate,
        ];
      }),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Diem_danh_12A7_${selectedAttendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSupplementaryReport = () => {
    const rows = [
      [
        'Mã phiếu',
        'Ngày',
        'Buổi',
        'Mã HS',
        'Họ và tên',
        'Tổ',
        'Trạng thái cũ',
        'Trạng thái mới',
        'Lý do bổ sung',
        'Ghi chú',
        'Người xác nhận',
        'Thời gian lập',
      ],
      ...supplementaryAttendanceList.map((item) => [
        item.id,
        item.date,
        item.session === 'morning' ? 'Sáng' : item.session === 'afternoon' ? 'Chiều' : 'Cả ngày',
        item.studentCode,
        `"${item.studentName}"`,
        item.group,
        getStatusLabel(item.previousStatus),
        getStatusLabel(item.newStatus),
        `"${item.reason}"`,
        `"${item.note || ''}"`,
        `"${item.recordedBy}"`,
        item.createdAt,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `So_diem_danh_bo_sung_12A7_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function getStatusLabel(st: AttendanceStatus) {
    switch (st) {
      case 'present':
        return 'Có mặt';
      case 'late':
        return 'Đi trễ (-5đ)';
      case 'excused':
        return 'Vắng có phép (-5đ)';
      case 'unexcused':
        return 'Vắng không phép (-20đ)';
    }
  }

  function getStatusBadgeClass(st: AttendanceStatus) {
    switch (st) {
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'excused':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'unexcused':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  }

  const violationModalStudent = violationModalStudentId
    ? students.find((s) => s.id === violationModalStudentId)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-slate-900">
                  Điểm danh & Liên kết Thi đua 12A7
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  {currentWeekRange.rangeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tự động liên kết 2 chiều với Nội quy trường: <strong className="text-amber-700">Đi trễ (-5đ • Điều 1)</strong>,{' '}
                <strong className="text-blue-700">Vắng có phép (-5đ • Điều 8)</strong>,{' '}
                <strong className="text-red-700">Vắng không phép (-20đ • Điều 9)</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {canEditAttendance && (
              <button
                onClick={() => handleOpenSupplementaryModal()}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 shrink-0" /> Điểm danh bổ sung
              </button>
            )}

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4 shrink-0" /> Quét QR
            </button>

            {activeTab === 'daily' ? (
              <button
                onClick={handleExportDailyReport}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-600 shrink-0" /> Xuất CSV ngày
              </button>
            ) : (
              <button
                onClick={handleExportSupplementaryReport}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-amber-600 shrink-0" /> Xuất Sổ bổ sung
              </button>
            )}

            {canEditAttendance && activeTab === 'daily' && (
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 shrink-0" /> Có mặt tất cả
              </button>
            )}
          </div>
        </div>

        {/* Week Range Selector (Monday to Friday only, NO week numbers) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Week range navigation */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-600" /> Thời gian học (Thứ 2 ➔ Thứ 6):
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSelectWeekRange(currentWeek - 1)}
                  disabled={currentWeek <= 1}
                  className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 shadow-2xs transition-colors"
                  title="Tuần trước (Thứ 2 - Thứ 6)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentWeek}
                  onChange={(e) => handleSelectWeekRange(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs font-extrabold text-blue-900 bg-white border border-blue-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {allSchoolWeeks.map((w) => (
                    <option key={w.weekIndex} value={w.weekIndex}>
                      {w.rangeLabel}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleSelectWeekRange(currentWeek + 1)}
                  disabled={currentWeek >= 35}
                  className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 shadow-2xs transition-colors"
                  title="Tuần kế tiếp (Thứ 2 - Thứ 6)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direct Date Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Chọn ngày cụ thể:</span>
              <input
                type="date"
                value={selectedAttendanceDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 5 School Days Quick Switcher (Thứ 2 -> Thứ 6) - Mobile Scrollable Strip */}
          <div className="grid grid-cols-5 gap-1.5 sm:flex sm:items-center sm:flex-wrap">
            {weekSchoolDays.map((d) => {
              const isSelected = selectedAttendanceDate === d.date;
              const dayRecords = currentDateAttendance.date === d.date ? records : undefined;
              return (
                <button
                  key={d.date}
                  onClick={() => handleDateChange(d.date)}
                  className={`px-2 sm:px-3.5 py-2 text-xs rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                    isSelected
                      ? d.isFriday
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs ring-2 ring-indigo-300'
                        : 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : d.isFriday
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-extrabold">{d.dayLabel}</span>
                  <span
                    className={`text-[10px] sm:text-xs ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {d.shortDate}
                  </span>
                  {d.isFriday && (
                    <span
                      className={`hidden md:inline-block px-1.5 py-0.2 rounded-sm text-[9px] font-black uppercase ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-indigo-200 text-indigo-900'
                      }`}
                    >
                      Chốt tuần
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {weekendWarning && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{weekendWarning}</span>
            </div>
          )}
        </div>

        {/* Attendance Status Filter Cards (Tap to filter!) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mt-4">
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'present' ? 'all' : 'present')}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              filterStatus === 'present'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/70'
            }`}
          >
            <div
              className={`text-[10px] sm:text-[11px] font-bold uppercase ${
                filterStatus === 'present' ? 'text-emerald-100' : 'text-emerald-700'
              }`}
            >
              Có mặt
            </div>
            <div
              className={`text-xl sm:text-2xl font-black mt-0.5 ${
                filterStatus === 'present' ? 'text-white' : 'text-emerald-800'
              }`}
            >
              {presentCount}
            </div>
            <div
              className={`text-[10px] ${
                filterStatus === 'present' ? 'text-emerald-100' : 'text-emerald-600'
              }`}
            >
              Không trừ điểm
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'late' ? 'all' : 'late')}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              filterStatus === 'late'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <div
              className={`text-[10px] sm:text-[11px] font-bold uppercase ${
                filterStatus === 'late' ? 'text-amber-100' : 'text-amber-700'
              }`}
            >
              Đi trễ (Điều 1)
            </div>
            <div
              className={`text-xl sm:text-2xl font-black mt-0.5 ${
                filterStatus === 'late' ? 'text-white' : 'text-amber-800'
              }`}
            >
              {lateCount}
            </div>
            <div
              className={`text-[10px] font-semibold ${
                filterStatus === 'late' ? 'text-amber-100' : 'text-amber-700'
              }`}
            >
              Tự động -5đ/lần
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'excused' ? 'all' : 'excused')}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              filterStatus === 'excused'
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-blue-50/80 border-blue-200 hover:bg-blue-100/70'
            }`}
          >
            <div
              className={`text-[10px] sm:text-[11px] font-bold uppercase ${
                filterStatus === 'excused' ? 'text-blue-100' : 'text-blue-700'
              }`}
            >
              Vắng có phép (Đ8)
            </div>
            <div
              className={`text-xl sm:text-2xl font-black mt-0.5 ${
                filterStatus === 'excused' ? 'text-white' : 'text-blue-800'
              }`}
            >
              {excusedCount}
            </div>
            <div
              className={`text-[10px] font-semibold ${
                filterStatus === 'excused' ? 'text-blue-100' : 'text-blue-700'
              }`}
            >
              Tự động -5đ/buổi
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'unexcused' ? 'all' : 'unexcused')}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              filterStatus === 'unexcused'
                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                : 'bg-red-50/80 border-red-200 hover:bg-red-100/70'
            }`}
          >
            <div
              className={`text-[10px] sm:text-[11px] font-bold uppercase ${
                filterStatus === 'unexcused' ? 'text-red-100' : 'text-red-700'
              }`}
            >
              Không phép (Đ9)
            </div>
            <div
              className={`text-xl sm:text-2xl font-black mt-0.5 ${
                filterStatus === 'unexcused' ? 'text-white' : 'text-red-800'
              }`}
            >
              {unexcusedCount}
            </div>
            <div
              className={`text-[10px] font-semibold ${
                filterStatus === 'unexcused' ? 'text-red-100' : 'text-red-700'
              }`}
            >
              Tự động -20đ/buổi
            </div>
          </button>

          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] sm:text-[11px] font-bold text-indigo-700 uppercase">
              Chuyên cần ngày
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-800 mt-0.5">{rate}%</div>
            <div className="text-[10px] text-indigo-600 font-medium">
              {rate >= 95 ? 'Xuất sắc' : rate >= 90 ? 'Đạt chuẩn' : 'Cần nhắc nhở'}
            </div>
          </div>
        </div>

        {/* Weekly Summary Banner */}
        {(selectedDayInfo.dayIndex === 5 || weeklySummary.isAutoSummarized) && (
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white border border-indigo-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Tổng kết thi đua ({currentWeekRange.rangeLabel})
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300 shrink-0" />
                ĐTB Thi đua Lớp: {weeklySummary.classAvgScore}/100đ • {weeklySummary.perfectCount}/
                {totalStudents} HS đạt chuẩn 100đ
              </h4>
              <p className="text-[11px] text-blue-200">
                Hạng Nhất:{' '}
                <strong className="text-amber-300">
                  Tổ {weeklySummary.groupRankings[0]?.group} ({weeklySummary.groupRankings[0]?.avgScore}đ)
                </strong>{' '}
                • Hạng Nhì:{' '}
                <strong>
                  Tổ {weeklySummary.groupRankings[1]?.group} ({weeklySummary.groupRankings[1]?.avgScore}đ)
                </strong>
              </p>
            </div>

            {role === 'teacher' && (
              <button
                onClick={() => triggerAutoWeeklySummary(currentWeek)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Chốt Tổng kết ({currentWeekRange.shortRangeLabel})
              </button>
            )}
          </div>
        )}

        {/* Note from GVCN */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <span className="text-xs font-bold text-slate-700 shrink-0">
            Ghi chú ({selectedDayInfo.dayLabel} - {selectedAttendanceDate}):
          </span>
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => saveAttendanceNote(noteText, selectedAttendanceDate)}
            placeholder="Ghi nhận lý do vắng, sĩ số, nhắc nhở nề nếp trong ngày..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            disabled={!canEditAttendance}
          />
          {canEditAttendance && (
            <button
              onClick={() => saveAttendanceNote(noteText, selectedAttendanceDate)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
            >
              Lưu ghi chú
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher: Bảng điểm danh ngày vs Sổ Điểm danh bổ sung */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-2.5 px-1 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'daily'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Điểm danh & Lỗi vi phạm ({selectedDayInfo.dayLabel})
        </button>

        <button
          onClick={() => setActiveTab('supplementary')}
          className={`pb-2.5 px-1 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'supplementary'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Sổ Điểm danh bổ sung
          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-100 text-amber-800">
            {supplementaryAttendanceList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE & LINKED VIOLATIONS */}
      {activeTab === 'daily' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilterGroup('all')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                  filterGroup === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Cả lớp ({students.length})
              </button>
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                    filterGroup === g ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Tổ {g}
                </button>
              ))}
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold whitespace-nowrap ml-1"
                >
                  ✕ Bỏ lọc trạng thái
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* MOBILE CARD VIEW (Optimized for Smartphones) */}
          <div className="md:hidden space-y-2.5">
            {filteredStudents.map((stu) => {
              const status = records[stu.id] || 'present';
              const dayViolations = violationsOnSelectedDateByStudent[stu.id] || [];
              const weeklyScoreObj = getStudentWeeklyScore(stu.id, currentWeek);

              return (
                <div
                  key={stu.id}
                  className={`bg-white rounded-2xl p-3.5 border shadow-2xs transition-all ${
                    status === 'unexcused'
                      ? 'border-red-300 bg-red-50/20'
                      : status === 'late'
                      ? 'border-amber-300 bg-amber-50/20'
                      : status === 'excused'
                      ? 'border-blue-300 bg-blue-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Row: Student Info + Weekly Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-slate-800 text-white text-[9px] font-black">
                          #{stu.stt}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {stu.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Tổ {stu.group}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-mono text-blue-700 font-semibold">{stu.code}</span>
                          {stu.classRole && stu.classRole !== 'Học sinh' && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-md border font-bold ${
                                getCadreRoleBadge(stu.classRole).className
                              }`}
                            >
                              {stu.classRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Weekly Emulation Score Badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black border ${
                          weeklyScoreObj.total >= 95
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : weeklyScoreObj.total >= 80
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {weeklyScoreObj.total}đ
                      </span>
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                        Điểm tuần
                      </div>
                    </div>
                  </div>

                  {/* 4 Touch-Friendly Attendance Buttons */}
                  {canEditAttendance ? (
                    <div className="grid grid-cols-4 gap-1.5 mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(stu.id, 'present', selectedAttendanceDate)
                        }
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Có mặt
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(stu.id, 'late', selectedAttendanceDate)
                        }
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                          status === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Đi trễ -5đ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(stu.id, 'excused', selectedAttendanceDate)
                        }
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                          status === 'excused'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Có phép -5đ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(stu.id, 'unexcused', selectedAttendanceDate)
                        }
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                          status === 'unexcused'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        K.Phép -20đ
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusBadgeClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </div>
                  )}

                  {/* Linked Discipline Violations on Selected Date */}
                  {dayViolations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> Lỗi vi phạm liên kết trong ngày:
                      </div>
                      {dayViolations.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px]"
                        >
                          <span className="font-semibold text-rose-900">
                            [Điều {v.ruleNumber}] {v.violationText}{' '}
                            <strong className="text-rose-700 font-black">(-{v.pointsDeducted}đ)</strong>
                          </span>
                          {canEditAttendance && (
                            <button
                              type="button"
                              onClick={() => deleteDisciplineEntry(v.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Xóa lỗi vi phạm này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions Footer */}
                  {canEditAttendance && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenViolationLinkModal(stu.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Gắn / Chỉnh lỗi nội quy
                      </button>

                      <div className="flex items-center gap-1.5">
                        {stu.primaryParentPhone && (
                          <a
                            href={`tel:${stu.primaryParentPhone}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-blue-600" /> Gọi PH
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenSupplementaryModal(stu.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-600" /> Bổ sung
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-2 text-center">Tổ</th>
                    <th className="py-3 px-3">Trạng thái Điểm danh</th>
                    <th className="py-3 px-3">Lỗi vi phạm liên kết ({selectedDayInfo.dayLabel})</th>
                    <th className="py-3 px-3 text-center">Điểm tuần</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stu) => {
                    const status = records[stu.id] || 'present';
                    const isSelectedStudent = stu.id === currentStudent?.id;
                    const dayViolations = violationsOnSelectedDateByStudent[stu.id] || [];
                    const weeklyScoreObj = getStudentWeeklyScore(stu.id, currentWeek);

                    return (
                      <tr
                        key={stu.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelectedStudent && role !== 'teacher' ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          {stu.stt}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{stu.name}</span>
                                {stu.classRole && stu.classRole !== 'Học sinh' && (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-md border font-bold inline-flex items-center gap-0.5 ${
                                      getCadreRoleBadge(stu.classRole).className
                                    }`}
                                  >
                                    <span>{getCadreRoleBadge(stu.classRole).icon}</span>
                                    <span>{stu.classRole}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {stu.code} • PH: {stu.primaryParentPhone || 'Chưa cập nhật'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            Tổ {stu.group}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {canEditAttendance ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(stu.id, 'present', selectedAttendanceDate)
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Có mặt
                              </button>
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(stu.id, 'late', selectedAttendanceDate)
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                  status === 'late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Đi trễ (-5đ)
                              </button>
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(stu.id, 'excused', selectedAttendanceDate)
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                  status === 'excused'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Có phép (-5đ)
                              </button>
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(stu.id, 'unexcused', selectedAttendanceDate)
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                  status === 'unexcused'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                K.Phép (-20đ)
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border ${getStatusBadgeClass(
                                status
                              )}`}
                            >
                              {getStatusLabel(status)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {dayViolations.length > 0 ? (
                            <div className="space-y-1">
                              {dayViolations.map((v) => (
                                <div
                                  key={v.id}
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold mr-1"
                                >
                                  <span>[Điều {v.ruleNumber}] {v.violationText}</span>
                                  <span className="font-black text-rose-600">(-{v.pointsDeducted}đ)</span>
                                  {canEditAttendance && (
                                    <button
                                      type="button"
                                      onClick={() => deleteDisciplineEntry(v.id)}
                                      className="text-rose-400 hover:text-rose-700 ml-0.5"
                                      title="Xóa lỗi vi phạm này"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-medium">
                              ✓ Chấp hành tốt
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-xs border ${
                              weeklyScoreObj.total >= 95
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : weeklyScoreObj.total >= 80
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {weeklyScoreObj.total}đ
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {canEditAttendance && (
                              <button
                                onClick={() => handleOpenViolationLinkModal(stu.id)}
                                className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                                title="Gắn hoặc chỉnh điều khoản vi phạm nội quy"
                              >
                                <ShieldAlert className="w-3 h-3" /> Lỗi
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenSupplementaryModal(stu.id)}
                              className="px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                              title="Ghi nhận điểm danh bổ sung / đơn xin phép"
                            >
                              <PlusCircle className="w-3 h-3 text-amber-600" /> Bổ sung
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SỔ ĐIỂM DANH BỔ SUNG */}
      {activeTab === 'supplementary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Tổng số lượt bổ sung</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {supplementaryAttendanceList.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tự động đồng bộ thi đua</div>
            </div>
            <div className="bg-blue-50 p-3.5 sm:p-4 rounded-2xl border border-blue-100 shadow-xs">
              <div className="text-xs font-bold text-blue-700">Chuyển sang "Có phép"</div>
              <div className="text-xl sm:text-2xl font-black text-blue-900 mt-1">
                {suppExcusedCount}
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">Điều 8 (-5đ)</div>
            </div>
            <div className="bg-amber-50 p-3.5 sm:p-4 rounded-2xl border border-amber-100 shadow-xs">
              <div className="text-xs font-bold text-amber-700">Chuyển sang "Đi trễ"</div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">{suppLateCount}</div>
              <div className="text-[11px] text-amber-600 mt-0.5">Điều 1 (-5đ)</div>
            </div>
            <div className="bg-emerald-50 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-xs font-bold text-emerald-700">Đính chính "Có mặt"</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
                {suppPresentCount}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Hoàn lại điểm thi đua</div>
            </div>
          </div>

          {/* Filter and Search Bar for Supplementary History */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSuppStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                  suppStatusFilter === 'all' ? 'bg-amber-500 text-white' : 'text-slate-600'
                }`}
              >
                Tất cả ({supplementaryAttendanceList.length})
              </button>
              <button
                onClick={() => setSuppStatusFilter('excused')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                  suppStatusFilter === 'excused' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Có phép ({suppExcusedCount})
              </button>
              <button
                onClick={() => setSuppStatusFilter('late')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                  suppStatusFilter === 'late' ? 'bg-amber-500 text-white' : 'text-slate-600'
                }`}
              >
                Đi trễ ({suppLateCount})
              </button>
              <button
                onClick={() => setSuppStatusFilter('present')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                  suppStatusFilter === 'present' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                Có mặt ({suppPresentCount})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, lý do, ngày..."
                value={suppSearchTerm}
                onChange={(e) => setSuppSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {filteredSupplementaryList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">
                  Chưa có bản ghi điểm danh bổ sung nào phù hợp
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Nhấn vào nút "Điểm danh bổ sung" để thêm đơn xin phép hoặc đính chính chuyên cần.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Ngày & Buổi</th>
                      <th className="py-3 px-4">Học sinh</th>
                      <th className="py-3 px-4">Thay đổi trạng thái</th>
                      <th className="py-3 px-4">Lý do & Ghi chú bổ sung</th>
                      <th className="py-3 px-4">Người ghi nhận</th>
                      {role === 'teacher' && <th className="py-3 px-4 text-center w-16">Xóa</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSupplementaryList.map((item) => {
                      const sessionLabel =
                        item.session === 'morning'
                          ? 'Sáng'
                          : item.session === 'afternoon'
                          ? 'Chiều'
                          : 'Cả ngày';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{item.date}</div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 font-semibold">
                              {sessionLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.studentName}</div>
                            <div className="text-[10px] text-blue-700 font-mono">
                              {item.studentCode} • Tổ {item.group}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${getStatusBadgeClass(
                                  item.previousStatus
                                )}`}
                              >
                                {getStatusLabel(item.previousStatus)}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span
                                className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border shadow-2xs ${getStatusBadgeClass(
                                  item.newStatus
                                )}`}
                              >
                                {getStatusLabel(item.newStatus)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-800 text-[11px]">{item.reason}</div>
                            {item.note && (
                              <div className="text-[10px] text-slate-500 mt-0.5 italic">
                                {item.note}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-700 text-[11px]">
                              {item.recordedBy}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.createdAt}
                            </div>
                          </td>
                          {role === 'teacher' && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteSupplementaryAttendance(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Xóa bản ghi bổ sung này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: LIÊN KẾT ĐIỂM DANH & LỖI VI PHẠM NỘI QUY */}
      {violationModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-8 border border-slate-100">
            <button
              onClick={() => setViolationModalStudentId(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Liên kết Điểm danh & Lỗi Vi phạm
                </h3>
                <p className="text-xs text-slate-500">
                  Học sinh: <strong className="text-slate-800">{violationModalStudent.name}</strong> (Tổ{' '}
                  {violationModalStudent.group}) • Ngày {selectedAttendanceDate}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveLinkedViolation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  1. Trạng thái chuyên cần trong ngày:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'late', label: 'Đi trễ (-5đ)', ruleNum: 1 },
                      { id: 'excused', label: 'Có phép (-5đ)', ruleNum: 8 },
                      { id: 'unexcused', label: 'K.Phép (-20đ)', ruleNum: 9 },
                      { id: 'present', label: 'Có mặt (Lỗi khác)', ruleNum: 15 },
                    ] as const
                  ).map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => {
                        setViolationModalStatus(opt.id);
                        handleRuleSelectionChange(opt.ruleNum);
                      }}
                      className={`py-2 px-2 rounded-xl font-bold border text-center transition-all ${
                        violationModalStatus === opt.id
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Điều khoản Nội quy THPT Vĩnh Lộc B:
                </label>
                <select
                  value={selectedRuleNumber}
                  onChange={(e) => handleRuleSelectionChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  {VIOLATIONS_CATALOG.map((v) => (
                    <option key={v.stt} value={v.stt}>
                      [Điều {v.stt}] {v.title} (-{v.pointsDeducted}đ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    3. Nội dung ghi nhận vào Sổ Thi Đua:
                  </label>
                  <input
                    type="text"
                    value={customViolationNote}
                    onChange={(e) => setCustomViolationNote(e.target.value)}
                    placeholder="Nhập chi tiết lỗi vi phạm..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm trừ (-):</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={customViolationPoints}
                    onChange={(e) => setCustomViolationPoints(Math.abs(Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 font-black focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setViolationModalStudentId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Lưu Điểm danh & Ghi Sổ Thi Đua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GHI NHẬN ĐIỂM DANH BỔ SUNG */}
      {showSupplementaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-8 border border-slate-100">
            <button
              onClick={() => setShowSupplementaryModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Ghi Nhận Điểm Danh Bổ Sung</h3>
                <p className="text-xs text-slate-500">
                  Cập nhật đơn xin phép và tự động điều chỉnh lỗi vi phạm tương ứng
                </p>
              </div>
            </div>

            {suppSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{suppSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveSupplementary} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    1. Học sinh 12A7: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={suppStudentId}
                    onChange={(e) => handleModalStudentChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        STT {s.stt} - {s.name} ({s.code}) • Tổ {s.group}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      2. Ngày áp dụng: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={suppDate}
                      onChange={(e) => setSuppDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Buổi điểm danh:</label>
                    <select
                      value={suppSession}
                      onChange={(e) => setSuppSession(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all_day">Cả ngày (Sáng & Chiều)</option>
                      <option value="morning">Buổi Sáng (Tiết 1 - 4)</option>
                      <option value="afternoon">Buổi Chiều (Tiết 1 - 3)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">
                      Trạng thái trước đó:
                    </label>
                    <select
                      value={suppPreviousStatus}
                      onChange={(e) => setSuppPreviousStatus(e.target.value as AttendanceStatus)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 text-xs"
                    >
                      <option value="unexcused">Vắng không phép (-20đ)</option>
                      <option value="late">Đi trễ (-5đ)</option>
                      <option value="excused">Vắng có phép (-5đ)</option>
                      <option value="present">Có mặt</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-emerald-700">
                      Cập nhật thành mới:
                    </label>
                    <select
                      value={suppNewStatus}
                      onChange={(e) => setSuppNewStatus(e.target.value as AttendanceStatus)}
                      className="w-full px-2.5 py-1.5 rounded-lg border-2 border-emerald-400 bg-emerald-50/50 font-bold text-emerald-900 text-xs"
                    >
                      <option value="excused">Vắng có phép (Đơn PH • -5đ)</option>
                      <option value="present">Có mặt (Đính chính • 0đ)</option>
                      <option value="late">Đi trễ (Điều 1 • -5đ)</option>
                      <option value="unexcused">Vắng không phép (Điều 9 • -20đ)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    4. Lý do bổ sung: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_REASONS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSuppReason(preset)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                          suppReason === preset
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={suppReason}
                    onChange={(e) => setSuppReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    5. Ghi chú minh chứng (nếu có):
                  </label>
                  <input
                    type="text"
                    value={suppNote}
                    onChange={(e) => setSuppNote(e.target.value)}
                    placeholder="VD: Phụ huynh đã gọi điện thoại lúc 7h15, nộp đơn qua Zalo..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplementaryModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Lưu & Đồng bộ Thi Đua
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Attendance Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowQrModal(false);
                setScanResult(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              ✕
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Điểm danh bằng QR Code</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lớp 12A7 • Ngày {selectedAttendanceDate}
              </p>
            </div>

            <form onSubmit={handleScanSubmit} className="mt-4 space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                Nhập mã học sinh hoặc tên để điểm danh nhanh:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: 2612A7001 hoặc tên học sinh..."
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </form>

            {scanResult && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  scanResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{scanResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
