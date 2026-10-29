import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  Scale,
  MessageSquareText,
  Trophy,
  Bell,
  HeartHandshake,
  Bot,
  Calendar,
  LogOut,
  ShieldCheck,
  User,
  Sparkles,
  Grid,
  X,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const {
    role,
    isTeacherAuthenticated,
    logoutTeacher,
    announcements,
    currentStudent,
    students,
  } = useApp();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const allTabs = [
    {
      id: 'overview',
      label:
        role === 'teacher'
          ? 'Dashboard GVCN'
          : role === 'student'
          ? 'Dashboard của em'
          : 'Sổ liên lạc con',
      shortLabel: 'Tổng quan',
      icon: LayoutDashboard,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'attendance',
      label:
        role === 'teacher'
          ? 'Điểm danh & QR'
          : role === 'student'
          ? 'Chuyên cần của em'
          : 'Chuyên cần của con',
      shortLabel: 'Điểm danh',
      icon: CalendarCheck,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'discipline',
      label:
        role === 'teacher'
          ? 'Tính điểm thi đua (100đ)'
          : role === 'student'
          ? 'Điểm thi đua của em'
          : 'Điểm thi đua của con',
      shortLabel: 'Thi đua',
      icon: Scale,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'grades',
      label: 'Bảng điểm Tổng hợp (10 Môn)',
      shortLabel: 'Bảng điểm',
      icon: GraduationCap,
      roles: ['teacher'],
    },
    {
      id: 'students',
      label: `Quản lý Học sinh (${students.length} HS)`,
      shortLabel: 'Danh sách HS',
      icon: Users,
      roles: ['teacher'],
      badgeTeacherOnly: true,
    },
    {
      id: 'timetable',
      label: 'Thời khóa biểu',
      shortLabel: 'Thời khóa biểu',
      icon: Calendar,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'duty_schedule',
      label: 'Trực nhật & Vệ sinh',
      shortLabel: 'Trực nhật',
      icon: ShieldCheck,
      roles: ['teacher', 'student'],
    },
    {
      id: 'announcements',
      label: 'Thông báo & Báo bài',
      shortLabel: 'Thông báo',
      icon: Bell,
      roles: ['teacher', 'student', 'parent'],
      badge: announcements.length,
    },
    {
      id: 'evaluations',
      label: role === 'teacher' ? 'Nhận xét học sinh' : 'Nhận xét từ Thầy Hòa',
      shortLabel: 'Nhận xét GVCN',
      icon: MessageSquareText,
      roles: ['teacher', 'parent'],
    },
    {
      id: 'leaderboard',
      label: 'Bảng xếp hạng Top 10',
      shortLabel: 'Top 10 A7',
      icon: Trophy,
      roles: ['teacher', 'student'],
    },
    {
      id: 'profile',
      label: role === 'teacher' ? 'Hồ sơ cá nhân HS' : 'Hồ sơ của em',
      shortLabel: 'Hồ sơ HS',
      icon: User,
      roles: ['teacher', 'student'],
    },
    {
      id: 'happy_corner',
      label: 'Góc Hạnh Phúc A7',
      shortLabel: 'Góc Hạnh Phúc',
      icon: HeartHandshake,
      roles: ['teacher', 'student'],
      highlight: true,
    },
    {
      id: 'student_ai',
      label: 'Gia Sư AI 12A7',
      shortLabel: 'Gia Sư AI',
      icon: Sparkles,
      roles: ['student', 'teacher'],
      isAi: true,
    },
    {
      id: 'ai_assistant',
      label: 'AI Trợ lý GVCN',
      shortLabel: 'Trợ lý GVCN',
      icon: Bot,
      roles: ['teacher'],
      isAi: true,
    },
  ];

  const allowedTabs = allTabs.filter((t) => t.roles.includes(role));
  const primaryMobileIds =
    role === 'teacher'
      ? ['overview', 'attendance', 'discipline', 'grades']
      : ['overview', 'attendance', 'discipline', 'timetable'];
  const primaryMobileTabs = allowedTabs.filter((t) => primaryMobileIds.includes(t.id));
  const isMoreTabActive = !primaryMobileIds.includes(activeTab);

  return (
    <>
      {/* Top Horizontal Navigation Bar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2 py-1.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-1 shrink-0">
              {allowedTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                      isActive
                        ? tab.isAi
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                          : tab.highlight
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                          : 'bg-blue-600 text-white shadow-sm'
                        : tab.highlight
                        ? 'text-orange-600 hover:bg-orange-50'
                        : tab.isAi
                        ? 'text-purple-600 hover:bg-purple-50 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isActive
                          ? 'text-white'
                          : tab.highlight
                          ? 'text-orange-500'
                          : tab.isAi
                          ? 'text-purple-500'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Status Tag on the right (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0 pl-2 border-l border-slate-200">
              {role === 'teacher' && isTeacherAuthenticated ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quyền GVCN Đã Mở</span>
                  <button
                    onClick={logoutTeacher}
                    title="Khóa và Đăng xuất quyền GVCN"
                    className="ml-1 text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : role === 'student' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Cổng Học Sinh: {currentStudent?.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Cổng Phụ Huynh: {currentStudent?.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Fixed Bottom Navigation Bar for Mobile Smartphones (< md) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-5 h-15 px-1">
          {primaryMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !isMobileDrawerOpen;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileDrawerOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors relative ${
                  isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 font-semibold'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-blue-600" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight truncate max-w-full px-0.5">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}

          {/* 5th Tab: Menu / All Modules */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors relative ${
              isMobileDrawerOpen || isMoreTabActive
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 font-semibold'
            }`}
          >
            {(isMobileDrawerOpen || isMoreTabActive) && (
              <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-indigo-600" />
            )}
            <Grid
              className={`w-5 h-5 ${
                isMobileDrawerOpen || isMoreTabActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            />
            <span className="text-[10px] leading-tight">Tất cả</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer for All Classroom Modules */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-t-3xl p-4 pb-20 shadow-2xl border-t border-slate-200 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Danh mục Chức năng Lớp 12A7
                </h3>
                <p className="text-[11px] text-slate-500">
                  Chọn nhanh chức năng phù hợp trên điện thoại
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {allowedTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-800 border-slate-200 active:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.isAi
                          ? 'bg-purple-100 text-purple-600'
                          : tab.highlight
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{tab.shortLabel}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {tab.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
