import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldAlert, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

interface AccessGuardProps {
  requiredRole: 'teacher' | 'student' | 'parent';
  pageTitle: string;
  onGoBack?: () => void;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({
  requiredRole,
  pageTitle,
  onGoBack,
}) => {
  const { role, isTeacherAuthenticated, authenticateTeacher } = useApp();
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlockTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    const success = authenticateTeacher(passwordInput);
    if (!success) {
      setErrorMsg('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  if (requiredRole === 'teacher' && (!isTeacherAuthenticated || role !== 'teacher')) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-red-200/80 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
            KHU VỰC BẢO MẬT GVCN
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            Yêu Cầu Mật Khẩu Giáo Viên Chủ Nhiệm
          </h2>
          <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Trang <strong>"{pageTitle}"</strong> chỉ dành riêng cho <strong>Thầy Trương Xuân Hòa</strong>.
            Học sinh và phụ huynh không có quyền truy cập trang này.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Quy định bảo mật lớp 12A7:
            </p>
            <p className="mt-1 text-slate-700">
              Để bảo vệ thông tin cá nhân của 50 học sinh và giữ tính minh bạch trong quản lý lớp học,
              chỉ có Giáo viên chủ nhiệm mới có quyền thao tác quản lý, điểm danh và chỉnh sửa điểm số.
            </p>
          </div>

          <form onSubmit={handleUnlockTeacher} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nhập mật khẩu GVCN để mở khóa trang này:
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    errorMsg
                      ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {onGoBack && (
                <button
                  type="button"
                  onClick={onGoBack}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay về Dashboard</span>
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 ml-auto"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Xác nhận quyền GVCN</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If student trying to access parent portal
  if (requiredRole === 'parent' && role === 'student') {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-orange-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
            KHÔNG CÓ QUYỀN TRUY CẬP
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            Trang Này Dành Riêng Cho Phụ Huynh
          </h2>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Học sinh không được phép truy cập kênh trao đổi trực tiếp hoặc sổ liên lạc riêng tư giữa Phụ huynh và Giáo viên chủ nhiệm.
          </p>
        </div>

        <div className="p-8 text-center space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Mỗi kênh liên lạc được bảo mật riêng biệt giữa gia đình từng học sinh và Thầy Trương Xuân Hòa.
            Vui lòng quay lại Cổng Học Sinh để xem bài tập, thời khóa biểu và điểm số của em.
          </p>

          {onGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về Dashboard Học Sinh</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // If parent trying to access student-exclusive portal (like homework submission)
  if (requiredRole === 'student' && role === 'parent') {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
            KHU VỰC HỌC SINH
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            Trang Này Dành Riêng Cho Học Sinh
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Phụ huynh không có quyền nộp bài tập thay học sinh. Quý phụ huynh có thể theo dõi kết quả và nhận xét của con tại tab "Bảng điểm" và "Nhận xét GVCN".
          </p>
        </div>

        <div className="p-8 text-center space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Học sinh tự lập nộp bài và nhận phản hồi trực tiếp từ thầy cô bộ môn và GVCN.
          </p>

          {onGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về Sổ Liên Lạc Phụ Huynh</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
