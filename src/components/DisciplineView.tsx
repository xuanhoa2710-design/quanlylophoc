import React, { useState, useMemo } from 'react';
import {
  useApp,
  getWeekRangeByIndex,
  getWeekIndexFromDate,
  getAllSchoolWeeks,
} from '../context/AppContext';
import { StudentDisciplineEntry, BonusPointEntry } from '../types';
import { VIOLATIONS_CATALOG, BONUS_PRESETS, ViolationRule } from '../data/violationsCatalog';
import {
  Scale,
  Award,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  FileText,
  X,
  Info,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Edit2,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Undo2,
  Link2,
} from 'lucide-react';

export const DisciplineView: React.FC = () => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    activeStudentId,
    currentStudent,
    currentWeek,
    setCurrentWeek,
    selectedAttendanceDate,
    setSelectedAttendanceDate,
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
    getStudentWeeklyScore,
    getWeeklyEmulationSummary,
    triggerAutoWeeklySummary,
    appConfig,
  } = useApp();

  const currentWeekRange = getWeekRangeByIndex(currentWeek);
  const allSchoolWeeks = useMemo(() => getAllSchoolWeeks(35), []);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | '100' | 'deducted'>('all');

  // Modals
  const [showAddViolationModal, setShowAddViolationModal] = useState(false);
  const [showAddBonusModal, setShowAddBonusModal] = useState(false);
  const [showRulesCatalogModal, setShowRulesCatalogModal] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<string | null>(null);

  // Form states for Add Violation
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'hs-1');
  const [selectedRuleNumber, setSelectedRuleNumber] = useState<number>(1);
  const [customPointsDeducted, setCustomPointsDeducted] = useState<number>(5);
  const [violationDate, setViolationDate] = useState<string>(
    selectedAttendanceDate || currentWeekRange.mondayIso
  );
  const [violationNote, setViolationNote] = useState<string>('');
  const [recordedByTitle, setRecordedByTitle] = useState<string>('Thầy Trương Xuân Hòa (GVCN)');

  // Form states for Add Bonus
  const [bonusTargetType, setBonusTargetType] = useState<'student' | 'group'>('student');
  const [bonusStudentId, setBonusStudentId] = useState<string>(students[0]?.id || 'hs-1');
  const [bonusGroupNumber, setBonusGroupNumber] = useState<number>(1);
  const [bonusReason, setBonusReason] = useState<string>(BONUS_PRESETS[0].reason);
  const [bonusPoints, setBonusPoints] = useState<number>(BONUS_PRESETS[0].points);
  const [bonusDate, setBonusDate] = useState<string>(
    selectedAttendanceDate || currentWeekRange.mondayIso
  );

  // Form states for Sửa điểm thi đua của GVCN
  const [showEditScoreModal, setShowEditScoreModal] = useState(false);
  const [editScoreStudentId, setEditScoreStudentId] = useState<string>(students[0]?.id || 'hs-1');
  const [editScoreWeek, setEditScoreWeek] = useState<number>(currentWeek);
  const [editScoreValue, setEditScoreValue] = useState<number>(100);
  const [editScoreReason, setEditScoreReason] = useState<string>('GVCN đánh giá lại sự tiến bộ & nề nếp tuần');
  const [editScoreAdjustedBy, setEditScoreAdjustedBy] = useState<string>(
    appConfig.teacherName ? `${appConfig.teacherName} (GVCN)` : 'Thầy Trương Xuân Hòa (GVCN)'
  );

  // Form states for Sửa Lỗi Vi Phạm
  const [editingViolation, setEditingViolation] = useState<StudentDisciplineEntry | null>(null);
  const [editViolationRuleNumber, setEditViolationRuleNumber] = useState<number>(1);
  const [editViolationPointsDeducted, setEditViolationPointsDeducted] = useState<number>(5);
  const [editViolationDate, setEditViolationDate] = useState<string>('');
  const [editViolationNote, setEditViolationNote] = useState<string>('');
  const [editViolationRecordedBy, setEditViolationRecordedBy] = useState<string>('Thầy Trương Xuân Hòa (GVCN)');

  // Form states for Sửa Điểm Cộng
  const [editingBonus, setEditingBonus] = useState<BonusPointEntry | null>(null);
  const [editBonusReason, setEditBonusReason] = useState<string>('');
  const [editBonusPoints, setEditBonusPoints] = useState<number>(5);
  const [editBonusDate, setEditBonusDate] = useState<string>('');
  const [editBonusRecordedBy, setEditBonusRecordedBy] = useState<string>('Thầy Trương Xuân Hòa (GVCN)');

  // Handlers for Sửa điểm thi đua
  const handleOpenEditScore = (studentId: string, week = currentWeek) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    setEditScoreStudentId(studentId);
    setEditScoreWeek(week);
    const score = getStudentWeeklyScore(studentId, week);
    setEditScoreValue(score.total);
    setEditScoreReason(
      score.adjustment?.reason || 'GVCN ghi nhận nỗ lực phấn đấu & khắc phục nề nếp'
    );
    setEditScoreAdjustedBy(
      appConfig.teacherName ? `${appConfig.teacherName} (GVCN)` : 'Thầy Trương Xuân Hòa (GVCN)'
    );
    setShowEditScoreModal(true);
  };

  const handleStudentOrWeekChangeInEdit = (stuId: string, wk: number) => {
    setEditScoreStudentId(stuId);
    setEditScoreWeek(wk);
    const score = getStudentWeeklyScore(stuId, wk);
    setEditScoreValue(score.total);
    if (score.adjustment?.reason) {
      setEditScoreReason(score.adjustment.reason);
    }
  };

  const handleSaveEditedScore = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === editScoreStudentId);
    if (!student) return;

    const currentScore = getStudentWeeklyScore(student.id, editScoreWeek);

    setEmulationScoreAdjustment({
      studentId: student.id,
      studentName: student.name,
      group: student.group,
      weekNumber: editScoreWeek,
      adjustedScore: Number(editScoreValue),
      autoCalculatedScore: currentScore.autoScore,
      reason: editScoreReason.trim() || 'GVCN điều chỉnh điểm thi đua tuần',
      adjustedBy: editScoreAdjustedBy.trim() || 'Thầy Trương Xuân Hòa (GVCN)',
    });

    setShowEditScoreModal(false);
  };

  const handleResetToAutoScore = () => {
    removeEmulationScoreAdjustment(editScoreStudentId, editScoreWeek);
    const score = getStudentWeeklyScore(editScoreStudentId, editScoreWeek);
    setEditScoreValue(score.autoScore);
    setShowEditScoreModal(false);
  };

  // Handlers for Edit Violation
  const handleStartEditViolation = (v: StudentDisciplineEntry) => {
    setEditingViolation(v);
    setEditViolationRuleNumber(v.ruleNumber);
    setEditViolationPointsDeducted(v.pointsDeducted);
    setEditViolationDate(v.date);
    setEditViolationNote(v.note || '');
    setEditViolationRecordedBy(v.recordedBy);
  };

  const handleSaveEditViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingViolation) return;
    const rule = VIOLATIONS_CATALOG.find((r) => r.stt === editViolationRuleNumber);
    updateDisciplineEntry(editingViolation.id, {
      ruleNumber: editViolationRuleNumber,
      violationText: rule ? rule.title : editingViolation.violationText,
      level: rule ? rule.level : editingViolation.level,
      pointsDeducted: editViolationPointsDeducted,
      date: editViolationDate,
      note: editViolationNote.trim() || undefined,
      recordedBy: editViolationRecordedBy,
    });
    setEditingViolation(null);
  };

  // Handlers for Edit Bonus
  const handleStartEditBonus = (b: BonusPointEntry) => {
    setEditingBonus(b);
    setEditBonusReason(b.reason);
    setEditBonusPoints(b.pointsAdded);
    setEditBonusDate(b.date);
    setEditBonusRecordedBy(b.recordedBy);
  };

  const handleSaveEditBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBonus) return;
    updateBonusPointEntry(editingBonus.id, {
      reason: editBonusReason.trim(),
      pointsAdded: editBonusPoints,
      date: editBonusDate,
      recordedBy: editBonusRecordedBy,
    });
    setEditingBonus(null);
  };

  // Quick preset rule selection
  const handleRuleSelect = (ruleStt: number) => {
    setSelectedRuleNumber(ruleStt);
    const rule = VIOLATIONS_CATALOG.find((r) => r.stt === ruleStt);
    if (rule) {
      setCustomPointsDeducted(rule.pointsDeducted);
    }
  };

  const handleSaveViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const rule = VIOLATIONS_CATALOG.find((r) => r.stt === selectedRuleNumber);
    const text = rule ? rule.title : 'Vi phạm nội quy trường học';
    const level = rule ? rule.level : 'Mức độ III';

    addDisciplineEntry({
      studentId: student.id,
      studentName: student.name,
      group: student.group,
      weekNumber: currentWeek,
      date: violationDate,
      ruleNumber: selectedRuleNumber,
      violationText: text,
      level,
      pointsDeducted: customPointsDeducted,
      note: violationNote.trim() || undefined,
      recordedBy: recordedByTitle,
    });

    setViolationNote('');
    setShowAddViolationModal(false);
  };

  const handleSaveBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (bonusTargetType === 'student') {
      const student = students.find((s) => s.id === bonusStudentId);
      if (!student) return;
      addBonusPointEntry({
        studentId: student.id,
        studentName: student.name,
        group: student.group,
        weekNumber: currentWeek,
        date: bonusDate,
        reason: bonusReason,
        pointsAdded: bonusPoints,
        recordedBy: 'Thầy Trương Xuân Hòa (GVCN)',
      });
    } else {
      addBonusPointEntry({
        group: bonusGroupNumber,
        weekNumber: currentWeek,
        date: bonusDate,
        reason: `Cộng điểm cả Tổ ${bonusGroupNumber}: ${bonusReason}`,
        pointsAdded: bonusPoints,
        recordedBy: 'Thầy Trương Xuân Hòa (GVCN)',
      });
    }

    setShowAddBonusModal(false);
  };

  // Compute stats for current week
  const allWeeklyData = students.map((s) => ({
    student: s,
    ...getStudentWeeklyScore(s.id, currentWeek),
  }));

  const totalClassPoints = allWeeklyData.reduce((sum, item) => sum + item.total, 0);
  const avgClassPoints = Number((totalClassPoints / students.length).toFixed(1));
  const perfectStudents = allWeeklyData.filter((i) => i.total >= 100);
  const deductedStudents = allWeeklyData.filter((i) => i.deducted > 0);

  // Group stats
  const groupAverages = [1, 2, 3, 4].map((g) => {
    const groupStudents = allWeeklyData.filter((i) => i.student.group === g);
    const avg =
      groupStudents.length > 0
        ? Number(
            (
              groupStudents.reduce((sum, item) => sum + item.total, 0) /
              groupStudents.length
            ).toFixed(1)
          )
        : 100;
    return { group: g, avg, count: groupStudents.length };
  });
  const bestGroup = [...groupAverages].sort((a, b) => b.avg - a.avg)[0];
  const weeklySummary = getWeeklyEmulationSummary(currentWeek);

  const handleExportWeeklySummaryCSV = () => {
    const rows = [
      [`BẢNG TỔNG KẾT THI ĐUA (${currentWeekRange.rangeLabel}) - LỚP ${appConfig.className}`],
      [`Thời gian áp dụng: ${currentWeekRange.rangeLabel} (Thứ 2 đến Thứ 6)`],
      [`Trạng thái: ${weeklySummary.statusLabel}`],
      [],
      ['STT', 'Mã HS', 'Họ và tên', 'Tổ', 'Điểm khởi đầu', 'Điểm cộng', 'Điểm trừ', 'Tổng điểm', 'Xếp loại rèn luyện', 'Chi tiết vi phạm / khen thưởng'],
      ...allWeeklyData.map((item) => {
        const stu = item.student;
        const details = [
          ...item.violations.map((v) => `-${v.pointsDeducted}đ: ${v.violationText} (${v.date})`),
          ...item.bonuses.map((b) => `+${b.pointsAdded}đ: ${b.reason} (${b.date})`),
        ].join('; ');
        return [
          stu.stt,
          stu.code,
          `"${stu.name}"`,
          `Tổ ${stu.group}`,
          100,
          item.bonus,
          item.deducted,
          item.total,
          `"${item.classification}"`,
          `"${details || 'Giữ trọn 100đ nề nếp tốt'}"`,
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tong_Ket_Thi_Dua_${currentWeekRange.mondayIso}_den_${currentWeekRange.fridayIso}_Lop_12A7.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered students for table
  const displayedStudents = allWeeklyData.filter((item) => {
    const s = item.student;
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = filterGroup === 'all' || s.group === filterGroup;
    const matchLevel =
      filterLevel === 'all'
        ? true
        : filterLevel === '100'
        ? item.total >= 100
        : item.deducted > 0;
    return matchSearch && matchGroup && matchLevel;
  });

  // Sort displayed students by score descending
  const sortedStudents = [...displayedStudents].sort((a, b) => b.total - a.total);

  const getBadgeStyle = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
  };

  const getClassification = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 75) return 'Khá';
    if (score >= 50) return 'Trung bình';
    return 'Yếu / Cần rèn luyện';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-2 border border-white/10">
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>QUY CHUẨN THI ĐUA NỘI QUY • TRƯỜNG THPT VĨNH LỘC B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Quản Lý Điểm Thi Đua & Nề Nếp Lớp {appConfig.className}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Mỗi học sinh mỗi tuần khởi đầu với <strong>100 điểm trọn vẹn</strong>. Điểm trừ được áp dụng nghiêm ngặt theo <em>Thang điểm thi đua học sinh (Nội quy - Chuyên cần - Phong trào - Sổ đầu bài)</em> do Trường THPT Vĩnh Lộc B ban hành ngày 05/09/2026.
            </p>
          </div>

          {/* Week Range Selector (Monday - Friday only, NO week numbers) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  const nextW = Math.max(1, currentWeek - 1);
                  setCurrentWeek(nextW);
                  setSelectedAttendanceDate(getWeekRangeByIndex(nextW).mondayIso);
                }}
                disabled={currentWeek <= 1}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-40 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={currentWeek}
                onChange={(e) => {
                  const nextW = Number(e.target.value);
                  setCurrentWeek(nextW);
                  setSelectedAttendanceDate(getWeekRangeByIndex(nextW).mondayIso);
                }}
                className="bg-transparent text-white font-black text-xs sm:text-sm focus:outline-hidden cursor-pointer"
              >
                {allSchoolWeeks.map((w) => (
                  <option key={w.weekIndex} value={w.weekIndex} className="text-slate-900 font-bold">
                    {w.rangeLabel}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const nextW = Math.min(35, currentWeek + 1);
                  setCurrentWeek(nextW);
                  setSelectedAttendanceDate(getWeekRangeByIndex(nextW).mondayIso);
                }}
                disabled={currentWeek >= 35}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-40 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowRulesCatalogModal(true)}
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Bảng Thang Điểm Trường
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Điểm TB Lớp ({currentWeekRange.shortRangeLabel})
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {avgClassPoints} <span className="text-xs font-normal text-slate-400">/ 100 đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sĩ số: {students.length} học sinh</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Giữ trọn 100 điểm
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {perfectStudents.length} <span className="text-xs font-normal text-slate-400">em</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {Math.round((perfectStudents.length / students.length) * 100)}% nề nếp xuất sắc
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Có lỗi vi phạm
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">
            {deductedStudents.length} <span className="text-xs font-normal text-slate-400">em</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Tự động liên kết từ Điểm danh
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Tổ dẫn đầu thi đua
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">
            Tổ {bestGroup?.group}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ĐTB: {bestGroup?.avg} điểm ({bestGroup?.count} bạn)
          </div>
        </div>
      </div>

      {/* Automatic Post-Friday Weekly Emulation Summary Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-indigo-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {weeklySummary.statusLabel}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
                {currentWeekRange.rangeLabel} (Thứ 2 ➔ Thứ 6)
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              Bảng Tổng Kết Thi Đua ({currentWeekRange.rangeLabel})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động đồng bộ 2 chiều với bảng Điểm danh (Đi trễ -5đ, Vắng có phép -5đ, Vắng không phép -20đ) và xếp hạng 4 Tổ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {role === 'teacher' && (
              <button
                onClick={() => triggerAutoWeeklySummary(currentWeek)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Cập nhật chốt sổ Thứ 6
              </button>
            )}
            <button
              onClick={handleExportWeeklySummaryCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" /> Xuất Báo cáo (.csv)
            </button>
          </div>
        </div>

        {/* 4 Group Emulation Rankings */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
            Xếp hạng thi đua 4 Tổ ({currentWeekRange.rangeLabel})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {weeklySummary.groupRankings.map((grp) => (
              <div
                key={grp.group}
                className={`p-3.5 rounded-2xl border transition-all ${
                  grp.rank === 1
                    ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-300 shadow-xs'
                    : grp.rank === 2
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-slate-800">{grp.flagTitle}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      grp.rank === 1
                        ? 'bg-amber-500 text-white'
                        : grp.rank === 2
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tổ {grp.group}
                  </span>
                </div>
                <div className="text-2xl font-black text-indigo-900">
                  {grp.avgScore} <span className="text-xs font-semibold text-slate-500">điểm TB</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                  <span>Đạt 100đ: <strong>{grp.perfectCount}/{grp.totalCount} HS</strong></span>
                  <span>Vi phạm: <strong className={grp.violationCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>{grp.violationCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Student / Parent View: Individual Student Weekly Card */}
      {(role === 'student' || role === 'parent') && currentStudent && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={currentStudent.avatar}
                alt={currentStudent.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {role === 'student' ? 'Phiếu Thi Đua Cá Nhân Của Bạn' : `Phiếu Thi Đua Con: ${currentStudent.name}`}
                </span>
                <h3 className="text-xl font-black text-slate-900">{currentStudent.name}</h3>
                <p className="text-xs text-slate-500">
                  Mã số: {currentStudent.code} • Tổ {currentStudent.group} • {currentStudent.classRole}
                </p>
              </div>
            </div>

            {/* Score Pill */}
            {(() => {
              const myScore = getStudentWeeklyScore(currentStudent.id, currentWeek);
              return (
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Khởi điểm</div>
                    <div className="text-base font-black text-slate-700">100đ</div>
                  </div>
                  <div className="text-center text-rose-600">
                    <div className="text-[10px] font-bold uppercase">Bị trừ</div>
                    <div className="text-base font-black">-{myScore.deducted}đ</div>
                  </div>
                  <div className="text-center text-emerald-600">
                    <div className="text-[10px] font-bold uppercase">Điểm cộng</div>
                    <div className="text-base font-black">+{myScore.bonus}đ</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">Tổng điểm ({currentWeekRange.shortRangeLabel})</div>
                    <div className="text-2xl font-black text-blue-700">{myScore.total}đ</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-black border ${getBadgeStyle(
                      myScore.total
                    )}`}
                  >
                    {myScore.classification}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Violations List for Current Student */}
          {(() => {
            const myScore = getStudentWeeklyScore(currentStudent.id, currentWeek);
            return (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chi tiết vi phạm & điểm cộng ({currentWeekRange.rangeLabel})
                </h4>

                {myScore.violations.length === 0 && myScore.bonuses.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Chúc mừng bạn! Trong tuần ({currentWeekRange.rangeLabel}) bạn chưa có lỗi vi phạm nào, giữ trọn 100 điểm thi đua!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myScore.violations.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-rose-950 flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-black">
                              Điều {v.ruleNumber}
                            </span>
                            <span>{v.violationText}</span>
                          </div>
                          {v.note && (
                            <div className="text-[11px] text-slate-600 mt-1">
                              <strong>Ghi chú:</strong> {v.note}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                            <span>Ngày: {v.date}</span>
                            <span>•</span>
                            <span>Người ghi nhận: {v.recordedBy}</span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-rose-600 shrink-0">
                          -{v.pointsDeducted}đ
                        </span>
                      </div>
                    ))}

                    {myScore.bonuses.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-emerald-950 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{b.reason}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                            <span>Ngày: {b.date}</span>
                            <span>•</span>
                            <span>Người ghi nhận: {b.recordedBy}</span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-emerald-600 shrink-0">
                          +{b.pointsAdded}đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Control Actions & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm học sinh theo tên, mã số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterGroup('all')}
              className={`px-2.5 py-1 rounded-lg ${filterGroup === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
            >
              Cả lớp
            </button>
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className={`px-2.5 py-1 rounded-lg ${filterGroup === g ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                Tổ {g}
              </button>
            ))}
          </div>

          {/* Score Level Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-2.5 py-1 rounded-lg ${filterLevel === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterLevel('100')}
              className={`px-2.5 py-1 rounded-lg ${filterLevel === '100' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-600'}`}
            >
              100đ trọn vẹn
            </button>
            <button
              onClick={() => setFilterLevel('deducted')}
              className={`px-2.5 py-1 rounded-lg ${filterLevel === 'deducted' ? 'bg-white shadow-xs text-rose-600' : 'text-slate-600'}`}
            >
              Bị trừ điểm
            </button>
          </div>
        </div>

        {/* Teacher Action Buttons */}
        {role === 'teacher' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEditScore(students[0]?.id || 'hs-1', currentWeek)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Sửa / điều chỉnh điểm thi đua học sinh theo tuần"
            >
              <SlidersHorizontal className="w-4 h-4" /> Sửa Điểm Thi Đua
            </button>

            <button
              onClick={() => setShowAddBonusModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" /> Cộng Điểm Thi Đua
            </button>

            <button
              onClick={() => setShowAddViolationModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Ghi Nhận Lỗi Vi Phạm
            </button>
          </div>
        )}
      </div>

      {/* Main Class Emulation List (Mobile Cards + Desktop Table) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Bảng Tổng Hợp Điểm Thi Đua ({currentWeekRange.rangeLabel})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiển thị {sortedStudents.length}/{students.length} học sinh 12A7 • Khởi điểm 100đ
            </p>
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden divide-y divide-slate-100">
          {sortedStudents.map((item, index) => {
            const s = item.student;
            return (
              <div
                key={s.id}
                className={`p-3.5 ${item.deducted > 0 ? 'bg-rose-50/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div
                        className="font-bold text-slate-900 text-sm truncate cursor-pointer"
                        onClick={() => setSelectedStudentHistory(s.id)}
                      >
                        {s.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-mono text-blue-700 font-semibold">{s.code}</span>
                        <span>• Tổ {s.group}</span>
                        {s.classRole && s.classRole !== 'Học sinh' && (
                          <span className="px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-900 font-bold">
                            {s.classRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-slate-900">{item.total}đ</div>
                    <span
                      className={`inline-block px-2 py-0.2 rounded-md text-[10px] font-black border ${getBadgeStyle(
                        item.total
                      )}`}
                    >
                      {item.classification}
                    </span>
                  </div>
                </div>

                {/* Violations / Bonuses inline preview */}
                {(item.violations.length > 0 || item.bonuses.length > 0) && (
                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                    {item.violations.map((v) => (
                      <div
                        key={v.id}
                        className="text-[11px] text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          <strong>[Đ{v.ruleNumber}]</strong> {v.violationText} ({v.date})
                        </span>
                        <span className="font-black text-rose-600 shrink-0">-{v.pointsDeducted}đ</span>
                      </div>
                    ))}
                    {item.bonuses.map((b) => (
                      <div
                        key={b.id}
                        className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{b.reason}</span>
                        <span className="font-black text-emerald-600 shrink-0">+{b.pointsAdded}đ</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">Gốc: <strong>100đ</strong></span>
                    {item.deducted > 0 && (
                      <span className="text-rose-600 font-bold">Trừ: -{item.deducted}đ</span>
                    )}
                    {item.bonus > 0 && (
                      <span className="text-emerald-600 font-bold">Cộng: +{item.bonus}đ</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {role === 'teacher' && (
                      <button
                        onClick={() => handleOpenEditScore(s.id, currentWeek)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200"
                      >
                        Sửa điểm
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedStudentHistory(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-12">Hạng</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-3 text-center">Tổ</th>
                <th className="py-3 px-3 text-center">Vai trò</th>
                <th className="py-3 px-3 text-center">Khởi điểm</th>
                <th className="py-3 px-3 text-center text-rose-600">Điểm trừ (-)</th>
                <th className="py-3 px-3 text-center text-emerald-600">Điểm cộng (+)</th>
                <th className="py-3 px-4 text-center">Tổng Điểm</th>
                <th className="py-3 px-4 text-center">Xếp loại</th>
                <th className="py-3 px-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sortedStudents.map((item, index) => {
                const s = item.student;
                const isTop1 = index === 0 && item.total >= 100;
                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.deducted > 0 ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      {isTop1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs inline-flex items-center justify-center">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">{index + 1}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedStudentHistory(s.id)}>
                            {s.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{s.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        Tổ {s.group}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {s.classRole && s.classRole !== 'Học sinh' ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                          {s.classRole}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-500 font-bold">100</td>

                    <td className="py-3 px-3 text-center">
                      {item.deducted > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[11px]">
                          -{item.deducted}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {item.bonus > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-black text-[11px]">
                          +{item.bonus}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-slate-900">
                          {item.total} đ
                        </span>
                        {item.isAdjustedByTeacher && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-black mt-0.5"
                            title={`GVCN đã điều chỉnh: ${item.adjustment?.reason || ''} (Gốc tự động: ${item.autoScore}đ)`}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            GVCN sửa
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${getBadgeStyle(
                          item.total
                        )}`}
                      >
                        {item.classification}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {role === 'teacher' && (
                          <button
                            onClick={() => handleOpenEditScore(s.id, currentWeek)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors flex items-center gap-1 border border-indigo-200 shadow-2xs"
                            title="Sửa điểm thi đua học sinh này"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-600" />
                            Sửa điểm
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedStudentHistory(s.id)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-[11px] font-bold transition-colors"
                          title="Xem chi tiết lịch sử thi đua"
                        >
                          Chi tiết
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

      {/* MODAL 1: GHI NHẬN LỖI VI PHẠM (Dành cho GVCN / Cán sự) */}
      {showAddViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddViolationModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Ghi Nhận Lỗi Vi Phạm Nề Nếp ({currentWeekRange.rangeLabel})
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động đồng bộ với Điểm danh nếu chọn Điều 1 (Đi trễ), Điều 8 (Vắng có phép), Điều 9 (Vắng không phép)
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveViolation} className="space-y-4 text-xs">
              {/* Chọn học sinh */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Chọn học sinh vi phạm:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.code} - {stu.name} (Tổ {stu.group})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn lỗi từ danh mục 37 điều */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Chọn điều khoản vi phạm (Theo Thang điểm trường):
                </label>
                <select
                  value={selectedRuleNumber}
                  onChange={(e) => handleRuleSelect(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium"
                >
                  <optgroup label="XỬ LÝ VI PHẠM CÁ NHÂN">
                    {VIOLATIONS_CATALOG.filter((r) => r.category === 'individual').map(
                      (r) => (
                        <option key={r.stt} value={r.stt}>
                          [Điều {r.stt}] (-{r.pointsDeducted}đ) {r.title.slice(0, 85)}...
                        </option>
                      )
                    )}
                  </optgroup>
                  <optgroup label="XỬ LÝ VI PHẠM TẬP THỂ LỚP & TỔ">
                    {VIOLATIONS_CATALOG.filter((r) => r.category === 'group').map(
                      (r) => (
                        <option key={r.stt} value={r.stt}>
                          [Điều {r.stt}] (-{r.pointsDeducted}đ) {r.title.slice(0, 85)}...
                        </option>
                      )
                    )}
                  </optgroup>
                </select>
              </div>

              {/* Số điểm trừ tương ứng */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số điểm trừ (Tự động):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customPointsDeducted}
                      onChange={(e) => setCustomPointsDeducted(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 font-black text-rose-600 bg-rose-50/50"
                      required
                    />
                    <span className="font-bold text-slate-500">điểm</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày vi phạm:
                  </label>
                  <input
                    type="date"
                    value={violationDate}
                    onChange={(e) => setViolationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Ghi chú chi tiết */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi chú chi tiết (Tiết học, địa điểm, nhắc nhở):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trễ 10 phút tiết 1 chào cờ; không gài quai dép..."
                  value={violationNote}
                  onChange={(e) => setViolationNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Người ghi nhận */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Người ghi nhận:
                </label>
                <select
                  value={recordedByTitle}
                  onChange={(e) => setRecordedByTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="Thầy Trương Xuân Hòa (GVCN)">Thầy Trương Xuân Hòa (GVCN)</option>
                  <option value="Đặng Đình Phúc (Lớp phó Kỉ luật)">Đặng Đình Phúc (Lớp phó Kỉ luật)</option>
                  <option value="Huỳnh Thị Ái Ly (Lớp trưởng)">Huỳnh Thị Ái Ly (Lớp trưởng)</option>
                  <option value="Tổ trưởng Tổ 1">Tổ trưởng Tổ 1</option>
                  <option value="Tổ trưởng Tổ 2">Tổ trưởng Tổ 2</option>
                  <option value="Tổ trưởng Tổ 3">Tổ trưởng Tổ 3</option>
                  <option value="Tổ trưởng Tổ 4">Tổ trưởng Tổ 4</option>
                  <option value="Giám thị / Ban Thi Đua Trường">Giám thị / Ban Thi Đua Trường</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddViolationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
                >
                  Lưu & Trừ Điểm Thi Đua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CỘNG ĐIỂM THI ĐUA KHEN THƯỞNG */}
      {showAddBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddBonusModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Cộng Điểm Khen Thưởng Thi Đua ({currentWeekRange.rangeLabel})
                </h3>
                <p className="text-xs text-slate-500">
                  Khen thưởng phong trào, giải thưởng, việc tốt
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBonus} className="space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBonusTargetType('student')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                    bonusTargetType === 'student' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  Cộng điểm Cá nhân
                </button>
                <button
                  type="button"
                  onClick={() => setBonusTargetType('group')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                    bonusTargetType === 'group' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  Cộng điểm cả Tổ
                </button>
              </div>

              {bonusTargetType === 'student' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Chọn học sinh được khen thưởng:
                  </label>
                  <select
                    value={bonusStudentId}
                    onChange={(e) => setBonusStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                  >
                    {students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.code} - {stu.name} (Tổ {stu.group})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Chọn Tổ sinh hoạt:
                  </label>
                  <select
                    value={bonusGroupNumber}
                    onChange={(e) => setBonusGroupNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                  >
                    {[1, 2, 3, 4].map((g) => (
                      <option key={g} value={g}>
                        Tổ {g} (Tất cả thành viên)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lý do khen thưởng:
                </label>
                <select
                  value={bonusReason}
                  onChange={(e) => {
                    setBonusReason(e.target.value);
                    const preset = BONUS_PRESETS.find((p) => p.reason === e.target.value);
                    if (preset) setBonusPoints(preset.points);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  {BONUS_PRESETS.map((p, idx) => (
                    <option key={idx} value={p.reason}>
                      (+{p.points}đ) {p.reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số điểm cộng:
                  </label>
                  <input
                    type="number"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 font-black text-emerald-600 bg-emerald-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày ghi nhận:
                  </label>
                  <input
                    type="date"
                    value={bonusDate}
                    onChange={(e) => setBonusDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBonusModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Lưu & Cộng Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BẢNG THANG ĐIỂM CHUẨN THPT VĨNH LỘC B (Hiển thị đầy đủ 37 điều) */}
      {showRulesCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowRulesCatalogModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">
                SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH
              </div>
              <h2 className="text-lg sm:text-xl font-black text-blue-900 mt-0.5">
                TRƯỜNG THPT VĨNH LỘC B
              </h2>
              <div className="text-xs font-bold text-slate-700 mt-1">
                THANG ĐIỂM THI ĐUA HỌC SINH (NỘI QUY - CHUYÊN CẦN - PHONG TRÀO - SỔ ĐẦU BÀI)
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 italic">
                Ban hành ngày 05 tháng 09 năm 2026 • Áp dụng cho năm học 2026 - 2027
              </p>
            </div>

            <div className="space-y-6 text-xs text-slate-700">
              {/* PHẦN 1 */}
              <div>
                <h4 className="font-black text-sm text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  I. THANG ĐIỂM THI ĐUA: NỘI QUY - CHUYÊN CẦN - PHONG TRÀO (XỬ LÝ VI PHẠM CÁ NHÂN)
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {VIOLATIONS_CATALOG.filter((r) => r.category === 'individual').map((r) => (
                    <div
                      key={r.stt}
                      className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 font-black text-slate-600 flex items-center justify-center shrink-0 text-xs">
                          {r.stt}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{r.title}</div>
                          {r.note && (
                            <div className="text-[11px] text-orange-600 font-semibold mt-0.5">
                              * {r.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-xs">
                          -{r.pointsDeducted}đ
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PHẦN 2 */}
              <div>
                <h4 className="font-black text-sm text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-600" />
                  II. XỬ LÝ VI PHẠM TẬP THỂ LỚP & TỔ
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {VIOLATIONS_CATALOG.filter((r) => r.category === 'group').map((r) => (
                    <div
                      key={r.stt}
                      className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 font-black text-slate-600 flex items-center justify-center shrink-0 text-xs">
                          {r.stt}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{r.title}</div>
                          {r.note && (
                            <div className="text-[11px] text-orange-600 font-semibold mt-0.5">
                              * {r.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black text-xs">
                          -{r.pointsDeducted}đ
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CHI TIẾT LỊCH SỬ THI ĐUA CỦA 1 HỌC SINH */}
      {selectedStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudentHistory(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const student = students.find((s) => s.id === selectedStudentHistory);
              if (!student) return null;
              const score = getStudentWeeklyScore(student.id, currentWeek);

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500"
                      />
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{student.name}</h3>
                        <p className="text-xs text-slate-500">
                          {student.code} • Tổ {student.group} • {student.classRole || 'Học sinh'}
                        </p>
                      </div>
                    </div>
                    {role === 'teacher' && (
                      <button
                        onClick={() => {
                          setSelectedStudentHistory(null);
                          handleOpenEditScore(student.id, currentWeek);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa điểm thi đua
                      </button>
                    )}
                  </div>

                  {score.isAdjustedByTeacher && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                         <div className="font-black text-amber-950">
                            Điểm thi đua ({currentWeekRange.rangeLabel}) đã được GVCN điều chỉnh thành {score.total}đ
                            <span className="font-normal text-amber-800 ml-1.5">
                              (Điểm tự động gốc: {score.autoScore}đ)
                            </span>
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5">
                            <strong>Lý do:</strong> {score.adjustment?.reason}
                          </div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            Người duyệt: {score.adjustment?.adjustedBy} • {score.adjustment?.createdAt}
                          </div>
                        </div>
                      </div>
                      {role === 'teacher' && (
                        <button
                          onClick={() => removeEmulationScoreAdjustment(student.id, currentWeek)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold text-[11px] transition-colors shrink-0"
                        >
                          Khôi phục điểm gốc
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Khởi điểm</div>
                      <div className="text-base font-black text-slate-700">100đ</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-rose-600 uppercase">Điểm trừ</div>
                      <div className="text-base font-black text-rose-600">-{score.deducted}đ</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase">Điểm cộng</div>
                      <div className="text-base font-black text-emerald-600">+{score.bonus}đ</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase">Tổng điểm</div>
                      <div className="text-base font-black text-blue-700">{score.total}đ</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Lịch sử vi phạm nề nếp ({currentWeekRange.rangeLabel})
                    </h4>
                    {score.violations.length === 0 ? (
                      <div className="text-center py-6 text-xs text-emerald-600 font-bold bg-emerald-50 rounded-2xl">
                        Không có lỗi vi phạm nào ({currentWeekRange.rangeLabel})!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {score.violations.map((v) => (
                          <div
                            key={v.id}
                            className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs flex items-start justify-between gap-3"
                          >
                            <div>
                              <div className="font-bold text-rose-950 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-black">
                                  Điều {v.ruleNumber}
                                </span>
                                <span>{v.violationText}</span>
                              </div>
                              {v.note && (
                                <div className="text-[11px] text-slate-600 mt-1">
                                  <strong>Ghi chú:</strong> {v.note}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-1">
                                Ngày: {v.date} • Người ghi nhận: {v.recordedBy}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-rose-600 text-sm">
                                -{v.pointsDeducted}đ
                              </span>
                              {role === 'teacher' && (
                                <>
                                  <button
                                    onClick={() => handleStartEditViolation(v)}
                                    className="p-1 rounded-lg hover:bg-rose-200 text-rose-700 transition-colors"
                                    title="Chỉnh sửa lỗi vi phạm này"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteDisciplineEntry(v.id)}
                                    className="p-1 rounded-lg hover:bg-rose-200 text-rose-600 transition-colors"
                                    title="Xóa lỗi vi phạm này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Khen thưởng & Điểm cộng ({currentWeekRange.rangeLabel})
                    </h4>
                    {score.bonuses.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-2xl">
                        Chưa có lượt cộng điểm khen thưởng nào ({currentWeekRange.rangeLabel})
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {score.bonuses.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-start justify-between gap-3"
                          >
                            <div>
                              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{b.reason}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Ngày: {b.date} • Người ghi nhận: {b.recordedBy}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-emerald-600 text-sm">
                                +{b.pointsAdded}đ
                              </span>
                              {role === 'teacher' && (
                                <>
                                  <button
                                    onClick={() => handleStartEditBonus(b)}
                                    className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-700 transition-colors"
                                    title="Chỉnh sửa điểm cộng này"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteBonusPointEntry(b.id)}
                                    className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-600 transition-colors"
                                    title="Xóa lượt cộng điểm này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 5: SỬA ĐIỂM THI ĐUA HỌC SINH CỦA GVCN */}
      {showEditScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditScoreModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Sửa Điểm Thi Đua Học Sinh (Dành riêng cho GVCN)
                </h3>
                <p className="text-xs text-slate-500">
                  Điều chỉnh hoặc ấn định lại điểm thi đua theo đánh giá của GVCN
                </p>
              </div>
            </div>

            {/* Target Student and Week Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn học sinh cần sửa điểm:
                </label>
                <select
                  value={editScoreStudentId}
                  onChange={(e) => handleStudentOrWeekChangeInEdit(e.target.value, editScoreWeek)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.stt}. {stu.name} ({stu.code} - Tổ {stu.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Thời gian áp dụng (Thứ 2 ➔ Thứ 6):
                </label>
                <select
                  value={editScoreWeek}
                  onChange={(e) => handleStudentOrWeekChangeInEdit(editScoreStudentId, Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                >
                  {allSchoolWeeks.map((w) => (
                    <option key={w.weekIndex} value={w.weekIndex}>
                      {w.rangeLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Score Breakdown */}
            {(() => {
              const currentScore = getStudentWeeklyScore(editScoreStudentId, editScoreWeek);
              const targetStudent = students.find((s) => s.id === editScoreStudentId);
              if (!targetStudent) return null;

              return (
                <div className="space-y-4">
                  {/* Selected Student Banner */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={targetStudent.avatar}
                        alt={targetStudent.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-400"
                      />
                      <div>
                        <div className="font-black text-slate-900 text-sm">
                          {targetStudent.name}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {targetStudent.code} • Tổ {targetStudent.group} • {targetStudent.classRole || 'Học sinh'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Điểm đang áp dụng
                      </div>
                      <div className="text-xl font-black text-indigo-700">
                        {currentScore.total}đ
                      </div>
                      {currentScore.isAdjustedByTeacher && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          Đã sửa bởi GVCN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Cards Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Khởi điểm</div>
                      <div className="text-base font-black text-slate-700">100đ</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-[10px] text-rose-600 font-bold uppercase">Điểm trừ</div>
                      <div className="text-base font-black text-rose-600">-{currentScore.deducted}đ</div>
                      <div className="text-[10px] text-rose-500">({currentScore.violations.length} lỗi)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase">Điểm cộng</div>
                      <div className="text-base font-black text-emerald-600">+{currentScore.bonus}đ</div>
                      <div className="text-[10px] text-emerald-500">({currentScore.bonuses.length} lượt)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="text-[10px] text-blue-600 font-bold uppercase">Điểm tự động</div>
                      <div className="text-base font-black text-blue-700">{currentScore.autoScore}đ</div>
                    </div>
                  </div>

                  {/* Form to submit adjusted score */}
                  <form onSubmit={handleSaveEditedScore} className="space-y-4 pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-extrabold text-slate-800 text-xs">
                          Điểm thi đua GVCN ấn định (Thang 0 - 120đ):
                        </label>
                        <span className="text-[11px] font-bold text-indigo-600">
                          Mặc định: {currentScore.autoScore}đ
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={120}
                            value={editScoreValue}
                            onChange={(e) => setEditScoreValue(Number(e.target.value))}
                            className="w-24 px-3 py-2 text-lg font-black text-center text-indigo-700 bg-indigo-50/50 rounded-xl border-2 border-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                          <span className="font-bold text-slate-600 text-xs">điểm</span>
                        </div>

                        {/* Quick preset chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[100, 98, 95, 90, 85, 80].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setEditScoreValue(val)}
                              className={`px-2 py-1 rounded-lg text-xs font-black transition-colors ${
                                editScoreValue === val
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {val}đ
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEditScoreValue(currentScore.autoScore)}
                            className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                            title="Lấy điểm tính tự động gốc"
                          >
                            Gốc ({currentScore.autoScore}đ)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preset reason suggestions */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">
                        Lý do GVCN điều chỉnh điểm:
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          'GVCN cộng điểm khích lệ nỗ lực phấn đấu tiến bộ',
                          'GVCN sửa điểm sau khi hoàn thành trực nhật & khắc phục thiếu sót',
                          'GVCN châm chước do lý do sức khỏe / có đơn xin phép hợp lệ',
                          'GVCN hạ điểm do tái phạm nề nếp sinh hoạt lớp',
                          'GVCN phê duyệt điểm thi đua tuần theo biên bản sinh hoạt lớp',
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEditScoreReason(preset)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-left transition-colors border border-slate-200"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={editScoreReason}
                        onChange={(e) => setEditScoreReason(e.target.value)}
                        placeholder="Nhập lý do cụ thể..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">
                        Người điều chỉnh:
                      </label>
                      <input
                        type="text"
                        value={editScoreAdjustedBy}
                        onChange={(e) => setEditScoreAdjustedBy(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                        required
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        {currentScore.isAdjustedByTeacher && (
                          <button
                            type="button"
                            onClick={handleResetToAutoScore}
                            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 transition-colors flex items-center gap-1.5"
                            title="Xóa điều chỉnh của GVCN và quay lại điểm tự động tính toán"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục điểm tự động ({currentScore.autoScore}đ)
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowEditScoreModal(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50"
                        >
                          Đóng
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Lưu Điểm Thi Đua Đã Sửa
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Mini-section: Lỗi vi phạm và điểm cộng của học sinh trong tuần */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        Các mục chi tiết ({getWeekRangeByIndex(editScoreWeek).rangeLabel}) ({currentScore.violations.length} lỗi, {currentScore.bonuses.length} cộng)
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(editScoreStudentId);
                            setShowAddViolationModal(true);
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg"
                        >
                          + Thêm lỗi vi phạm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBonusTargetType('student');
                            setBonusStudentId(editScoreStudentId);
                            setShowAddBonusModal(true);
                          }}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg"
                        >
                          + Thêm điểm cộng
                        </button>
                      </div>
                    </div>

                    {currentScore.violations.length === 0 && currentScore.bonuses.length === 0 ? (
                      <div className="text-center py-4 bg-slate-50 rounded-xl text-xs text-slate-500 font-medium">
                        Không có ghi nhận vi phạm hay khen thưởng nào trong tuần này.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Violations */}
                        {currentScore.violations.map((v) => (
                          <div
                            key={v.id}
                            className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="font-bold text-rose-950 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-black">
                                  Điều {v.ruleNumber}
                                </span>
                                <span>{v.violationText}</span>
                              </div>
                              {v.note && (
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {v.note}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Ngày {v.date} • {v.recordedBy}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-rose-600">-{v.pointsDeducted}đ</span>
                              <button
                                type="button"
                                onClick={() => handleStartEditViolation(v)}
                                className="p-1 rounded-lg hover:bg-rose-200 text-rose-700 transition-colors"
                                title="Sửa lỗi vi phạm này"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteDisciplineEntry(v.id)}
                                className="p-1 rounded-lg hover:bg-rose-200 text-rose-600 transition-colors"
                                title="Xóa lỗi vi phạm này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Bonuses */}
                        {currentScore.bonuses.map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{b.reason}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Ngày {b.date} • {b.recordedBy}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-emerald-600">+{b.pointsAdded}đ</span>
                              <button
                                type="button"
                                onClick={() => handleStartEditBonus(b)}
                                className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-700 transition-colors"
                                title="Sửa điểm cộng này"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteBonusPointEntry(b.id)}
                                className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-600 transition-colors"
                                title="Xóa điểm cộng này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 6: SỬA LỖI VI PHẠM */}
      {editingViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingViolation(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Chỉnh Sửa Lỗi Vi Phạm Nề Nếp
                </h3>
                <p className="text-xs text-slate-500">
                  Học sinh: {editingViolation.studentName} (Tổ {editingViolation.group})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditViolation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn quy định vi phạm:
                </label>
                <select
                  value={editViolationRuleNumber}
                  onChange={(e) => {
                    const stt = Number(e.target.value);
                    setEditViolationRuleNumber(stt);
                    const rule = VIOLATIONS_CATALOG.find((r) => r.stt === stt);
                    if (rule) setEditViolationPointsDeducted(rule.pointsDeducted);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  {VIOLATIONS_CATALOG.map((r) => (
                    <option key={r.stt} value={r.stt}>
                      [Điều {r.stt}] (-{r.pointsDeducted}đ) {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số điểm trừ:
                  </label>
                  <input
                    type="number"
                    value={editViolationPointsDeducted}
                    onChange={(e) => setEditViolationPointsDeducted(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 font-black text-rose-600 bg-rose-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày vi phạm:
                  </label>
                  <input
                    type="date"
                    value={editViolationDate}
                    onChange={(e) => setEditViolationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi chú chi tiết:
                </label>
                <input
                  type="text"
                  value={editViolationNote}
                  onChange={(e) => setEditViolationNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Người ghi nhận:
                </label>
                <input
                  type="text"
                  value={editViolationRecordedBy}
                  onChange={(e) => setEditViolationRecordedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingViolation(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
                >
                  Cập Nhật Lỗi Vi Phạm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: SỬA ĐIỂM CỘNG KHEN THƯỞNG */}
      {editingBonus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingBonus(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Chỉnh Sửa Điểm Khen Thưởng
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveEditBonus} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lý do khen thưởng:
                </label>
                <input
                  type="text"
                  value={editBonusReason}
                  onChange={(e) => setEditBonusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số điểm cộng:
                  </label>
                  <input
                    type="number"
                    value={editBonusPoints}
                    onChange={(e) => setEditBonusPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 font-black text-emerald-600 bg-emerald-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày ghi nhận:
                  </label>
                  <input
                    type="date"
                    value={editBonusDate}
                    onChange={(e) => setEditBonusDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Người ghi nhận:
                </label>
                <input
                  type="text"
                  value={editBonusRecordedBy}
                  onChange={(e) => setEditBonusRecordedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBonus(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Cập Nhật Điểm Cộng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

