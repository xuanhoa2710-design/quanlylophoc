import React, { useState } from 'react';
import { Logo } from './Logo';
import { useApp, getWeekRangeByIndex } from '../context/AppContext';
import { Role } from '../types';
import {
  Bell,
  GraduationCap,
  Users,
  ChevronDown,
  Sparkles,
  School,
  X,
  Lock,
  LogOut,
  Camera,
  Settings,
  KeyRound,
  FileJson,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { StudentPasswordModal } from './StudentPasswordModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    role,
    setRole,
    isTeacherAuthenticated,
    logoutTeacher,
    requestTeacherAccess,
    activeStudentId,
    setActiveStudentId,
    students,
    currentStudent,
    recentAlerts,
    clearAlerts,
    appConfig,
    currentWeek,
    setIsAppConfigModalOpen,
    setIsJsonModalOpen,
    cloudSyncStatus,
    lastSyncedAt,
    firebaseUserEmail,
    loginWithGoogleCloud,
    syncAllToCloudNow,
  } = useApp();

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);

  const currentWeekRange = getWeekRangeByIndex(currentWeek);

  const rolesConfig: { id: Role; label: string; shortLabel: string; icon: any; color: string }[] = [
    {
      id: 'teacher',
      label: 'Thầy Trương Xuân Hòa (GVCN)',
      shortLabel: 'GVCN',
      icon: School,
      color: 'bg-blue-600 text-white',
    },
    {
      id: 'student',
      label: 'Học sinh 12A7',
      shortLabel: 'Học sinh',
      icon: GraduationCap,
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'parent',
      label: 'Phụ huynh 12A7',
      shortLabel: 'Phụ huynh',
      icon: Users,
      color: 'bg-orange-600 text-white',
    },
  ];

  const handleRoleSwitch = (targetRole: Role) => {
    if (targetRole === 'teacher') {
      if (!isTeacherAuthenticated) {
        requestTeacherAccess(() => {
          setActiveTab('overview');
        });
      } else {
        setRole('teacher');
      }
    } else {
      setRole(targetRole);
      setIsJsonModalOpen(false);
      if (activeTab === 'students' || activeTab === 'ai_assistant') {
        setActiveTab('overview');
      } else if (
        targetRole === 'parent' &&
        ['happy_corner', 'student_ai', 'duty_schedule', 'profile'].includes(activeTab)
      ) {
        setActiveTab('overview');
      } else if (targetRole === 'student' && activeTab === 'evaluations') {
        setActiveTab('overview');
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-orange-600 text-white py-1 px-3 sm:px-4 text-[11px] sm:text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="hidden sm:inline-flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Khẩu hiệu:
            </span>
            <span className="font-semibold text-yellow-200 uppercase truncate">
              {appConfig.slogan}
            </span>
            <span className="hidden lg:inline text-white/70">|</span>
            <span className="hidden lg:inline font-bold text-amber-300">
              {currentWeekRange.rangeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-white/90 text-[10px] sm:text-[11px] shrink-0">
            <button
              onClick={() => (firebaseUserEmail ? syncAllToCloudNow() : syncAllToCloudNow())}
              onDoubleClick={() => loginWithGoogleCloud()}
              title="Dữ liệu đồng bộ thời gian thực cho tất cả các máy • Nhấn để làm mới ngay"
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold transition-all cursor-pointer"
            >
              {cloudSyncStatus === 'syncing' ? (
                <RefreshCw className="w-3 h-3 text-emerald-300 animate-spin" />
              ) : (
                <Cloud className="w-3 h-3 text-emerald-300" />
              )}
              <span>
                {cloudSyncStatus === 'syncing'
                  ? 'Đang đồng bộ...'
                  : `Đồng bộ chung (${lastSyncedAt})`}
              </span>
            </button>
            <span className="hidden md:inline">
              Sĩ số: <strong className="text-white">{students.length} HS</strong>
            </span>
            <span className="hidden xl:inline">
              GVCN: <strong className="text-white">{appConfig.teacherName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Logo */}
          <div className="cursor-pointer shrink-0" onClick={() => setActiveTab('overview')}>
            <Logo size="sm" />
          </div>

          {/* Right: Alerts + Desktop Student Selector + Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Automatic System Alerts Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertModal(!showAlertModal)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {recentAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {recentAlerts.length}
                  </span>
                )}
              </button>

              {showAlertModal && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        Thông báo & Đồng bộ hệ thống
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {recentAlerts.length > 0 && (
                        <button
                          onClick={clearAlerts}
                          className="text-xs text-slate-400 hover:text-slate-600 underline"
                        >
                          Xóa tất cả
                        </button>
                      )}
                      <button
                        onClick={() => setShowAlertModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {recentAlerts.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        Chưa có thông báo mới. Hệ thống tự động đồng bộ điểm danh và thi đua giữa tất cả thiết bị!
                      </div>
                    ) : (
                      recentAlerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-slate-700 leading-relaxed"
                        >
                          <div className="flex items-center gap-1.5 text-indigo-800 font-bold mb-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Hệ thống tự động 12A7
                          </div>
                          {alert}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Student Selector (Hidden on small mobile, shown in Row 2 on mobile) */}
            {(role === 'student' ||
              role === 'parent' ||
              (role === 'teacher' && isTeacherAuthenticated)) && (
              <div className="hidden md:flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setShowStudentPicker(!showStudentPicker)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-semibold text-slate-700 max-w-[240px] truncate shadow-2xs"
                    title="Chọn học sinh để xem thông tin chi tiết hoặc Reset mật khẩu"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-blue-300 shrink-0 bg-blue-100 flex items-center justify-center">
                      {currentStudent?.avatar ? (
                        <img
                          src={currentStudent.avatar}
                          alt={currentStudent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-700 font-bold text-[10px]">
                          {currentStudent?.stt}
                        </span>
                      )}
                    </div>
                    <div className="text-left truncate">
                      <div className="truncate font-bold text-slate-800 flex items-center gap-1">
                        <span className="truncate">
                          {role === 'teacher'
                            ? `HS: ${currentStudent?.name}`
                            : role === 'student'
                            ? currentStudent?.name
                            : `PH: ${currentStudent?.name}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <span>
                          {currentStudent?.code} • Tổ {currentStudent?.group}
                        </span>
                        {currentStudent?.pinCode && (
                          <span className="text-purple-600 font-bold flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            {role === 'teacher' && isTeacherAuthenticated && (
                              <span>({currentStudent.pinCode})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                </div>

                {role === 'student' && (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'profile'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-[11px]">Hồ sơ</span>
                  </button>
                )}

                {role === 'teacher' && isTeacherAuthenticated && currentStudent && (
                  <button
                    onClick={() => setIsResetPinModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                    title={`Reset hoặc đổi mật khẩu (Mã PIN) cho học sinh ${currentStudent.name}`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden xl:inline text-[11px]">Reset PIN</span>
                  </button>
                )}
              </div>
            )}

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {rolesConfig.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;

                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSwitch(r.id)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                      isSelected
                        ? r.color + ' shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden lg:inline">{r.label}</span>
                    <span className="lg:hidden">{r.shortLabel}</span>
                    {r.id === 'teacher' && !isTeacherAuthenticated && (
                      <Lock className="w-2.5 h-2.5 text-amber-300" />
                    )}
                  </button>
                );
              })}

              {/* Desktop Teacher Quick Tools */}
              {role === 'teacher' && isTeacherAuthenticated && (
                <div className="hidden md:flex items-center">
                  <button
                    onClick={() => setIsJsonModalOpen(true)}
                    title="Xuất & Sao lưu dữ liệu hệ thống Lớp 12A7 ra file JSON"
                    className="ml-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden xl:inline text-[11px]">JSON</span>
                  </button>

                  <button
                    onClick={() => setIsAppConfigModalOpen(true)}
                    title="Chỉnh sửa thông tin Lớp học & GVCN"
                    className="ml-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-600" />
                  </button>

                  <button
                    onClick={logoutTeacher}
                    title="Khóa quyền GVCN"
                    className="ml-1 p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Row 2: Compact Student Selector & Quick Actions Bar (Only on < md screens) */}
        {(role === 'student' ||
          role === 'parent' ||
          (role === 'teacher' && isTeacherAuthenticated)) && (
          <div className="flex md:hidden items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
            <button
              onClick={() => setShowStudentPicker(!showStudentPicker)}
              className="flex-1 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentStudent?.avatar}
                  alt={currentStudent?.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-300 shrink-0"
                />
                <div className="truncate text-left">
                  <span className="font-bold text-slate-900">
                    {role === 'teacher'
                      ? `HS: ${currentStudent?.name}`
                      : role === 'student'
                      ? currentStudent?.name
                      : `PH: ${currentStudent?.name}`}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1.5">
                    (Tổ {currentStudent?.group})
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            <div className="flex items-center gap-1 shrink-0">
              {role === 'student' && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700"
                  title="Hồ sơ cá nhân"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}

              {role === 'teacher' && isTeacherAuthenticated && (
                <>
                  {currentStudent && (
                    <button
                      onClick={() => setIsResetPinModalOpen(true)}
                      className="p-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700"
                      title="Reset PIN Học sinh"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsJsonModalOpen(true)}
                    className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700"
                    title="Xuất/Nhập JSON"
                  >
                    <FileJson className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsAppConfigModalOpen(true)}
                    className="p-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700"
                    title="Cấu hình Lớp"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={logoutTeacher}
                    className="p-1.5 rounded-xl bg-red-100 text-red-700"
                    title="Khóa quyền GVCN"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Student Picker Modal / Dropdown (Works cleanly on both Mobile & Desktop) */}
      {showStudentPicker && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-4 bg-black/40 sm:bg-transparent backdrop-blur-2xs sm:backdrop-blur-none">
          <div className="w-full max-w-sm sm:w-80 mt-14 sm:mt-12 sm:mr-4 rounded-2xl bg-white p-3.5 shadow-2xl ring-1 ring-black/10">
            <div className="text-xs font-bold text-slate-800 pb-2.5 border-b border-slate-100 flex items-center justify-between">
              <span>Chọn học sinh 12A7 ({students.length} bạn)</span>
              <button
                onClick={() => setShowStudentPicker(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="mt-2 max-h-72 overflow-y-auto space-y-1 pr-1">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveStudentId(s.id);
                    setShowStudentPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    s.id === activeStudentId
                      ? 'bg-blue-600 text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        s.id === activeStudentId
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.stt}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {s.pinCode && (
                      <Lock
                        className={`w-3 h-3 ${
                          s.id === activeStudentId ? 'text-white/80' : 'text-purple-600'
                        }`}
                      />
                    )}
                    <span
                      className={`text-[10px] ${
                        s.id === activeStudentId ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      Tổ {s.group}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Password Reset Modal from Header */}
      {currentStudent && (
        <StudentPasswordModal
          isOpen={isResetPinModalOpen}
          onClose={() => setIsResetPinModalOpen(false)}
          targetStudent={currentStudent}
        />
      )}
    </header>
  );
};
