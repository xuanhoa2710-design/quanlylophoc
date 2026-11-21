import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Phone,
  UserCheck,
  Lock,
  AlertCircle,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export const ParentAccessGuard: React.FC = () => {
  const { verifyParentAccess, setRole } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [studentNameHint, setStudentNameHint] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = verifyParentAccess(identifier, studentNameHint);
    if (!result.success) {
      setErrorMsg(result.error || 'Thông tin xác minh chưa chính xác.');
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 sm:my-10 bg-white rounded-3xl border border-orange-200/90 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
          <Lock className="w-3 h-3" /> Sổ Liên Lạc Riêng Tư 12A7
        </span>
        <h2 className="text-xl sm:text-2xl font-black mt-2">
          Xác Minh Phụ Huynh Học Sinh
        </h2>
        <p className="text-orange-100 text-xs sm:text-sm mt-1 leading-relaxed">
          Để bảo mật thông tin cá nhân, mỗi Phụ huynh chỉ được xem duy nhất thông tin chuyên cần, điểm thi đua và nhận xét của con em mình.
        </p>
      </div>

      {/* Verification Form */}
      <div className="p-6 sm:p-7 space-y-5">
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed">
          <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
            <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
            Cách tra cứu nhanh cho Quý Phụ huynh:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-700">
            <li>
              Nhập <strong>Số điện thoại Phụ huynh</strong> đã đăng ký với lớp (VD: <code className="px-1 py-0.5 rounded bg-white border border-amber-200 font-mono text-[11px]">0979296050</code>), <strong>HOẶC</strong>
            </li>
            <li>
              Nhập <strong>Mã số học sinh</strong> của con (VD: <code className="px-1 py-0.5 rounded bg-white border border-amber-200 font-mono text-[11px]">12A7-01</code>, <code className="px-1 py-0.5 rounded bg-white border border-amber-200 font-mono text-[11px]">12A7-27</code>), <strong>HOẶC</strong>
            </li>
            <li>
              Nhập <strong>Họ tên con</strong> kèm <strong>4 số cuối SĐT Phụ huynh</strong>.
            </li>
          </ul>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Số điện thoại Phụ huynh hoặc Mã học sinh *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="VD: 0979296050 hoặc 12A7-01 hoặc 4 số cuối SĐT..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-hidden transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Họ và tên con <span className="font-normal text-slate-400">(chỉ cần điền nếu dùng 4 số cuối SĐT)</span>
            </label>
            <input
              type="text"
              value={studentNameHint}
              onChange={(e) => {
                setStudentNameHint(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="VD: Vũ Trịnh Bảo An"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Vào Sổ Liên Lạc Của Con</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>
            Cần hỗ trợ? Liên hệ GVCN <strong>Thầy Trương Xuân Hòa</strong>
          </span>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Chuyển sang Cổng Học sinh
          </button>
        </div>
      </div>
    </div>
  );
};
