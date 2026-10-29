import React from 'react';
import { useApp, getWeekRangeByIndex } from '../context/AppContext';
import {
  Users,
  CalendarCheck,
  Award,
  FileText,
  Bell,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  QrCode,
  Heart,
  ChevronRight,
  ShieldCheck,
  Bot,
  User,
  Camera,
  Crown,
  Scale,
  Settings,
  Calendar,
  Star,
  FileSpreadsheet,
  GraduationCap,
  FileJson,
} from 'lucide-react';
import { getCadreRoleBadge } from './StudentManagement';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    currentStudent,
    currentDateAttendance,
    announcements,
    happyPosts,
    timetable,
    dutySchedule,
    appConfig,
    setIsAppConfigModalOpen,
    setIsJsonModalOpen,
    currentWeek,
    getStudentWeeklyScore,
    getWeeklyEmulationSummary,
    supplementaryAttendanceList,
  } = useApp();

  const currentWeekRange = getWeekRangeByIndex(currentWeek);
  const weeklySummary = getWeeklyEmulationSummary(currentWeek);

  // Statistics calculation
  const safeStudents = students || [];
  const totalStudents = safeStudents.length;
  const maleCount = safeStudents.filter((s) => s?.gender === 'Nam').length;
  const femaleCount = safeStudents.filter((s) => s?.gender === 'Nữ').length;

  const safeRecords = currentDateAttendance?.records || {};
  const presentCount = Object.values(safeRecords).filter((r) => r === 'present').length;
  const lateCount = Object.values(safeRecords).filter((r) => r === 'late').length;
  const excusedCount = Object.values(safeRecords).filter((r) => r === 'excused').length;
  const unexcusedCount = Object.values(safeRecords).filter((r) => r === 'unexcused').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 100;

  // Group attendance stats for the 4 groups
  const groupStats = [1, 2, 3, 4].map((g) => {
    const groupStudents = safeStudents.filter((s) => s?.group === g);
    const avgAttendance =
      groupStudents.length > 0
        ? Math.round(groupStudents.reduce((sum, s) => sum + (s?.attendanceStats?.rate ?? 100), 0) / groupStudents.length)
        : 100;
    return { group: g, count: groupStudents.length, rate: avgAttendance };
  });

  // Top students (Honor Roll by weekly emulation score)
  const topStudents = [...safeStudents]
    .sort((a, b) => {
      const scoreA = getStudentWeeklyScore(a.id, currentWeek).total;
      const scoreB = getStudentWeeklyScore(b.id, currentWeek).total;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // Today's schedule & duty
  const todayDayName = 'Thứ Ba'; // Fallback or computed
  const todaySchedule = (timetable || []).find((t) => t?.day === todayDayName) || timetable?.[0] || { day: todayDayName, periods: [] };
  const todayDuty =
    (dutySchedule || []).find((d) => (d?.day || '').toLowerCase().includes(todayDayName.toLowerCase())) ||
    dutySchedule?.[0];
  const laborCadreStudent =
    safeStudents.find((s) => s?.classRole === 'Lớp phó lao động') ||
    safeStudents.find((s) => s?.id === 'hs-17') ||
    safeStudents.find((s) => s?.id === 'hs-21') ||
    safeStudents[0];
  const isLaborCadre =
    currentStudent?.classRole === 'Lớp phó lao động' ||
    (laborCadreStudent && currentStudent?.id === laborCadreStudent.id);
  const canManageDuty =
    (role === 'teacher' && isTeacherAuthenticated) || role === 'teacher' || isLaborCadre;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>HỆ SINH THÁI QUẢN LÝ LỚP HỌC HẠNH PHÚC 12A7</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              A7 - LỚP HỌC HẠNH PHÚC
            </h1>
            <p className="text-amber-300 font-bold text-sm sm:text-base italic mb-3">
              "Dream Big And Dare To Fail"
            </p>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              Khẩu hiệu: <strong>"Đoàn kết - Yêu thương - Cùng tiến bộ"</strong> • Mục tiêu quyết tâm:
              <span className="text-amber-300 font-extrabold ml-1">ĐẬU TỐT NGHIỆP & ĐẠI HỌC 100%</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-semibold text-white">
                {appConfig.schoolName}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-semibold text-white">
                Năm học: {appConfig.schoolYear}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-[11px] font-bold text-white shadow-xs">
                GVCN: {appConfig.teacherName}
              </span>
            </div>
          </div>

          {/* Quick Action Box depending on role */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 flex flex-col gap-2.5">
            <div className="text-xs text-blue-200 font-medium">Bạn đang xem với vai trò:</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {role === 'teacher' ? (
                `${appConfig.teacherName} (${appConfig.teacherTitle})`
              ) : role === 'student' ? (
                <span className="flex items-center gap-1.5 flex-wrap">
                  <span>Học sinh: {currentStudent?.name}</span>
                  {currentStudent?.classRole && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                      {currentStudent.classRole}
                    </span>
                  )}
                </span>
              ) : (
                `Phụ huynh em: ${currentStudent?.name}`
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
              {role === 'teacher' ? (
                <>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" /> Điểm danh hôm nay
                  </button>
                  <button
                    onClick={() => setActiveTab('grades')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" /> Bảng điểm tổng hợp 10 môn
                  </button>
                  <button
                    onClick={() => setActiveTab('student_ai')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Gia Sư AI 12A7
                  </button>
                  <button
                    onClick={() => setActiveTab('discipline')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Scale className="w-3.5 h-3.5" /> Tính điểm thi đua (100đ)
                  </button>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Sửa Thời khóa biểu
                  </button>
                  <button
                    onClick={() => setActiveTab('duty_schedule')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Trực nhật 4 Tổ
                  </button>
                  <button
                    onClick={() => setIsAppConfigModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20 shadow-xs"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-300" /> Sửa App GVCN
                  </button>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" /> Quản lý {totalStudents} HS
                  </button>
                  <button
                    onClick={() => setIsJsonModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <FileJson className="w-3.5 h-3.5 text-amber-300" /> Xuất Dữ Liệu JSON
                  </button>
                  <button
                    onClick={() => setActiveTab('ai_assistant')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-300" /> AI Trợ lý GVCN
                  </button>
                </>
              ) : role === 'student' ? (
                <>
                  <button
                    onClick={() => setActiveTab('student_ai')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-95 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-purple-900/40 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Gia Sư & Cố Vấn AI 12A7
                  </button>
                  <button
                    onClick={() => setActiveTab('discipline')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Scale className="w-3.5 h-3.5" /> Điểm thi đua của em
                  </button>
                  <button
                    onClick={() => setActiveTab('duty_schedule')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isLaborCadre ? 'Phân lịch trực nhật (Của em)' : 'Lịch trực nhật 4 Tổ'}
                  </button>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Thời khóa biểu
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-purple-200" /> Hồ sơ & Đổi ảnh
                  </button>
                  <button
                    onClick={() => setActiveTab('happy_corner')}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-pink-300" /> Góc Hạnh Phúc
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" /> Điểm danh & Chuyên cần
                  </button>
                  <button
                    onClick={() => setActiveTab('discipline')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Scale className="w-3.5 h-3.5" /> Điểm thi đua của con
                  </button>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Thời khóa biểu
                  </button>
                  <button
                    onClick={() => setActiveTab('evaluations')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" /> Nhận xét GVCN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sĩ số */}
        <div
          onClick={() => {
            if (role === 'teacher') setActiveTab('students');
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs transition-all ${
            role === 'teacher' ? 'hover:shadow-md cursor-pointer group' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng số học sinh</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudents}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span className="font-medium text-blue-700">{maleCount} Nam</span>
            <span>•</span>
            <span className="font-medium text-pink-600">{femaleCount} Nữ</span>
            <span>•</span>
            <span>4 Tổ</span>
          </div>
        </div>

        {/* Card 2: Chuyên cần */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chuyên cần hôm nay</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{attendanceRate}%</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-emerald-700 font-semibold">{presentCount} có mặt</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{lateCount} trễ</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">{excusedCount} phép</span>
            {supplementaryAttendanceList.length > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-1 rounded-sm">
                  {supplementaryAttendanceList.length} bổ sung
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Điểm thi đua tuần (100đ gốc) */}
        <div
          onClick={() => setActiveTab('discipline')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Thi đua ({currentWeekRange.shortRangeLabel})
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {role === 'teacher' ? (
              <span>100 <span className="text-xs font-normal text-slate-400">điểm gốc/em</span></span>
            ) : (
              <span>
                {currentStudent ? getStudentWeeklyScore(currentStudent.id, currentWeek).total : 100}
                <span className="text-xs font-normal text-slate-400">/100đ</span>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {role === 'teacher'
              ? 'Trừ điểm theo lỗi vi phạm (100đ/tuần)'
              : `Xếp loại: ${currentStudent ? getStudentWeeklyScore(currentStudent.id, currentWeek).classification : 'Xuất sắc'}`}
          </div>
        </div>

        {/* Card 4: Thông báo & Báo bài */}
        <div
          onClick={() => setActiveTab('announcements')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Thông báo & Báo bài</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">{announcements.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            Bảng tin & Nhiệm vụ Ban cán sự mới nhất
          </div>
        </div>
      </div>

      {/* AI Features & Teacher Grades Showcase Banner */}
      {role !== 'parent' && (
        <div className={`grid grid-cols-1 ${role === 'teacher' ? 'md:grid-cols-2' : ''} gap-4`}>
          {/* Card 1: Gia Sư & Cố Vấn Học Tập AI 12A7 (Chỉ GVCN & Học sinh) */}
          <div
            onClick={() => setActiveTab('student_ai')}
            className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all group border border-purple-500/30"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-pink-500/20 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/40 text-purple-200 text-[10px] font-black uppercase tracking-wider border border-purple-400/30">
                Công cụ AI Học Sinh
              </span>
            </div>
            <div className="relative z-10 mt-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 group-hover:text-purple-200 transition-colors">
                Gia Sư & Cố Vấn Học Tập AI 12A7
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-purple-200/90 mt-1 line-clamp-2">
                Hỏi đáp giải bài tập Toán - Lý - Hóa - Anh, xây dựng lộ trình ôn thi tốt nghiệp 2027 bứt phá 8+, tư vấn ngành/trường ĐH TP.HCM và ghép đôi bạn cùng tiến.
              </p>
            </div>
          </div>

          {/* Card 2: Nhập Bảng Điểm Tổng Hợp Tất Cả Các Môn (Chỉ GVCN) */}
          {role === 'teacher' && (
            <div
              onClick={() => setActiveTab('grades')}
              className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all group border border-blue-500/30"
            >
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-blue-400/20 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/40 text-blue-200 text-[10px] font-black uppercase tracking-wider border border-blue-400/30">
                  Quản lý điểm số 10 môn (GVCN)
                </span>
              </div>
              <div className="relative z-10 mt-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 group-hover:text-blue-200 transition-colors">
                  Nhập Bảng Điểm Tổng Hợp Tất Cả Các Môn
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-blue-200/90 mt-1 line-clamp-2">
                  Nhập nhanh toàn bộ 10 môn học (Toán, Văn, Anh, Lý, Hóa, Sử, KTPL, Tin, GDĐP, GDQP); hỗ trợ tải file Excel, quét ảnh AI Gemini và dán trực tiếp (Ctrl+V) tự động tính GPA và xếp loại.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left Column (Announcements + Schedule) & Right Column (Honor Roll + Grade Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông báo mới nhất & Báo bài */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">Thông báo mới & Báo bài hàng ngày</h2>
              </div>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ann.type === 'daily_homework'
                      ? 'bg-amber-50/60 border-amber-200'
                      : ann.type === 'exam'
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ann.type === 'daily_homework'
                            ? 'bg-amber-200 text-amber-900'
                            : ann.type === 'exam'
                            ? 'bg-red-200 text-red-900'
                            : 'bg-blue-200 text-blue-900'
                        }`}
                      >
                        {ann.type === 'daily_homework'
                          ? 'BÁO BÀI HÀNG NGÀY'
                          : ann.type === 'exam'
                          ? 'LỊCH KIỂM TRA'
                          : 'THÔNG BÁO LỚP'}
                      </span>
                      {ann.isPinned && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-700 text-[10px] font-bold">
                          Ghim
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{ann.createdAt}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{ann.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Người gửi: <strong>{ann.author}</strong> ({ann.role})</span>
                    <button
                      onClick={() => setActiveTab('announcements')}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Điểm thi đua tuần & Thời khóa biểu hôm nay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Điểm thi đua tuần */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-800">Điểm thi đua ({currentWeekRange.rangeLabel})</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('discipline')}
                    className="text-xs text-amber-600 font-bold hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>

                <div className="mt-3.5 space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <span>Tự động tổng kết sau Thứ 6</span>
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        {currentWeekRange.rangeLabel} (Thứ 2 ➔ Thứ 6)
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-[10px] shrink-0">
                      {currentWeekRange.shortRangeLabel}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>ĐTB thi đua lớp / Tổ dẫn đầu:</span>
                      <strong className="text-indigo-700 font-black">
                        {weeklySummary.classAvgScore}đ • Tổ {weeklySummary.groupRankings[0]?.group} ({weeklySummary.groupRankings[0]?.avgScore}đ)
                      </strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>Điểm của em ({currentStudent?.name}):</span>
                      <strong className="text-amber-700 font-black">
                        {currentStudent ? getStudentWeeklyScore(currentStudent.id, currentWeek).total : 100} / 100đ ({currentStudent ? getStudentWeeklyScore(currentStudent.id, currentWeek).classification : 'Xuất sắc'})
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('discipline')}
                className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                Xem bảng tổng kết thi đua tuần <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thời khóa biểu hôm nay */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Thời khóa biểu hôm nay ({todaySchedule.day})</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Xem cả tuần
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {/* Sáng */}
                  {todaySchedule.periods.filter(p => (p.session || 'morning') === 'morning').length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-[11px] font-bold text-amber-900 uppercase">
                          Sáng ({todaySchedule.periods.filter(p => (p.session || 'morning') === 'morning').length} tiết)
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {todaySchedule.periods
                          .filter(p => (p.session || 'morning') === 'morning')
                          .map((p) => (
                            <div
                              key={`m-${p.period}`}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50/40 text-xs border border-amber-100/80"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                                  T{p.period}
                                </span>
                                <span className="font-bold text-slate-800">{p.subject}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                                {p.teacher}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Chiều */}
                  {todaySchedule.periods.filter(p => (p.session || 'morning') === 'afternoon').length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-[11px] font-bold text-blue-900 uppercase">
                          Chiều ({todaySchedule.periods.filter(p => (p.session || 'morning') === 'afternoon').length} tiết)
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {todaySchedule.periods
                          .filter(p => (p.session || 'morning') === 'afternoon')
                          .map((p) => (
                            <div
                              key={`a-${p.period}`}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50/40 text-xs border border-blue-100/80"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                                  T{p.period}
                                </span>
                                <span className="font-bold text-slate-800">{p.subject}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                                {p.teacher}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('timetable')}
                className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Xem thời khóa biểu đầy đủ 5 ngày
              </button>
            </div>
          </div>

          {/* Lịch trực nhật hôm nay (Phân công bởi Lớp phó Lao động - Chỉ hiển thị cho GVCN & Học sinh) */}
          {role !== 'parent' && (
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Lịch Trực Nhật Hôm Nay ({todaySchedule.day})
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        Phụ trách & theo dõi: <strong>{laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('duty_schedule')}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    Xem 4 Tổ <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {todayDuty ? (
                  <div className="mt-3.5 space-y-3">
                    <div className="flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-950">
                            {todayDuty.group} phụ trách trực nhật
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            {todayDuty.day}
                          </span>
                        </div>
                        {todayDuty.leaderName && (
                          <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-1">
                            <User className="w-3 h-3 text-slate-400" /> Tổ trưởng: {todayDuty.leaderName}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-amber-600 flex items-center gap-1 justify-end">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {todayDuty.score !== undefined ? `${todayDuty.score}/10đ` : '10/10đ'}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">
                          {todayDuty.status === 'completed'
                            ? '✓ Đã hoàn thành'
                            : todayDuty.status === 'in_progress'
                            ? '⌛ Đang trực nhật'
                            : '📋 Đã phân công'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nhiệm vụ trực nhật chi tiết:
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {todayDuty.task}
                      </p>
                      {todayDuty.note && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5 pt-1.5 border-t border-slate-200/60">
                          💬 Lời dặn của Lớp phó LĐ: "{todayDuty.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 text-center text-xs text-slate-500 italic">
                    Chưa có phân công trực nhật cho hôm nay.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {canManageDuty && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                    🌱 Quyền phân lịch trực nhật
                  </span>
                )}
                <button
                  onClick={() => setActiveTab('duty_schedule')}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors text-center border border-emerald-200 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Quản lý & Phân Lịch Trực Nhật 4 Tổ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Honor Roll & Quick Corner */}
        <div className="space-y-6">
          {/* Học sinh xuất sắc tuần (Top Điểm thi đua - Chỉ hiển thị cho GVCN & Học sinh) */}
          {role !== 'parent' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Vinh danh Thi đua ({currentWeekRange.shortRangeLabel})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-xs text-amber-600 font-bold hover:underline"
                >
                  Top 10
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                {topStudents.map((stu, index) => (
                  <div
                    key={stu.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0
                            ? 'bg-amber-400 text-amber-950'
                            : index === 1
                            ? 'bg-slate-300 text-slate-800'
                            : index === 2
                            ? 'bg-orange-300 text-orange-950'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{stu.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {stu.code} • Tổ {stu.group} • {stu.dreamCareer}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-700">
                        {getStudentWeeklyScore(stu.id, currentWeek).total}đ thi đua
                      </span>
                      <div className="text-[10px] font-semibold text-emerald-600">
                        {stu.attendanceStats.rate}% chuyên cần
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className="mt-4 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
              >
                Xem 4 Bảng xếp hạng danh hiệu
              </button>
            </div>
          )}

          {/* Biểu đồ chuyên cần theo 4 Tổ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Tỷ lệ chuyên cần theo 4 Tổ</h3>
            </div>

            <div className="mt-4 space-y-3">
              {groupStats.map((gs) => (
                <div key={gs.group}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="font-bold text-slate-900">Tổ {gs.group} ({gs.count} học sinh)</span>
                    <span className="text-emerald-700 font-extrabold">{gs.rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        gs.group === 1
                          ? 'bg-blue-600'
                          : gs.group === 2
                          ? 'bg-indigo-600'
                          : gs.group === 3
                          ? 'bg-emerald-600'
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${gs.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Góc Hạnh Phúc Widget (Chỉ hiển thị cho GVCN & Học sinh) */}
          {role !== 'parent' && (
            <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50 rounded-2xl p-5 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-orange-600 fill-orange-500" />
                <h3 className="text-sm font-bold text-orange-900">Góc Hạnh Phúc A7</h3>
              </div>
              <p className="text-xs text-orange-800 leading-relaxed mb-3">
                Mỗi ngày một điều tốt, lời tri ân thầy cô và những kỷ niệm tuổi 17 rực rỡ nhất dưới mái trường THPT Vĩnh Lộc B.
              </p>
              <button
                onClick={() => setActiveTab('happy_corner')}
                className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Vào Góc Hạnh Phúc & Viết nhật ký
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
