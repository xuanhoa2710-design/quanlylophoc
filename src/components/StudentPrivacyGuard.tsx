import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Users,
  ChevronDown,
  Sparkles,
  KeyRound,
  School,
  CheckCircle2,
} from 'lucide-react';
import { StudentPasswordModal } from './StudentPasswordModal';

interface StudentPrivacyGuardProps {
  student: Student;
  title?: string;
  subtitle?: string;
  onUnlocked?: () => void;
}

export const StudentPrivacyGuard: React.FC<StudentPrivacyGuardProps> = ({
  student,
  title = 'Khu Vực Riêng Tư & Bảo Mật Cá Nhân',
  subtitle = 'Thông tin hồ sơ và những vấn đề trao đổi với Gia sư AI đã được khóa bảo mật.',
  onUnlocked,
}) => {
  const {
    students,
    setActiveStudentId,
    unlockStudent,
    role,
    isTeacherAuthenticated,
  } = useApp();

  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  const isTeacher = role === 'teacher' && isTeacherAuthenticated;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!enteredPin.trim()) {
      setError('Vui lòng nhập mật khẩu hoặc mã PIN của bạn.');
      return;
    }

    const success = unlockStudent(student.id, enteredPin);
    if (success) {
      if (onUnlocked) onUnlocked();
    } else {
      setError('Mật khẩu không chính xác! Vui lòng thử lại.');
      setEnteredPin('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setEnteredPin((prev) => prev.slice(0, -1));
      setError(null);
    } else if (val === 'clear') {
      setEnteredPin('');
      setError(null);
    } else {
      setEnteredPin((prev) => (prev.length < 12 ? prev + val : prev));
      setError(null);
    }
  };

  return (
    <div className="min-h-[480px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Lock Shield Icon */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-amber-950 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Student identification badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold mb-3">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-purple-200 flex-shrink-0">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-purple-700 flex items-center justify-center h-full">
                {student.stt}
              </span>
            )}
          </div>
          <span className="font-bold">{student.name}</span>
          <span className="text-purple-400">•</span>
          <span>{student.code}</span>
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-1">{title}</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-5">
          {subtitle}
        </p>

        {/* Demo Hint for sample hs-27 */}
        {student.id === 'hs-27' && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mật khẩu mẫu của Lớp trưởng Ái Ly là: <strong className="font-mono font-bold text-amber-800">1234</strong></span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-1.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN / Password Input Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative max-w-xs mx-auto">
            <input
              type={showPin ? 'text' : 'password'}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setError(null);
              }}
              placeholder="Nhập mã PIN / Mật khẩu..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-center font-mono text-lg font-bold tracking-widest text-slate-800 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-hidden transition-all shadow-inner"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title={showPin ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Touch Keypad for Mobile / Tablet / Touchscreens */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 active:bg-purple-100 text-slate-800 hover:text-purple-700 font-bold text-base transition-colors border border-slate-100 shadow-2xs active:scale-95"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeypadPress('clear')}
              className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-medium text-xs transition-colors border border-slate-100 active:scale-95"
            >
              Xóa hết
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 active:bg-purple-100 text-slate-800 hover:text-purple-700 font-bold text-base transition-colors border border-slate-100 shadow-2xs active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('backspace')}
              className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs transition-colors border border-slate-100 active:scale-95"
            >
              ⌫ Xóa
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full max-w-xs mx-auto py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Unlock className="w-4 h-4" /> Mở khóa hồ sơ & Gia sư AI
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          {/* Switch Student Option */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStudentPicker(!showStudentPicker)}
              className="text-xs text-slate-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Không phải bạn {student.name}? Chọn học sinh khác</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showStudentPicker && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/10 z-50 text-left">
                <div className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                  Chọn học sinh của bạn trong 12A7:
                </div>
                <div className="mt-2 max-h-52 overflow-y-auto space-y-1 pr-1">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveStudentId(s.id);
                        setShowStudentPicker(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                        s.id === student.id
                          ? 'bg-purple-100 text-purple-900 font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">
                        {s.stt}. {s.name}
                      </span>
                      {s.pinCode && <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teacher Bypass or Help */}
          <div className="text-[11px] text-slate-400 leading-tight">
            Quên mật khẩu? Vui lòng nhờ GVCN <strong>Thầy Trương Xuân Hòa</strong> hỗ trợ cấp lại.
          </div>

          {isTeacher && (
            <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <span className="flex items-center gap-1.5 font-bold">
                <School className="w-4 h-4 text-amber-700" />
                Quyền GVCN:
              </span>
              <button
                onClick={() => {
                  unlockStudent(student.id, student.pinCode || '');
                  if (onUnlocked) onUnlocked();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors"
              >
                Mở khóa trực tiếp
              </button>
            </div>
          )}
        </div>
      </div>

      <StudentPasswordModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        targetStudent={student}
        onSuccess={() => {
          if (onUnlocked) onUnlocked();
        }}
      />
    </div>
  );
};
