import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfileModal } from './StudentProfileModal';
import {
  User,
  Camera,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Target,
  Award,
  BookOpen,
  Heart,
  Users,
  ShieldCheck,
  GraduationCap,
  Lock,
  Unlock,
  KeyRound,
} from 'lucide-react';
import { StudentPrivacyGuard } from './StudentPrivacyGuard';
import { StudentPasswordModal } from './StudentPasswordModal';

export const StudentProfileView: React.FC = () => {
  const { currentStudent, currentWeek, getStudentWeeklyScore, isStudentUnlocked, lockStudent } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!currentStudent) return null;

  // Privacy lock check: if locked, show StudentPrivacyGuard
  if (!isStudentUnlocked(currentStudent.id)) {
    return (
      <StudentPrivacyGuard
        student={currentStudent}
        title={`Hồ sơ cá nhân: ${currentStudent.name}`}
        subtitle="Thông tin cá nhân, liên lạc phụ huynh và kết quả học tập đã được khóa bảo mật."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      <StudentProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Password Setting Modal */}
      <StudentPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetStudent={currentStudent}
      />

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar and Basic info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white/80 shadow-2xl bg-white/20 flex items-center justify-center">
                {currentStudent.avatar ? (
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white/70" />
                )}
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>12A7 • THPT VĨNH LỘC B</span>
                </div>
                {currentStudent.classRole && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-md">
                    <Award className="w-3.5 h-3.5 text-amber-900" />
                    <span>{currentStudent.classRole}</span>
                  </div>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {currentStudent.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2 text-xs text-blue-100 font-medium">
                <span>Mã số: <strong className="text-white">{currentStudent.code}</strong></span>
                <span>•</span>
                <span>STT: <strong className="text-white">{currentStudent.stt}</strong></span>
                <span>•</span>
                <span>Tổ: <strong className="text-white">{currentStudent.group}</strong></span>
                <span>•</span>
                <span>Khẩu hiệu: <em>"Đoàn kết - Yêu thương - Cùng tiến bộ"</em></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 self-center md:self-auto">
            {currentStudent.pinCode ? (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1 px-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã bảo vệ PIN
                </span>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  title="Đổi mã PIN bảo vệ"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Đổi PIN
                </button>
                <button
                  onClick={() => lockStudent(currentStudent.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  title="Khóa ngay để bạn khác không xem được"
                >
                  <Lock className="w-3.5 h-3.5" /> Khóa ngay
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 hover:scale-105"
                title="Cài đặt mật khẩu để bạn khác không xem trộm thông tin"
              >
                <Lock className="w-4 h-4" /> Đặt mật khẩu bảo vệ
              </button>
            )}

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-105"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Thông tin cá nhân</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Sửa <Edit2 className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Giới tính:</span>
                <span className="font-bold text-slate-800">{currentStudent.gender}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-bold text-slate-800">{currentStudent.birthday}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Nơi sinh:</span>
                <span className="font-bold text-slate-800">{currentStudent.birthPlace}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Dân tộc:</span>
                <span className="font-bold text-slate-800">{currentStudent.ethnicity || 'Kinh'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Điện thoại cá nhân:</span>
                <span className="font-bold text-blue-700">{currentStudent.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">
                  {currentStudent.email || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="pt-1.5">
                <span className="text-slate-500 block mb-1">Địa chỉ thường trú:</span>
                <span className="font-semibold text-slate-700 block leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {currentStudent.address}
                </span>
              </div>
            </div>
          </div>

          {/* Family Contact */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-800">Thông tin Gia đình</h3>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Phụ huynh đại diện:</span>
                <span className="font-bold text-slate-800">{currentStudent.primaryParentName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">SĐT Phụ huynh:</span>
                <span className="font-bold text-emerald-700">{currentStudent.primaryParentPhone}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Họ tên Cha:</span>
                <span className="font-semibold text-slate-700">{currentStudent.parentFatherName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Họ tên Mẹ:</span>
                <span className="font-semibold text-slate-700">{currentStudent.parentMotherName || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Aspirations, Goals, Strengths & Baseline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aspirations & Exam Target */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Mục tiêu Ôn thi Tốt nghiệp THPT & Định hướng 2027
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Cập nhật mục tiêu <Edit2 className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                  Ước mơ nghề nghiệp
                </span>
                <p className="text-sm font-bold text-purple-950">
                  {currentStudent.dreamCareer || 'Đang định hướng chuyên sâu'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Tổ hợp 2 môn thi tự chọn
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
                    {currentStudent.examSubject1 || 'Vật lý'}
                  </span>
                  <span className="text-slate-400 font-bold">+</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                    {currentStudent.examSubject2 || 'Hóa học'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Điểm mạnh của em
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {currentStudent.strengths || 'Chưa cập nhật điểm mạnh.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-100 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Điểm cần rèn luyện thêm
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {currentStudent.weaknesses || 'Chưa cập nhật nội dung cần cải thiện.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-100 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 block mb-1">
                  Sở thích cá nhân
                </span>
                <p className="text-xs text-pink-950 font-medium">
                  {currentStudent.hobbies || 'Đang cập nhật sở thích.'}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Baseline Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-800">
                Thành tích & Kết quả rèn luyện
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Tổ sinh hoạt:</span>
                <span className="text-sm font-black text-slate-800">Tổ {currentStudent.group}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Tỷ lệ chuyên cần:</span>
                <span className="text-sm font-black text-emerald-600">{currentStudent.attendanceStats.rate}%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Điểm thi đua Tuần {currentWeek}:</span>
                <span className="text-sm font-black text-blue-600">
                  {getStudentWeeklyScore(currentStudent.id, currentWeek).total}đ
                  {getStudentWeeklyScore(currentStudent.id, currentWeek).isAdjustedByTeacher && (
                    <span className="text-[10px] ml-1 text-amber-600 font-bold block sm:inline">
                      (GVCN sửa)
                    </span>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Điểm phong trào:</span>
                <span className="text-sm font-black text-amber-600">{currentStudent.activityPoints} điểm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
