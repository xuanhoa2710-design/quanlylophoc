import React, { useMemo, useState } from 'react';
import {
  useApp,
  getWeekRangeByIndex,
  getWeekSchoolDays,
  getAllSchoolWeeks,
} from '../context/AppContext';
import {
  getVietnamDateParts,
  getVietnamDateVN,
  formatDateVN,
  formatDateWithWeekdayVN,
} from '../utils/timeUtils';
import { AttendanceStatus } from '../types';
import {
  ClipboardList,
  Calendar,
  Copy,
  Check,
  Download,
  Send,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Scale,
  CalendarCheck,
  ShieldCheck,
  MessageSquareText,
} from 'lucide-react';

interface MondayWeeklyReportCardProps {
  setActiveTab: (tab: string) => void;
}

export const MondayWeeklyReportCard: React.FC<MondayWeeklyReportCardProps> = ({
  setActiveTab,
}) => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    currentWeek,
    setCurrentWeek,
    setSelectedAttendanceDate,
    allAttendanceDays,
    supplementaryAttendanceList,
    disciplineEntries,
    bonusEntries,
    dutySchedule,
    evaluations,
    getWeeklyEmulationSummary,
    addAnnouncement,
  } = useApp();

  const vnParts = getVietnamDateParts();
  const isMonday = vnParts.dayOfWeek === 1;
  const defaultReportWeek = Math.max(1, currentWeek - 1);

  const [reportWeek, setReportWeek] = useState<number>(defaultReportWeek);
  const [isExpanded, setIsExpanded] = useState<boolean>(isMonday);
  const [copied, setCopied] = useState(false);
  const [publishedToast, setPublishedToast] = useState<string | null>(null);

  const allWeeks = useMemo(() => getAllSchoolWeeks(35), []);
  const weekRange = useMemo(() => getWeekRangeByIndex(reportWeek), [reportWeek]);
  const schoolDays = useMemo(
    () => getWeekSchoolDays(weekRange.mondayIso),
    [weekRange.mondayIso]
  );
  const schoolDaySet = useMemo(
    () => new Set(schoolDays.map((d) => d.date)),
    [schoolDays]
  );

  const emulationSummary = useMemo(
    () => getWeeklyEmulationSummary(reportWeek),
    [getWeeklyEmulationSummary, reportWeek]
  );

  // Aggregate previous-week attendance details (Mon -> Fri)
  const attendanceReport = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const issueMap = new Map<
      string,
      {
        studentId: string;
        studentName: string;
        studentCode: string;
        group: number;
        date: string;
        status: AttendanceStatus;
        reason?: string;
      }
    >();

    let recordedDaysCount = 0;

    schoolDays.forEach((dayInfo) => {
      const dayRecord = allAttendanceDays[dayInfo.date];
      if (dayRecord && dayRecord.records && Object.keys(dayRecord.records).length > 0) {
        recordedDaysCount += 1;
        Object.entries(dayRecord.records).forEach(([stuId, st]) => {
          if (st === 'late' || st === 'excused' || st === 'unexcused') {
            const stu = studentMap.get(stuId);
            if (!stu) return;
            issueMap.set(`${stuId}__${dayInfo.date}`, {
              studentId: stu.id,
              studentName: stu.name,
              studentCode: stu.code,
              group: stu.group,
              date: dayInfo.date,
              status: st,
              reason: dayRecord.note || undefined,
            });
          }
        });
      }
    });

    // Apply supplementary attendance updates falling inside this week
    (supplementaryAttendanceList || []).forEach((item) => {
      if (!schoolDaySet.has(item.date)) return;
      const key = `${item.studentId}__${item.date}`;
      if (item.newStatus === 'present') {
        issueMap.delete(key);
      } else {
        const stu = studentMap.get(item.studentId);
        issueMap.set(key, {
          studentId: item.studentId,
          studentName: stu?.name || item.studentName,
          studentCode: stu?.code || item.studentCode,
          group: stu?.group || item.group,
          date: item.date,
          status: item.newStatus,
          reason: `${item.reason}${item.note ? ` (${item.note})` : ''}`,
        });
      }
    });

    // Include attendance-linked discipline entries in that week if not already in issueMap
    (disciplineEntries || []).forEach((d) => {
      if (!schoolDaySet.has(d.date)) return;
      if (d.ruleNumber === 1 || d.ruleNumber === 8 || d.ruleNumber === 9) {
        const key = `${d.studentId}__${d.date}`;
        if (!issueMap.has(key)) {
          const stu = studentMap.get(d.studentId);
          issueMap.set(key, {
            studentId: d.studentId,
            studentName: stu?.name || d.studentName,
            studentCode: stu?.code || '',
            group: stu?.group || d.group,
            date: d.date,
            status: d.ruleNumber === 1 ? 'late' : d.ruleNumber === 8 ? 'excused' : 'unexcused',
            reason: d.note || d.violationText,
          });
        }
      }
    });

    const issues = Array.from(issueMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const unexcusedList = issues.filter((i) => i.status === 'unexcused');
    const excusedList = issues.filter((i) => i.status === 'excused');
    const lateList = issues.filter((i) => i.status === 'late');

    const totalPossibleSlots = Math.max(1, students.length * 5);
    const absentSlots = unexcusedList.length + excusedList.length;
    const weeklyAttendanceRate = Number(
      (((totalPossibleSlots - absentSlots) / totalPossibleSlots) * 100).toFixed(1)
    );

    return {
      recordedDaysCount,
      issues,
      unexcusedList,
      excusedList,
      lateList,
      weeklyAttendanceRate,
    };
  }, [
    students,
    schoolDays,
    schoolDaySet,
    allAttendanceDays,
    supplementaryAttendanceList,
    disciplineEntries,
  ]);

  // Previous-week discipline & bonus lists
  const weekViolations = useMemo(() => {
    return (disciplineEntries || [])
      .filter((d) => d.weekNumber === reportWeek || schoolDaySet.has(d.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [disciplineEntries, reportWeek, schoolDaySet]);

  const weekBonuses = useMemo(() => {
    return (bonusEntries || [])
      .filter((b) => b.weekNumber === reportWeek || schoolDaySet.has(b.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bonusEntries, reportWeek, schoolDaySet]);

  // Duty summary
  const dutySummary = useMemo(() => {
    const weekItems = (dutySchedule || []).filter((d) => d.weekNumber === reportWeek);
    const list = weekItems.length > 0 ? weekItems : dutySchedule || [];
    const avgScore =
      list.length > 0
        ? (
            list.reduce((sum, item) => sum + (item.score ?? 10), 0) / list.length
          ).toFixed(1)
        : '10.0';
    const completedCount = list.filter((d) => d.status === 'completed').length;
    return { total: list.length, completedCount, avgScore };
  }, [dutySchedule, reportWeek]);

  // Evaluation summary
  const evalSummary = useMemo(() => {
    const sentCount = (evaluations || []).filter((e) => e.sentToParent).length;
    const repliedCount = (evaluations || []).filter((e) => !!e.parentReply).length;
    return { total: (evaluations || []).length, sentCount, repliedCount };
  }, [evaluations]);

  if (role !== 'teacher' || !isTeacherAuthenticated) return null;

  const getStatusLabel = (st: AttendanceStatus) => {
    if (st === 'unexcused') return 'Vắng K.Phép';
    if (st === 'excused') return 'Vắng có phép';
    if (st === 'late') return 'Đi trễ';
    return 'Có mặt';
  };

  // Plain-text report for Zalo / BGH / Announcements
  const buildPlainTextReport = () => {
    const lines: string[] = [];
    lines.push(
      `📋 BÁO CÁO NHANH TUẦN TRƯỚC — LỚP 12A7 (THPT VĨNH LỘC B)`
    );
    lines.push(
      `📅 Phạm vi: Tuần ${reportWeek} (${weekRange.rangeLabel}) • Lập sáng Thứ Hai (${getVietnamDateVN()})`
    );
    lines.push(`👨‍🏫 GVCN: Thầy Trương Xuân Hòa`);
    lines.push('');

    lines.push(`1. CHUYÊN CẦN TUẦN ${reportWeek}:`);
    lines.push(
      `- Tỷ lệ chuyên cần tuần: ${attendanceReport.weeklyAttendanceRate}% (Sĩ số: ${students.length} HS)`
    );
    lines.push(
      `- Vắng không phép: ${attendanceReport.unexcusedList.length} lượt | Vắng có phép: ${attendanceReport.excusedList.length} lượt | Đi trễ: ${attendanceReport.lateList.length} lượt`
    );
    if (attendanceReport.issues.length === 0) {
      lines.push(`- Lớp đi học đầy đủ, đúng giờ, không có lượt vắng/trễ.`);
    } else {
      attendanceReport.issues.forEach((item) => {
        lines.push(
          `  • ${item.studentName} (Tổ ${item.group}) — ${formatDateVN(item.date)}: ${getStatusLabel(item.status)}${item.reason ? ` (${item.reason})` : ''}`
        );
      });
    }
    lines.push('');

    lines.push(`2. THI ĐUA & NỀ NẾP TUẦN ${reportWeek} (Đầu tuần 100đ/HS):`);
    lines.push(
      `- ĐTB thi đua lớp: ${emulationSummary.classAvgScore}/100đ | Giữ trọn 100đ: ${emulationSummary.perfectCount}/${students.length} HS`
    );
    lines.push(
      `- Xếp hạng 4 Tổ: ${emulationSummary.groupRankings
        .map((g) => `Hạng ${g.rank}: Tổ ${g.group} (${g.avgScore}đ)`)
        .join(' • ')}`
    );
    if (weekViolations.length === 0) {
      lines.push(`- Vi phạm nề nếp: Không có học sinh vi phạm trong tuần.`);
    } else {
      lines.push(`- Chi tiết lỗi vi phạm (${weekViolations.length} lượt):`);
      weekViolations.forEach((v) => {
        lines.push(
          `  • ${v.studentName} (Tổ ${v.group}) — ${formatDateVN(v.date)}: [Đ${v.ruleNumber}] ${v.violationText} (-${v.pointsDeducted}đ)`
        );
      });
    }
    if (weekBonuses.length > 0) {
      lines.push(`- Khen thưởng / Cộng điểm (${weekBonuses.length} lượt):`);
      weekBonuses.forEach((b) => {
        lines.push(
          `  • ${b.studentName} (Tổ ${b.group}) — ${formatDateVN(b.date)}: ${b.reason} (+${b.pointsAdded}đ)`
        );
      });
    }
    lines.push('');

    lines.push(`3. TRỰC NHẬT & PHỐI HỢP PHỤ HUYNH:`);
    lines.push(
      `- Trực nhật vệ sinh: ĐTB ${dutySummary.avgScore}/10đ (${dutySummary.completedCount}/${dutySummary.total} buổi hoàn thành).`
    );
    lines.push(
      `- Phiếu nhận xét GVCN: ${evalSummary.sentCount} phiếu đã gửi Phụ huynh (${evalSummary.repliedCount} phản hồi từ gia đình).`
    );
    lines.push('');
    lines.push(`Trân trọng báo cáo,`);
    lines.push(`Thầy Trương Xuân Hòa — GVCN Lớp 12A7`);
    return lines.join('\n');
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const ta = document.createElement('textarea');
      ta.value = buildPlainTextReport();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadTxt = () => {
    const content = '\uFEFF' + buildPlainTextReport();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_nhanh_Tuan_${reportWeek}_12A7.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePublishToAnnouncements = () => {
    addAnnouncement({
      title: `Báo cáo nhanh tổng kết Tuần ${reportWeek} (${weekRange.shortRangeLabel}) — Đầu tuần Thứ Hai`,
      content: buildPlainTextReport(),
      author: 'Thầy Trương Xuân Hòa (GVCN)',
      role: 'Giáo viên Chủ nhiệm 12A7',
      type: 'class',
      isPinned: true,
    });
    setPublishedToast(
      `Đã đăng Báo cáo nhanh Tuần ${reportWeek} lên mục Thông báo lớp 12A7!`
    );
    setTimeout(() => setPublishedToast(null), 4000);
  };

  const handleJumpToWeekView = (tab: 'attendance' | 'discipline') => {
    setCurrentWeek(reportWeek);
    setSelectedAttendanceDate(weekRange.mondayIso);
    setActiveTab(tab);
  };

  const topGroup = emulationSummary.groupRankings[0];

  return (
    <div className="rounded-3xl bg-white border-2 border-indigo-200/90 shadow-md overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 p-4 sm:p-5 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <ClipboardList className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isMonday
                    ? 'Hôm nay là Thứ Hai • Báo cáo nhanh đầu tuần'
                    : 'Báo cáo nhanh Thứ Hai đầu tuần (GVCN)'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/15 text-blue-100 text-[11px] font-bold">
                  Tuần {reportWeek}: {weekRange.rangeLabel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-1">
                Báo Cáo Nhanh Tuần Trước Dành Cho GVCN — Thầy Trương Xuân Hòa
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Tự động tổng hợp chuyên cần, ngày nghỉ/trễ, điểm thi đua 4 Tổ, vi phạm và khen thưởng của tuần trước để GVCN sinh hoạt đầu tuần & gửi BGH/Phụ huynh.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Week Picker */}
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-xs p-1 rounded-xl border border-white/20">
              <button
                type="button"
                onClick={() => setReportWeek((w) => Math.max(1, w - 1))}
                disabled={reportWeek <= 1}
                className="p-1.5 rounded-lg hover:bg-white/20 disabled:opacity-40 text-white cursor-pointer"
                title="Xem tuần trước nữa"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={reportWeek}
                onChange={(e) => setReportWeek(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-xs px-1 focus:outline-hidden cursor-pointer"
              >
                {allWeeks.map((w) => (
                  <option
                    key={w.weekIndex}
                    value={w.weekIndex}
                    className="text-slate-900 font-bold"
                  >
                    Tuần {w.weekIndex} ({w.shortRangeLabel})
                    {w.weekIndex === defaultReportWeek ? ' • Tuần trước' : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setReportWeek((w) => Math.min(35, w + 1))}
                disabled={reportWeek >= 35}
                className="p-1.5 rounded-lg hover:bg-white/20 disabled:opacity-40 text-white cursor-pointer"
                title="Xem tuần kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-white text-indigo-800 hover:bg-indigo-50 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <span>Thu gọn</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Mở chi tiết báo cáo</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Always-Visible Compact Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <div className="text-[10px] font-bold text-blue-200 uppercase">Chuyên cần tuần {reportWeek}</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">
              {attendanceReport.weeklyAttendanceRate}%
            </div>
            <div className="text-[11px] text-blue-100">
              {attendanceReport.unexcusedList.length} KP • {attendanceReport.excusedList.length} P • {attendanceReport.lateList.length} trễ
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <div className="text-[10px] font-bold text-blue-200 uppercase">ĐTB Thi đua lớp</div>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
              {emulationSummary.classAvgScore}
              <span className="text-xs font-normal text-blue-100">/100đ</span>
            </div>
            <div className="text-[11px] text-blue-100">
              {emulationSummary.perfectCount}/{students.length} HS đạt 100đ
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <div className="text-[10px] font-bold text-blue-200 uppercase">Tổ dẫn đầu tuần {reportWeek}</div>
            <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">
              Tổ {topGroup?.group ?? 1}
            </div>
            <div className="text-[11px] text-blue-100">
              ĐTB {topGroup?.avgScore ?? 100}đ • {weekViolations.length} lỗi toàn lớp
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <div className="text-[10px] font-bold text-blue-200 uppercase">Trực nhật & Phản hồi PH</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">
              {dutySummary.avgScore}/10đ
            </div>
            <div className="text-[11px] text-blue-100">
              {evalSummary.sentCount} phiếu PH • {evalSummary.repliedCount} phản hồi
            </div>
          </div>
        </div>
      </div>

      {publishedToast && (
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{publishedToast}</span>
        </div>
      )}

      {/* Expanded Detailed Quick Report Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 bg-slate-50/50">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>
                Dữ liệu tổng hợp tự động cho <strong>Tuần {reportWeek} ({weekRange.rangeLabel})</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Đã sao chép gửi Zalo / BGH!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép báo cáo (Zalo / BGH)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePublishToAnnouncements}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Đăng lên Thông báo lớp</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Tải file (.txt)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section 1: Attendance Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  1. Chuyên cần & Ngày nghỉ/trễ Tuần {reportWeek}
                </h3>
                <button
                  type="button"
                  onClick={() => handleJumpToWeekView('attendance')}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Mở Điểm danh tuần này →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-[10px] font-bold text-red-700">Vắng K.Phép</div>
                  <div className="text-lg font-black text-red-800">
                    {attendanceReport.unexcusedList.length}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] font-bold text-blue-700">Vắng có phép</div>
                  <div className="text-lg font-black text-blue-800">
                    {attendanceReport.excusedList.length}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-700">Đi trễ</div>
                  <div className="text-lg font-black text-amber-800">
                    {attendanceReport.lateList.length}
                  </div>
                </div>
              </div>

              {attendanceReport.issues.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Xuất sắc! Tuần {reportWeek} không ghi nhận học sinh nghỉ học hoặc đi trễ.
                  </span>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {attendanceReport.issues.map((item) => (
                    <div
                      key={`${item.studentId}-${item.date}`}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">
                          {item.studentName}{' '}
                          <span className="text-[10px] font-semibold text-slate-500">
                            (Tổ {item.group})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatDateWithWeekdayVN(item.date)}</span>
                        </div>
                        {item.reason && (
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.reason}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border ${
                          item.status === 'unexcused'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.status === 'excused'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Emulation & Violations Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  2. Thi đua 4 Tổ & Vi phạm Tuần {reportWeek}
                </h3>
                <button
                  type="button"
                  onClick={() => handleJumpToWeekView('discipline')}
                  className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Mở Thi đua tuần này →
                </button>
              </div>

              {/* 4 Group Mini Rankings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {emulationSummary.groupRankings.map((grp) => (
                  <div
                    key={grp.group}
                    className={`p-2 rounded-xl border text-center ${
                      grp.rank === 1
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-black text-slate-600">
                      #{grp.rank} • Tổ {grp.group}
                    </div>
                    <div className="text-sm font-black text-indigo-800 mt-0.5">
                      {grp.avgScore}đ
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {grp.violationCount} lỗi
                    </div>
                  </div>
                ))}
              </div>

              {/* Violations List */}
              {weekViolations.length === 0 && weekBonuses.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Tuần {reportWeek} tập thể 12A7 giữ nề nếp tốt, 100% học sinh đạt trọn 100 điểm!
                  </span>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {weekViolations.map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-rose-950 flex items-center gap-1.5 flex-wrap">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{v.studentName}</span>
                          <span className="text-[10px] font-semibold text-rose-700">
                            (Tổ {v.group} • {formatDateVN(v.date)})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 mt-0.5 line-clamp-1">
                          [Điều {v.ruleNumber}] {v.violationText}
                        </div>
                      </div>
                      <span className="font-black text-rose-600 shrink-0">
                        -{v.pointsDeducted}đ
                      </span>
                    </div>
                  ))}

                  {weekBonuses.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{b.studentName}</span>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            (Tổ {b.group} • {formatDateVN(b.date)})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 mt-0.5 line-clamp-1">
                          {b.reason}
                        </div>
                      </div>
                      <span className="font-black text-emerald-600 shrink-0">
                        +{b.pointsAdded}đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Duty & Parent Evaluations Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-slate-900">Trực nhật & Vệ sinh lớp</div>
                  <div className="text-slate-500">
                    ĐTB: <strong className="text-emerald-700">{dutySummary.avgScore}/10đ</strong> •{' '}
                    {dutySummary.completedCount}/{dutySummary.total} buổi hoàn thành
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('duty_schedule')}
                className="text-xs font-bold text-emerald-700 hover:underline shrink-0 cursor-pointer"
              >
                Xem →
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-slate-900">Nhận xét HS & Liên hệ Phụ huynh</div>
                  <div className="text-slate-500">
                    <strong className="text-blue-700">{evalSummary.sentCount} phiếu</strong> đã gửi PH •{' '}
                    <strong className="text-emerald-700">{evalSummary.repliedCount} phản hồi</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('evaluations')}
                className="text-xs font-bold text-blue-700 hover:underline shrink-0 cursor-pointer"
              >
                Gửi PH →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
