import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface StudentPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent?: Student;
  onSuccess?: () => void;
}

export const StudentPasswordModal: React.FC<StudentPasswordModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  onSuccess,
}) => {
  const {
    currentStudent,
    setStudentPin,
    removeStudentPin,
    resetStudentPinByTeacher,
    role,
    isTeacherAuthenticated,
  } = useApp();

  const student = targetStudent || currentStudent;

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const hasExistingPin = !!(student.pinCode && student.pinCode.trim().length > 0);
  const isTeacher = role === 'teacher' && isTeacherAuthenticated;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPin.trim().length < 4) {
      setError('Mật khẩu / Mã PIN phải có ít nhất 4 ký tự (khuyến khích 4-6 số dễ nhớ).');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    const res = setStudentPin(student.id, newPin, hasExistingPin && !isTeacher ? currentPin : undefined);
    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccessMsg(res.message);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const handleRemovePin = () => {
    setError(null);
    setSuccessMsg(null);

    const res = removeStudentPin(student.id, hasExistingPin && !isTeacher ? currentPin : undefined);
    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccessMsg('Đã xóa mật khẩu bảo vệ thành công!');
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 1000);
  };

  const handleTeacherReset = (defaultPin?: string) => {
    setError(null);
    const res = resetStudentPinByTeacher(student.id, defaultPin);
    setSuccessMsg(res.message);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {hasExistingPin ? 'Đổi mật khẩu bảo vệ cá nhân' : 'Cài đặt mật khẩu bảo vệ cá nhân'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Khóa hồ sơ và lịch sử hỏi đáp Gia sư AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Student Info Chip */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-300 bg-purple-100 flex items-center justify-center shrink-0">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-purple-700">{student.stt}</span>
            )}
          </div>
          <div className="truncate flex-1">
            <div className="font-bold text-sm text-slate-900 truncate">{student.name}</div>
            <div className="text-[11px] text-slate-500">
              {student.code} • {student.classRole || 'Học sinh'} • Tổ {student.group}
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              hasExistingPin ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {hasExistingPin
              ? isTeacher
                ? `🔒 PIN: ${student.pinCode}`
                : '🔒 Đã có mã PIN'
              : 'Chưa đặt PIN'}
          </span>
        </div>

        {/* Teacher Quick Reset Box */}
        {isTeacher && (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Quyền GVCN Reset Mật Khẩu Nhanh:
              </span>
              {hasExistingPin && (
                <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-amber-300 text-amber-900">
                  Pass hiện tại: {student.pinCode}
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Thầy Trương Xuân Hòa có thể đặt lại mật khẩu mặc định <strong>1234</strong> hoặc gỡ khóa hoàn toàn cho học sinh chỉ với 1 chạm:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTeacherReset('1234')}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5" /> Reset về "1234"
              </button>
              {hasExistingPin && (
                <button
                  type="button"
                  onClick={() => handleTeacherReset(undefined)}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" /> Gỡ bỏ mật khẩu
                </button>
              )}
            </div>
          </div>
        )}

        {/* Explain Notice */}
        <div className="mt-3 p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-purple-950 mb-0.5">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            Quyền riêng tư học sinh 12A7:
          </div>
          Khi đặt mật khẩu, các bạn học sinh khác sẽ không thể mở xem hồ sơ cá nhân (SĐT, gia đình, nguyện vọng) và các câu hỏi riêng tư bạn từng hỏi <strong>Gia Sư AI 12A7</strong>.
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
          {hasExistingPin && !isTeacher && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Nhập mật khẩu cũ để xác thực..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-hidden"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                {hasExistingPin ? 'Mật khẩu / Mã PIN mới' : 'Mật khẩu / Mã PIN bảo vệ'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPin ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="VD: 1234, 2009, pass của bạn (tối thiểu 4 ký tự)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Xác nhận lại mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Nhập lại mật khẩu mới để chắc chắn..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {hasExistingPin ? (
              <button
                type="button"
                onClick={handleRemovePin}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Gỡ bỏ mật khẩu bảo vệ"
              >
                <Trash2 className="w-3.5 h-3.5" /> Gỡ pass
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">Gợi ý: 4-6 chữ số</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Lưu mật khẩu
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
