import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ClassAppConfig } from '../types';
import {
  Settings,
  X,
  Save,
  RotateCcw,
  Upload,
  Sparkles,
  School,
  User,
  Phone,
  Mail,
  Heart,
  Target,
  CheckCircle2,
} from 'lucide-react';

export const AppConfigModal: React.FC = () => {
  const {
    isAppConfigModalOpen,
    setIsAppConfigModalOpen,
    appConfig,
    updateAppConfig,
    resetAppConfig,
  } = useApp();

  const [formData, setFormData] = useState<ClassAppConfig>(appConfig);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    setFormData(appConfig);
  }, [appConfig, isAppConfigModalOpen]);

  if (!isAppConfigModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Vui lòng chọn ảnh dung lượng dưới 5MB.');
        setTimeout(() => setErrorMessage(null), 3500);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData((prev) => ({ ...prev, teacherAvatar: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppConfig(formData);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setIsAppConfigModalOpen(false);
    }, 1200);
  };

  const handleConfirmReset = () => {
    resetAppConfig();
    setShowConfirmReset(false);
    setIsAppConfigModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-orange-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Chỉnh Sửa Thông Tin Lớp Học & GVCN
              </h3>
              <p className="text-xs text-blue-100">
                Thầy Trương Xuân Hòa • Tùy biến thông điệp, khẩu hiệu và liên hệ toàn app
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAppConfigModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {/* Section 1: Thông tin Lớp & Trường */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-blue-900 flex items-center gap-2 pb-1 border-b border-slate-100">
              <School className="w-4 h-4 text-blue-600" />
              1. Thông tin Tập thể Lớp & Trường học
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên trường:</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Năm học:</label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phòng học & Vị trí:</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Section 2: Khẩu hiệu & Mục tiêu */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-orange-900 flex items-center gap-2 pb-1 border-b border-slate-100">
              <Target className="w-4 h-4 text-orange-600" />
              2. Khẩu hiệu, Triết lý & Mục tiêu Lớp
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Khẩu hiệu lớp (Slogan):</label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-orange-700"
                  placeholder="Ví dụ: Đoàn kết - Yêu thương - Cùng tiến bộ"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phương châm truyền cảm hứng:</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-blue-700"
                  placeholder="Ví dụ: Dream Big And Dare To Fail"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mục tiêu quyết tâm tốt nghiệp & Đại học:</label>
              <input
                type="text"
                value={formData.targetGoal}
                onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-rose-600"
                placeholder="Ví dụ: Quyết tâm đậu TN & ĐH 100%"
                required
              />
            </div>
          </div>

          {/* Section 3: Thông tin GVCN */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2 pb-1 border-b border-slate-100">
              <User className="w-4 h-4 text-emerald-600" />
              3. Thông tin Giáo Viên Chủ Nhiệm (Thầy Trương Xuân Hòa)
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={formData.teacherAvatar}
                alt={formData.teacherName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500 shadow-md"
              />
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <div className="font-bold text-slate-800">Ảnh đại diện GVCN</div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Tải ảnh từ máy tính
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên GVCN:</label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chức danh / Bộ môn:</label>
                <input
                  type="text"
                  value={formData.teacherTitle}
                  onChange={(e) => setFormData({ ...formData, teacherTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ:</label>
                <input
                  type="text"
                  value={formData.teacherPhone}
                  onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email GVCN:</label>
                <input
                  type="email"
                  value={formData.teacherEmail}
                  onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Zalo liên hệ:</label>
                <input
                  type="text"
                  value={formData.teacherZalo}
                  onChange={(e) => setFormData({ ...formData, teacherZalo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Lời nhắn gửi đầu năm của GVCN tới học sinh & phụ huynh:
              </label>
              <textarea
                rows={3}
                value={formData.teacherMessage}
                onChange={(e) => setFormData({ ...formData, teacherMessage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 leading-relaxed font-medium"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Confirm Reset Dialog */}
          {showConfirmReset && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2">
              <p className="font-bold">Bạn có chắc chắn muốn khôi phục toàn bộ thông tin lớp học và GVCN về mặc định ban đầu?</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmReset}
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

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mặc định
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAppConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" /> Lưu Thay Đổi
              </button>
            </div>
          </div>
        </form>

        {/* Toast */}
        {showToast && (
          <div className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span className="font-bold text-xs">Đã lưu thông tin Lớp & GVCN thành công!</span>
          </div>
        )}
      </div>
    </div>
  );
};
