import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { AttendanceView } from './components/AttendanceView';
import { DisciplineView } from './components/DisciplineView';
import { GradesView } from './components/GradesView';
import { AppConfigModal } from './components/AppConfigModal';
import { EvaluationsView } from './components/EvaluationsView';
import { LeaderboardView } from './components/LeaderboardView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { HappyCornerView } from './components/HappyCornerView';
import { AIAssistantView } from './components/AIAssistantView';
import { StudentAITutorView } from './components/StudentAITutorView';
import { TimetableView } from './components/TimetableView';
import { DutyScheduleView } from './components/DutyScheduleView';
import { StudentProfileView } from './components/StudentProfileView';
import { TeacherPasswordModal } from './components/TeacherPasswordModal';
import { DataJsonModal } from './components/DataJsonModal';
import { AccessGuard } from './components/AccessGuard';
import { School } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { role, isTeacherAuthenticated, appConfig } = useApp();

  useEffect(() => {
    if (
      role === 'parent' &&
      ['happy_corner', 'student_ai', 'duty_schedule', 'profile', 'students', 'ai_assistant', 'grades', 'leaderboard'].includes(activeTab)
    ) {
      setActiveTab('overview');
    } else if (role === 'student' && ['students', 'ai_assistant', 'evaluations', 'grades'].includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [role, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-16 md:pb-0">
      {/* Teacher Password Challenge Modal */}
      <TeacherPasswordModal />

      {/* Teacher & Class Configuration Modal */}
      <AppConfigModal />

      {/* JSON Data Export / Backup & Import Modal */}
      <DataJsonModal />

      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Tab Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body with Role Access Guards */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {activeTab === 'overview' && <Dashboard setActiveTab={setActiveTab} />}

        {/* Quản lý học sinh: Chỉ GVCN được phép truy cập */}
        {activeTab === 'students' && (
          role === 'teacher' && isTeacherAuthenticated ? (
            <StudentManagement />
          ) : (
            <AccessGuard
              requiredRole="teacher"
              pageTitle="Quản lý Học sinh 12A7"
              onGoBack={() => setActiveTab('overview')}
            />
          )
        )}

        {/* Điểm danh & Chuyên cần */}
        {activeTab === 'attendance' && <AttendanceView />}

        {/* Điểm thi đua tuần: Mỗi học sinh mỗi tuần 100 điểm, trừ theo lỗi vi phạm */}
        {activeTab === 'discipline' && <DisciplineView />}

        {/* Bảng điểm tổng hợp tất cả 10 môn học: Chỉ dành cho GVCN */}
        {activeTab === 'grades' && (
          role === 'teacher' && isTeacherAuthenticated ? (
            <GradesView />
          ) : (
            <AccessGuard
              requiredRole="teacher"
              pageTitle="Bảng điểm Tổng hợp (10 Môn)"
              onGoBack={() => setActiveTab('overview')}
            />
          )
        )}

        {/* Hồ sơ cá nhân & Ảnh đại diện học sinh (Dành cho Học sinh & GVCN) */}
        {activeTab === 'profile' && (
          role === 'parent' ? (
            <AccessGuard
              requiredRole="student"
              pageTitle="Hồ sơ cá nhân học sinh"
              onGoBack={() => setActiveTab('overview')}
            />
          ) : (
            <StudentProfileView />
          )
        )}

        {/* Nhận xét học sinh: GVCN & Phụ huynh (Học sinh xem trong Dashboard/Bảng điểm cá nhân) */}
        {activeTab === 'evaluations' && (
          role === 'student' ? (
            <AccessGuard
              requiredRole="parent"
              pageTitle="Nhận xét từ GVCN & Sổ Liên Lạc"
              onGoBack={() => setActiveTab('overview')}
            />
          ) : (
            <EvaluationsView />
          )
        )}

        {/* Bảng xếp hạng Top 10: Dành cho GVCN & Học sinh */}
        {activeTab === 'leaderboard' && (
          role === 'parent' ? (
            <AccessGuard
              requiredRole="student"
              pageTitle="Bảng xếp hạng Top 10"
              onGoBack={() => setActiveTab('overview')}
            />
          ) : (
            <LeaderboardView />
          )
        )}

        {/* Thông báo & Báo bài */}
        {activeTab === 'announcements' && <AnnouncementsView />}

        {/* Góc Hạnh Phúc A7 (GVCN & Học sinh) */}
        {activeTab === 'happy_corner' && (
          role === 'parent' ? (
            <AccessGuard
              requiredRole="student"
              pageTitle="Góc Hạnh Phúc A7"
              onGoBack={() => setActiveTab('overview')}
            />
          ) : (
            <HappyCornerView />
          )
        )}

        {/* AI Trợ lý GVCN: Chỉ GVCN đã xác thực mật khẩu */}
        {activeTab === 'ai_assistant' && (
          role === 'teacher' && isTeacherAuthenticated ? (
            <AIAssistantView />
          ) : (
            <AccessGuard
              requiredRole="teacher"
              pageTitle="AI Trợ lý Giáo viên Chủ nhiệm"
              onGoBack={() => setActiveTab('overview')}
            />
          )
        )}

        {/* Thời khóa biểu */}
        {activeTab === 'timetable' && <TimetableView />}

        {/* Phân lịch trực nhật - Lớp phó Lao động & GVCN & Học sinh */}
        {activeTab === 'duty_schedule' && (
          role === 'parent' ? (
            <AccessGuard
              requiredRole="student"
              pageTitle="Trực nhật & Vệ sinh"
              onGoBack={() => setActiveTab('overview')}
            />
          ) : (
            <DutyScheduleView />
          )
        )}

        {/* Công cụ AI cho Học sinh & GVCN: Gia Sư & Cố Vấn Học Tập AI 12A7 */}
        {activeTab === 'student_ai' && (
          role === 'parent' ? (
            <AccessGuard
              requiredRole="student"
              pageTitle="Gia Sư AI 12A7"
              onGoBack={() => setActiveTab('overview')}
            />
          ) : (
            <StudentAITutorView />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600" />
            <span>
              <strong>{appConfig?.className || '12A7'} - Lớp Học Hạnh Phúc</strong> • {appConfig?.schoolName || 'THPT Vĩnh Lộc B'} • Năm học {appConfig?.schoolYear || '2026 - 2027'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-orange-600 italic">"{appConfig?.motto || 'Đoàn kết - Yêu thương - Cùng tiến bộ'}"</span>
            <span>•</span>
            <span className="text-slate-600 font-bold">{appConfig?.targetGoal || 'Đậu Tốt nghiệp & Đại học 100%'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Đã xảy ra lỗi hiển thị giao diện.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AppErrorBoundary caught error:', error, errorInfo);
  }

  handleResetAndReload = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto font-black text-xl">
              12A7
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Hệ thống Quản lý Lớp 12A7 - THPT Vĩnh Lộc B
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Phát hiện dữ liệu bộ nhớ trình duyệt cũ không tương thích ({this.state.errorMessage}). Nhấn nút bên dưới để khôi phục dữ liệu gốc mặc định của lớp 12A7.
            </p>
            <button
              onClick={this.handleResetAndReload}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Khôi phục dữ liệu mặc định & Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AppErrorBoundary>
  );
}
