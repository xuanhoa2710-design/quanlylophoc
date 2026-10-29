import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldCheck, AlertCircle, X, School } from 'lucide-react';

export const TeacherPasswordModal: React.FC = () => {
  const {
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    authenticateTeacher,
  } = useApp();

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isPasswordModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu GVCN');
      return;
    }

    const success = authenticateTeacher(password);
    if (success) {
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage('Mật khẩu không chính xác! Vui lòng liên hệ Thầy Trương Xuân Hòa.');
    }
  };

  const handleClose = () => {
    setPassword('');
    setErrorMessage('');
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shadow-inner text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold">
                <School className="w-3.5 h-3.5" />
                <span>THPT Vĩnh Lộc B • Lớp 12A7</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Xác thực Quyền GVCN
              </h3>
            </div>
          </div>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Khu vực quản trị dành riêng cho Giáo viên chủ nhiệm</div>
              <div className="text-amber-800/80 text-[11px] mt-0.5">
                Chỉ <strong>Thầy Trương Xuân Hòa</strong> mới có quyền truy cập hồ sơ 50 học sinh, điểm danh, nhập điểm và quản lý lớp học.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mật khẩu Giáo viên chủ nhiệm:
            </label>
            <div className="relative">
              <input
                type="password"
                autoComplete="current-password"
                autoFocus
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  errorMessage
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/30'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white'
                }`}
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Xác nhận & Mở khóa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
